import EventEmitter from "events";
import { AppState } from "react-native";

import NetworkManager from "./NetworkManager";
import DatabaseManager from "./DatabaseManager";
import LocationManager from "./LocationManager";
import SettingsManager, { Setting } from "./SettingsManager";

import Canteen from "../classes/Canteen";
import Coordinate from "../classes/Coordinate";
import Util from "../classes/Util";

// manager instances
const networkManager = NetworkManager.instance;
const databaseManager = DatabaseManager.instance;
const locationManager = LocationManager.instance;
const settingsManager = SettingsManager.instance;

var prefetching = false;

const LAST_PREFETCH_POSITION_SETTING_KEY = "lastPrefetchedCanteensAt";
const DEFAULT_PREFETCH_POSITION = {
    coordinate: new Coordinate(0, 0),
    timestamp: 0,
    distance: 0
};

/**
 * @type {[number, string][]} An array containing [distance, state] pairs in descending order.
 * The state is a string as in LocationManager.CANTEEN_DISTANCE_THRESHOLDS
 */
const SORTED_DISTANCE_STATES = Object.keys(LocationManager.CANTEEN_DISTANCE_THRESHOLDS)
    .map( k => [LocationManager.CANTEEN_DISTANCE_THRESHOLDS[k], k] )
    .sort( ([d1], [d2]) => d2 - d1 );

/** @typedef {{ canteen: Canteen, distance: number }} CanteenWithDistance */
/** @typedef {"INSIDE" | "VERY_CLOSE" | "NEAR_BY" | "MODERATE" | "FAR" | "VERY_FAR"} LocationContext */

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
 * 
 * Emits: "locationContextChanged"
 * Params: currentLocationContext, lastLocationContext
 * The parameters are of type LocationContext (string enum).
 * Gets fired when distance to the closest canteen reaches a new contextual location.
 * See LocationManager.CANTEEN_DISTANCE_THRESHOLDS for the distances.
 */
export default class CanteenManager extends EventEmitter {

    constructor() {
        super();
        if (CanteenManager._instance) throw new Error("This is a singleton! Use CanteenManager.instance to access this class instance.");

        /** The position at which the canteens were preloaded the last time */
        this.lastPrefetchedCanteensAt = DEFAULT_PREFETCH_POSITION;

        /**
         * @type {CanteenWithDistance[]} An array with canteens that are
         * within a certain distance, ordered by the distance ascending
         */
        this.surroundingCanteens = [];
        /** The distance in km in which the canteens are loaded from cache into the surroundingCateens array */
        this.canteenTrackingRadius = LocationManager.CANTEEN_DISTANCE_THRESHOLDS.MODERATE;
        /** @type {LocationContext} */
        this.currentLocationContext = "VERY_FAR";

        /** @type {Map<number, Canteen>} */
        this.canteens = new Map();
    }

    /** All known canteens */
    get canteensArray() {
        return Array.from( this.canteens.values() );
    }

    /** Returns the closest canteen with its distance or null if none in range */
    get nearestCanteen() {
        return this.surroundingCanteens[0] || null;
    }

    /** Returns the distance to the closest canteen or POSITIVE_INFINITY if none in range */
    get nearestCanteenDistance() {
        return this.nearestCanteen?.distance || Number.POSITIVE_INFINITY;
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
        //this.clearLastPrefetchPosition();

        // load all persisted canteens
        this.canteens = new Map( (await this.loadCanteens()).map( c => [c.id, c] ) );

        // restore last prefetch position
        const lastPrefetchedCanteensAt = settingsManager.getSetting(LAST_PREFETCH_POSITION_SETTING_KEY).value;
        if (lastPrefetchedCanteensAt != null) {

            // convert coordinate object to Coordinate Class instance
            lastPrefetchedCanteensAt.coordinate = Coordinate.fromObject(lastPrefetchedCanteensAt.coordinate);
            this.lastPrefetchedCanteensAt = lastPrefetchedCanteensAt;
            console.log("Restored last prefetch position of canteens");

        }
    }

    /**
     * Clears the last prefetch position. It will be prefetched on the
     * next possible moment after that
     */
    clearLastPrefetchPosition() {
        settingsManager.deleteSetting(LAST_PREFETCH_POSITION_SETTING_KEY);
        this.lastPrefetchedCanteensAt = DEFAULT_PREFETCH_POSITION;
    }

    /**
     * To be called after the app was initialized
     */
    setEventHooks() {
        // load cached canteens near by
        locationManager.on("position", this._onPositionOrNetworkChanged.bind(this));
        networkManager.on("networkStateChanged", this._onPositionOrNetworkChanged.bind(this));

        // update the surrounding canteens whenever a new position comes in
        locationManager.on("position", this._updateSurroundingCanteens.bind(this));
        locationManager.on("position", this._updateLocationContext.bind(this));

        // persist when app is closed so it can be loaded when the app is initialized the next time
        AppState.addEventListener("change", state => {
            if (state === "inactive" && this.lastPrefetchedCanteensAt.timestamp !== 0)
                settingsManager.storeSetting(new Setting(LAST_PREFETCH_POSITION_SETTING_KEY, this.lastPrefetchedCanteensAt));
        });
    }

    /**
     * Checks the distance to the closest canteen and "categorizes" it after the distances in
     * LocationManager.CANTEEN_DISTANCE_THRESHOLDS. Fires "locationContextChanged" event if it changed.
     */
    _updateLocationContext() {
        const lastState = this.currentLocationContext;
        this.currentLocationContext = SORTED_DISTANCE_STATES.find( ([d]) => this.nearestCanteenDistance >= d )[1];
        if (lastState !== this.currentLocationContext) {
            console.log(`Distance state changed from "${lastState}" to "${this.currentLocationContext}"`);
            this.emit("locationContextChanged", this.currentLocationContext, lastState);
        }
    }

    /**
     * Callback. Might prefetch canteens and updates the surrounding canteens then
     */
    async _onPositionOrNetworkChanged() {
        if (await this.maybePrefetchCanteens()) await this._updateSurroundingCanteens();
    }

    /**
     * Updates the surroundingCanteens array by the current device position
     */
    async _updateSurroundingCanteens() {
        try {
            if (locationManager.lastDevicePosition.timestamp === 0) return;
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
                    ) > (this.lastPrefetchedCanteensAt.distance - this.canteenTrackingRadius)
                )
            ) {
                try {
                    console.log("Prefetching canteens...");
                    const prefetchRadius = this.canteenTrackingRadius*7.5;

                    // fetch canteens from OpenMensa and persist them
                    await this.saveCanteens( await this.fetchCanteens() );

                    // update last prefetch position
                    this.lastPrefetchedCanteensAt.timestamp = Util.currentUnixTimestamp;
                    this.lastPrefetchedCanteensAt.coordinate = curPos;
                    this.lastPrefetchedCanteensAt.distance = prefetchRadius;

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
     * Fetches canteens
     */
    async fetchCanteens() {

        // fetch from OpenMensa API
        const res = await networkManager.fetchWithParams( NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens` );
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