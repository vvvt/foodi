import * as Location from "expo-location";
import EventEmitter from "events";

import Coordinate from "../classes/Coordinate";
import Canteen from "../classes/Canteen";

import CanteenManager from "./CanteenManager";

const canteenManager = CanteenManager.instance;

/**
 * @type {VoidFunction} The callback to stop location tracking
 */
var stopLocationTracking = null;

/**
 * A mapping of canteen distances to semantic distances (contexts)
 */
const CANTEEN_DISTANCE_THRESHOLDS = Object.freeze({
    INSIDE: 0.2,
    VERY_CLOSE: 0.3,
    NEAR_BY: 0.6,
    FAR: 5,
    VERY_FAR: Number.POSITIVE_INFINITY
});

/**
 * This singleton class is responsible for the location tracking
 * of the device.
 */
export default class LocationManager extends EventEmitter {

    static get CANTEEN_DISTANCE_THRESHOLDS() { return CANTEEN_DISTANCE_THRESHOLDS; }

    /**
     * @returns {LocationManager} The instance of the location manager singleton
     */
    static get instance() {
        if (!LocationManager._instance) LocationManager._instance = new LocationManager();
        return LocationManager._instance;
    }

    constructor() {
        super();
        if (LocationManager._instance) throw new Error("This is a singleton! Use LocationManager.instance to access this class instance.");

        /** True if this app has permission to use location tracking */
        this.hasPermission = false;
        /** An object containing information about the devices last known position */
        this.lastDevicePosition = {
            /** A coordinate containing the last position of the device */
            coordinate: new Coordinate(0, 0),
            /** The timestamp of the coordinate */
            timestamp: 0
        };

        /** @type {Location.LocationOptions} The options to use for the next tracking */
        this.locationTrackingOptions = {
            accuracy: Location.Accuracy.Balanced,
            mayShowUserSettingsDialog: true
        };

        /**
         * @type {{ canteen: Canteen, distance: number }[]} An array with canteens that are
         * within a certain distance, ordered by the distance ascending
         */
        this.surroundingCanteens = [];
        this.canteenTrackingRadius = 7.5;
    }

    /**
     * Executes all functions that are necessary to use this manager
     */
    async initialize() {
        this.hasPermission = await this.requestPermission();
    }

    /**
     * Starts the location tracking
     */
    async startLocationTracking() {
        if (!this.hasPermission) return console.warn("Tried to start the location tracking without having the user permission.");

        const { remove: stopFunction } = await Location.watchPositionAsync(
            this.locationTrackingOptions,
            this.handlePositionChange.bind(this)
        );

        // set the function to stop updates
        stopLocationTracking = stopFunction;
    }

    /**
     * Stops the location tracking
     */
    stopLocationTracking() {
        if (stopLocationTracking !== null) stopLocationTracking();
        stopLocationTracking = null;
    }

    /**
     * Gets called when the tracked location of the device changed
     * @param {Location.LocationData} newPosition The new tracked location
     */
    async handlePositionChange( newPosition ) {
        this.lastDevicePosition.timestamp = newPosition.timestamp;
        this.lastDevicePosition.coordinate = Coordinate.fromObject( newPosition.coords );

        // emit the "position" event
        this.emit("position", this.lastDevicePosition);

        try {
            // get the canteens that are near by
            this.surroundingCanteens = await canteenManager.loadCanteens(this.lastDevicePosition.coordinate, this.canteenTrackingRadius);
            this.surroundingCanteens.sort( (a, b) => a.distance < b.distance ? 1 : a.distance > b.distance ? -1 : 0 );
            this.emit("canteensChanged", this.surroundingCanteens);
        } catch(e) {
            console.error("Could not load the surrounding canteens from the database:", e);
        }
    }

    /**
     * Requests user permission for using the location tracking service and sets the
     * "hasPermission" property of this class accordingly. If no initial device position
     * was received yet it tries to fetch one.
     */
    async requestPermissions() {
        try {
            await Location.requestPermissionsAsync();
            this.hasPermission = true;
        } catch(e) {
            this.hasPermission = false;
            return;
        }

        // prefetch an initial position if not done yet
        if (this.lastDevicePosition.timestamp !== 0) return;
        Location.getCurrentPositionAsync(this.locationTrackingOptions)
            .then( this.handlePositionChange.bind(this) )
            .catch( e => {} );
    }

}