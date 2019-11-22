import EventEmitter from "events";
import { AppState } from "react-native";

import NetworkManager from "./NetworkManager";
import DatabaseManager from "./DatabaseManager";
import LocationManager from "./LocationManager";
import SettingsManager from "./SettingsManager";

import Canteen from "../classes/Canteen";
import Coordinate from "../classes/Coordinate";
import Util from "../classes/Util";

// manager instances
const networkManager = NetworkManager.instance;
const databaseManager = DatabaseManager.instance;
const locationManager = LocationManager.instance;
const settingsManager = SettingsManager.instance;

const PREFETCH_RADIUS = LocationManager.CANTEEN_DISTANCE_THRESHOLDS.VERY_FAR;
var prefetching = false;

const LAST_PREFETCH_POSITION_SETTING_KEY = "lastPrefetchedCanteensAt";

/** @typedef {{ canteen: Canteen, distance: number }} CanteenWithDistance */

/**
 * This singleton is responseble for tasks that are related with canteens.
 * This includes:
 * 
 * - Tracking canteens that are nearby
 * - Prefetching canteens depending on network/ current position
 * - Loading and saving canteens with the database manager
 * 
 * Emits: "canteensChanged"
 * Params: currentSurroundingCanteens, lastSurroundingCanteens
 * Gets fired when the surrounding canteens or their distance changed. 
 * The first parameter is an array of the current surrounding canteens,
 * the second contains the surrounding canteens before this event was emitted.
 */
export default class CanteenManager extends EventEmitter {

    constructor() {
        super();
        if (CanteenManager._instance) throw new Error("This is a singleton! Use CanteenManager.instance to access this class instance.");

        /** The position at which the canteens were preloaded the last time */
        this.lastPrefetchedCanteensAt = {
            coordinate: new Coordinate(0, 0),
            timestamp: 0,
            distance: 0
        };

        /**
         * @type {CanteenWithDistance[]} An array with canteens that are
         * within a certain distance, ordered by the distance ascending
         */
        this.surroundingCanteens = [];
        /** The distance in km in which the canteens are loaded from cache into the surroundingCateens array */
        this.canteenTrackingRadius = LocationManager.CANTEEN_DISTANCE_THRESHOLDS.MODERATE;

        /** @type {Map<number, Canteen>} */
        this.canteens = new Map();
    }

    /** All known canteens */
    get canteensArray() {
        return Array.from( this.canteens.values() );
    }
    
    /**
     * @returns {CanteenManager} The instance of the canteen manager singleton
     */
    static get instance() {
        if (!CanteenManager._instance) CanteenManager._instance = new CanteenManager();
        return CanteenManager._instance;
    }

    /**
     * Calls all functions that are required to run before using this manager class.
     * 
     * Loads all persisted canteens from the database into the cache.
     */
    async initialize() {        
        await Promise.all([

            // load all persisted canteens
            (async () => {
                this.canteens = new Map( (await this.loadCanteens()).map( c => [c.id, c] ) );
            })(),

            // load last prefetch position
            (async () => {
                const lastPrefetchedCanteensAt = await settingsManager.getSetting(LAST_PREFETCH_POSITION_SETTING_KEY, "object");
                if (lastPrefetchedCanteensAt !== null) {
                    lastPrefetchedCanteensAt.coordinate === Coordinate.fromObject(lastPrefetchedCanteensAt.coordinate);
                    this.lastPrefetchedCanteensAt = lastPrefetchedCanteensAt;
                    console.log("Restored last prefetch position of canteens");
                }
            })()

        ]);
    }

    /**
     * To be called after the app was initialized
     */
    setEventHooks() {
        // load cached canteens near by
        locationManager.on("position", this._onPositionOrNetworkChanged.bind(this));
        networkManager.on("networkStateChanged", this._onPositionOrNetworkChanged.bind(this));

        // update the surrounding canteens whenever a new position comes in
        locationManager.on("position", this.updateSurroundingCanteens.bind(this) );

        // persist when app is closed so it can be loaded when the app is initialized the next time
        AppState.addEventListener("change", state => {
            if (state === "inactive" && this.lastPrefetchedCanteensAt.timestamp !== 0)
                settingsManager.storeSetting(LAST_PREFETCH_POSITION_SETTING_KEY, this.lastPrefetchedCanteensAt);
        });
    }

    /**
     * Callback. Might prefetch canteens and updates the surrounding canteens then
     */
    async _onPositionOrNetworkChanged() {
        if (await this.maybePrefetchCanteens()) await this.updateSurroundingCanteens();
    }

