import EventEmitter from "events";

import NetworkManager from "./NetworkManager";
import DatabaseManager from "./DatabaseManager";
import LocationManager from "./LocationManager";

import Canteen from "../classes/Canteen";
import Coordinate from "../classes/Coordinate";
import Util from "../classes/Util";

// manager instances
const networkManager = NetworkManager.instance;
const databaseManager = DatabaseManager.instance;
const locationManager = LocationManager.instance;

const PREFETCH_RADIUS = LocationManager.CANTEEN_DISTANCE_THRESHOLDS.VERY_FAR;
var prefetching = false;

/**
 * This singleton is responseble for tasks that are related with canteens.
 * This includes:
 * 
 * - Tracking canteens that are nearby
 * - Prefetching canteens depending on network/ current position
 * - Loading and saving canteens with the database manager
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
         * @type {{ canteen: Canteen, distance: number }[]} An array with canteens that are
         * within a certain distance, ordered by the distance ascending
         */
        this.surroundingCanteens = [];
        /** The distance in km in which the canteens are loaded from cache into the surroundingCateens array */
        this.canteenTrackingRadius = LocationManager.CANTEEN_DISTANCE_THRESHOLDS.FAR;

        // load cached canteens near by
        locationManager.on("position", async () => {
            if (await this.maybePrefetchCanteens()) await this.updateSurroundingCanteens();
        });

        networkManager.on("networkStateChanged", this.maybePrefetchCanteens.bind(this));

    }
    
    /**
     * @returns {CanteenManager} The instance of the canteen manager singleton
     */
    static get instance() {
        if (!CanteenManager._instance) CanteenManager._instance = new CanteenManager();
        return CanteenManager._instance;
    }

    async updateSurroundingCanteens() {
        try {
            // get the canteens that are near by
            this.surroundingCanteens = await this.loadCanteens(locationManager.lastDevicePosition.coordinate, this.canteenTrackingRadius);
            this.surroundingCanteens.sort( (a, b) => a.distance < b.distance ? 1 : a.distance > b.distance ? -1 : 0 );
            this.emit("canteensChanged", this.surroundingCanteens);
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
                        this.lastPrefetchedCanteensAt.coordinate, locationManager.lastDevicePosition.coordinate
                    ) > (PREFETCH_RADIUS - (this.canteenTrackingRadius * 2))
                )
            ) {
                try {
                    console.log("Prefetching canteens...");
                    await this.saveCanteens( await this.fetchCanteens( locationManager.lastDevicePosition.coordinate, LocationManager.CANTEEN_DISTANCE_THRESHOLDS.VERY_FAR ) );
                    this.lastPrefetchedCanteensAt.timestamp = Util.currentUnixTimestamp;
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

        /** @type {import("../classes/Canteen").CanteenObj[]} */
        const canteenObjs = await networkManager.fetchWithParams(
            NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens`,
            {
                "near[lat]": position.latitude,
                "near[lng]": position.longitude,
                "near[dist]": distance
            }
        );

        return canteenObjs.map( c => Canteen.fromObject( c ) );
    }

    /**
     * Saves the given array of canteens in the database
     * @param {Canteen[]} canteens The canteens to save
     */
    async saveCanteens( canteens ) {
        await databaseManager.runInTransaction(
            canteens.map( c =>
                [DatabaseManager.STATEMENTS.INSERT_INTO_CANTEENS, c.id, c.name, c.city, c.address, c.coordinate.latitude, c.coordinate.longitude]
            )
        );
    }

    /**
     * Loads all cached (persisted) canteens from the database. A search region can be passed.
     * If so, the canteens are returned with their distance to the given position
     * @param {Coordinate} position Optional: The position to load cached canteens from.
     * If none given, all canteens will be returned
     * @param distance Default: 7.5. The search radius around the given position in km 
     */
    async loadCanteens( position = null, distance = 7.5 ) {
        /** @type {import("../classes/Canteen").CanteenDatabaseRow[]} */
        let rows = [];

        if (position == null) {
            rows = await databaseManager.getAll(DatabaseManager.STATEMENTS.LOAD_ALL_CANTEENS);
            return rows.map( r => Canteen.fromDatabase(r) );
        } else {
            const boundingBox = Coordinate.getBoundingCoordinates( position, distance );
            rows = await databaseManager.getAll(
                DatabaseManager.STATEMENTS.LOAD_CANTEENS_BETWEEN_COORDINATES,
                [boundingBox[0].latitude, boundingBox[1].latitude, boundingBox[0].longitude, boundingBox[1].longitude]
            );

            // sadly SQLite does not have any SQRT() function, so we have to do further filtering here
            return rows
                .map( r => ({ canteen: Canteen.fromDatabase(r), distance: Coordinate.calcDistance( Coordinate.fromDatabase(r), position ) }) )
                .filter( c => c.distance <= distance );


        }
    }

}