import * as Location from "expo-location";
import EventEmitter from "events";
import * as Permissions from "expo-permissions";
import { AppState } from "react-native";

import Coordinate from "../classes/Coordinate";

import SettingsManager, { Setting } from "./SettingsManager";

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
    VERY_FAR: Number.POSITIVE_INFINITY
});

// all unmentioned location contexts will have the accuracy "Balanced"
/** @type {[import("./CanteenManager").LocationContext, Location.Accuracy][]} */
const LOCATION_CONTEXT_TO_TRACKING_ACCURACY_MAPPING = [
    ["VERY_FAR", Location.Accuracy.Lowest],
    ["INSIDE", Location.Accuracy.High],
    ["FAR", Location.Accuracy.Low]
];

const LAST_DEVICE_POSITION_SETTING_KEY = "lastDevicePosition";

const settingsManager = SettingsManager.instance;
/** @type {import("./CanteenManager").default} */
var canteenManager = null;

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
    }

    /**
     * Executes all functions that are necessary to use this manager
     * @param {import("./CanteenManager").default} cManager The canteenManager instance
     */
    async initialize( cManager ) {

        canteenManager = cManager;

        // get permission for location tracking and start it
        const permissionStatus = await Permissions.getAsync( Permissions.LOCATION );
        this.hasPermission = permissionStatus.status === "granted";
        if (this.hasPermission) await this.startLocationTracking();

        // get last device position from the settings manager
        const lastDevicePosition = settingsManager.getSetting(LAST_DEVICE_POSITION_SETTING_KEY).value;
        if (lastDevicePosition !== null && this.lastDevicePosition.timestamp === 0) {
            lastDevicePosition.coordinate = Coordinate.fromObject(lastDevicePosition.coordinate);
            this.lastDevicePosition = lastDevicePosition;
            console.log("Restored last device position");
        }

        // persist when app is closed so it can be loaded when the app is initialized the next time
        AppState.addEventListener("change", state => {
            if (state === "inactive" && this.lastDevicePosition.timestamp !== 0)
                settingsManager.storeSetting( new Setting(LAST_DEVICE_POSITION_SETTING_KEY, this.lastDevicePosition) );
        });

        // reduce tracking quality if far away
        canteenManager.on("locationContextChanged", this._onLocationContextStateChanged.bind(this));

    }

    /**
     * Gets called when the location context of the user changes
     * @param {import("./CanteenManager").LocationContext} currentLocationContext The current location context
     * @param {import("./CanteenManager").LocationContext} lastLocationContext The last location context
     */
    _onLocationContextStateChanged(currentLocationContext, lastLocationContext) {

        const lastAccuracy = this.locationTrackingOptions.accuracy;

        // adjust location tracking accuracy depending on user location context
        this.locationTrackingOptions.accuracy = LOCATION_CONTEXT_TO_TRACKING_ACCURACY_MAPPING.find( ([context]) => context === currentLocationContext )?.[1] || Location.Accuracy.Balanced;

        // restart location tracking if the accuracy changed
        if (this.locationTrackingOptions.accuracy !== lastAccuracy) {
            console.log("Adjusting location tracking accuracy...");
            this.startLocationTracking();
        }

    }

    /**
     * Starts the location tracking
     */
    async startLocationTracking() {
        if (!this.hasPermission) return console.warn("Tried to start the location tracking without having the user permission.");

        this.stopLocationTracking();
        const { remove: stopFunction } = await Location.watchPositionAsync(
            { ...this.locationTrackingOptions },
            this.handlePositionChange.bind(this)
        );

        // set the function to stop updates
        stopLocationTracking = stopFunction;
        console.log("Started location tracking...");
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

        const lastCoordinate = this.lastDevicePosition.coordinate;
        this.lastDevicePosition.timestamp = newPosition.timestamp;
        this.lastDevicePosition.coordinate = Coordinate.fromObject( newPosition.coords );

        // check if position actually changed
        if (!lastCoordinate.equalTo(this.lastDevicePosition.coordinate)) {
            console.log(`New position: lat=${this.lastDevicePosition.coordinate.latitude.toFixed(3)} lng=${this.lastDevicePosition.coordinate.longitude.toFixed(3)}`);

            // emit the "position" event
            this.emit("position", this.lastDevicePosition);
        }
    }

    /**
     * Requests user permission for using the location tracking service and sets the
     * "hasPermission" property of this class accordingly. If no initial device position
     * was received yet it tries to fetch one.
     */
    async requestPermissions() {
        try {
            const perm = await Permissions.askAsync( Permissions.LOCATION );
            this.hasPermission = perm.granted;
        } catch(e) {
            this.hasPermission = false;
        }
    }

}