    /**
     * Updates the surroundingCanteens array by the current device position
     */
    async updateSurroundingCanteens() {
        try {
            const lastSurroundingCanteens = this.surroundingCanteens;

            // get the canteens that are near by
            const canteens = await this.getCanteensByPosition(locationManager.lastDevicePosition.coordinate, this.canteenTrackingRadius);
            this.surroundingCanteens = canteens.sort( (a, b) => a.distance < b.distance ? 1 : a.distance > b.distance ? -1 : 0 );
            
            // if any canteens or their distance changed => emit event
            if (
                lastSurroundingCanteens.length !== this.surroundingCanteens.length ||
                lastSurroundingCanteens.some(
                    c1 => this.surroundingCanteens.findIndex( c2 => c1.canteen.id === c2.canteen.id && c1.distance === c2.distance ) === -1
                )
            ) {
                console.log("Canteens or their distance changed");
                this.emit("canteensChanged", this.surroundingCanteens, lastSurroundingCanteens);
            }
        } catch(e) {
            console.error("Could not load the surrounding canteens from the database:", e);
        }
    }

    /**
     * Tries to prefetch the canteens within a 50km radius if the following conditions apply:
     * 
     * - we have the position of the device
     * - the network traffic is unlimited
     * - the network speed is fast
     * - we did not prefetch yet or the last prefetch is out of range
     */
    async maybePrefetchCanteens() {

        if (prefetching) return false;
        prefetching = true;

        try {

            const curPos = locationManager.lastDevicePosition.coordinate;

            if (
                // we have the position of the device
                locationManager.lastDevicePosition.timestamp !== 0 &&
                // the traffic is unlimited
                networkManager.networkState.trafficLimit === NetworkManager.NETWORK_TRAFFIC_LIMIT.UNLIMITED &&
                // the network speed is fast
                networkManager.networkState.speed === NetworkManager.NETWORK_SPEED.FAST &&
                // we did not prefetch yet or the last prefetch is out of range
                (
                    this.lastPrefetchedCanteensAt.timestamp === 0 ||
                    Coordinate.calcDistance(
                        this.lastPrefetchedCanteensAt.coordinate, curPos
                    ) > (PREFETCH_RADIUS - (this.canteenTrackingRadius * 2))
                )
            ) {
                try {
                    console.log("Prefetching canteens...");

                    // fetch canteens from OpenMensa and persist them
                    await this.saveCanteens( await this.fetchCanteens( curPos, LocationManager.CANTEEN_DISTANCE_THRESHOLDS.VERY_FAR ) );

                    // update last prefetch position
                    this.lastPrefetchedCanteensAt.timestamp = Util.currentUnixTimestamp;
                    this.lastPrefetchedCanteensAt.coordinate = curPos;

                    // return true
                    prefetching = false;
                    return true;
                } catch(e) {
                    console.log("Could not prefetch canteens:", e);
                }
            }

        } catch(e) {
            console.error("Unexpected error while checking the prefetch conditions:", e);
        }

        prefetching = false;
        return false;
        
    }

    /**
     * Fetches canteen in a given radius around a given position
     * @param {Coordinate} position The position to find canteens from
     * @param distance Default: 50. The maximum distance in km to the given position a returned canteen can have
     */
    async fetchCanteens( position, distance = 50 ) {
        if (!(position instanceof Coordinate)) throw new TypeError("The position be a coordinate!");

        // fetch from OpenMensa API
        const res = await networkManager.fetchWithParams(
            NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens`,
            {
                "near[lat]": position.latitude,
                "near[lng]": position.longitude,
                "near[dist]": distance
            }
        );
        if (!res.ok) throw new Error(`Network request failed (${res.status}${res.statusText ? " " + res.statusText : ""}`);

        /** @type {import("../classes/Canteen").CanteenObj[]} */
        const canteenObjs = await res.json();

        console.log(`Fetched ${canteenObjs.length} canteens`);
        return canteenObjs.map( c => Canteen.fromObject( c ) );
    }

    /**
     * Saves the given array of canteens in the database and adds the to the cache
     * @param {Canteen[]} canteens The canteens to save
     */
    async saveCanteens( canteens ) {
        if (canteens.length === 0) return;

        // update cache
        canteens.forEach( c => this.canteens.set(c.id, c) );

        // store in db
        await databaseManager.runInTransaction(
            canteens.map( c =>
                [DatabaseManager.STATEMENTS.INSERT_INTO_CANTEENS, c.id, c.name, c.city, c.address, c.coordinate.latitude, c.coordinate.longitude]
            )
        );
    }

    /**
     * Calculates the distances to all canteens and returns them 
     * @param {Coordinate} position The position to load cached canteens from
     * @param distance Default: 7.5. The search radius around the given position in km 
     */
    getCanteensByPosition( position, distance = 7.5 ) {
        return this.canteensArray
            .map( c => ({ canteen: c, distance: Coordinate.calcDistance( c.coordinate, position ) }) )
            .filter( c => c.distance <= distance );
    }

    /**
     * Loads all persisted canteens from the database
     */
    async loadCanteens() {
        const rows = await databaseManager.getAll(DatabaseManager.STATEMENTS.LOAD_ALL_CANTEENS);
        return rows.map( r => Canteen.fromDatabase(r) );
    }

}