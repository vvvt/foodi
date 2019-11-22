import * as Location from "expo-location";
import EventEmitter from "events";
import * as Permissions from "expo-permissions";
import { AppState } from "react-native";

import Coordinate from "../classes/Coordinate";

import SettingsManager from "./SettingsManager";

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
    MODERATE: 5,
    FAR: 20,
    VERY_FAR: 50,
    INFINITE: Number.POSITIVE_INFINITY
});

const LAST_DEVICE_POSITION_SETTING_KEY = "lastDevicePosition";

const settingsManager = SettingsManager.instance;

/**
 * This singleton class is responsible for the location tracking
 * of the device.
 * 
 * Emits: "position"
 * Params: lastDevicePosition
 * Fires when a new position of the device was received
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

        // persist when app is closed so it can be loaded when the app is initialized the next time
        AppState.addEventListener("change", state => {
            if (state === "inactive") settingsManager.storeSetting(LAST_DEVICE_POSITION_SETTING_KEY, this.lastDevicePosition);
        });
    }

    /**
     * Executes all functions that are necessary to use this manager
     */
    async initialize() {
        await Promise.all([
            // get permission for location tracking and start it
            async () => {
                const permissionStatus = await Permissions.getAsync( Permissions.LOCATION );
                this.hasPermission = permissionStatus.status === "granted";
                this.startLocationTracking();
            },

            // get last device position from the settings manager
            async () => {
                const lastDevicePosition = await settingsManager.getSetting(LAST_DEVICE_POSITION_SETTING_KEY, "object");
                if (lastDevicePosition !== null) this.lastDevicePosition = lastDevicePosition;
            }
        ]);
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
        console.log(`New position: lat=${this.lastDevicePosition.coordinate.latitude} lng=${this.lastDevicePosition.coordinate.longitude}`);

        // emit the "position" event
        this.emit("position", this.lastDevicePosition);
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