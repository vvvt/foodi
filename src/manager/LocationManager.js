import * as Location from "expo-location";
import EventEmitter from "events";

import Coordinate from "../classes/Coordinate";

/**
 * @type {VoidFunction} The callback to stop location tracking
 */
var stopLocationTracking = null;

/**
 * This singleton class is responsible for the location tracking
 * of the device.
 */
export default class LocationManager extends EventEmitter {

    /**
     * @returns {LocationManager} The instance of the location manager singleton
     */
    static get instance() {
        if (!LocationManager._instance) LocationManager._instance = new LocationManager();
        return LocationManager._instance;
    }

    constructor() {
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
    }

    /**
     * Executes all functions that are necessary to use this manager
     */
    async initialize() {
        this.hasPermission = await this.requestPermission();

        // prefetch an initial position
        Location.getCurrentPositionAsync(this.locationTrackingOptions)
            .then( this.handlePositionChange.bind(this) )
            .catch( e => {} );
        
    }

    /**
     * Starts the location tracking
     */
    async startLocationTracking() {
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
    handlePositionChange( newPosition ) {
        this.lastDevicePosition.timestamp = newPosition.timestamp;
        this.lastDevicePosition.coordinate = Coordinate.fromObject( newPosition.coords );
        
        // emit the "position" event
        this.emit("position", this.lastDevicePosition);
    }

    /**
     * Requests user permission for using the location tracking service and sets the
     * "hasPermission" property of this class accordingly
     */
    async requestPermissions() {
        try {
            await Location.requestPermissionsAsync();
            this.hasPermission = true;
        } catch(e) {
            this.hasPermission = false;
        }
    }

}