import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

import Coordinate from "../classes/Coordinate";

/**
 * This singleton class is responsible for the location tracking
 * of the device.
 */
export default class LocationManager {

    /**
     * @returns {LocationManager} The instance of the location manager singleton
     */
    static get instance() {
        if (!LocationManager._instance) LocationManager._instance = new LocationManager();
        return LocationManager._instance;
    }

    constructor() {
        if (LocationManager._instance) throw new Error("This is a singleton! Use LocationManager.instance to access this class instance.");
    }

}