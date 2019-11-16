import { AsyncStorage } from "react-native";

/** @typedef {"string" | "object" | "number" | "boolean"} SettingType */

/**
 * Converts a string value into the given data type
 * @param {string} value The value to convert
 * @param {SettingType} type The target data type
 */
function convertValue( value, type ) {
    switch (type) {
        case "string":
            return value;
        case "number":
            return Number.parseFloat(value);
        case "boolean":
            return value === "true";
        case "object":
            return JSON.parse(value);
        default:
            throw new Error("The given return type is invalid!");
    }
}

/**
 * This singleton class is responsible for the persisting of
 * settings as key-value pairs via AsyncStorage.
 */
export default class SettingsManager {

    constructor() {
        if (SettingsManager._instance) throw new Error("This is a singleton! Use SettingsManager.instance to access this class instance.");
    }
    
    /**
     * @returns {SettingsManager} The instance of the settings manager singleton
     */
    static get instance() {
        if (!SettingsManager._instance) SettingsManager._instance = new SettingsManager();
        return SettingsManager._instance;
    }

    /**
     * Loads a stored value by a given key.
     * @param {string} key The identifier to get the setting with
     * @param {SettingType} returnType Default: "string". Since every value is stored
     * as string in the backend it has to be converted of a string value to the desired type accordingly.
     * 
     * If there is no data stored with the given key null is returned in any case.
     */
    async getSetting( key, returnType = "string" ) {
        const rawValue = await AsyncStorage.getItem(key);
        if (rawValue === null) return null;

        return convertValue(rawValue, returnType);
    }

    /**
     * Stores a given key-value pair
     * @param {string} key The key to access the value with
     * @param {any} value The value to store
     */
    async storeSetting( key, value ) {
        let rawValue = "";

        switch(typeof value) {
            case "string":
                rawValue = value;
                break;
            case "number":
            case "boolean":
                rawValue = value + "";
                break;
            case "object":
                rawValue = JSON.stringify(value);
                break;
            default:
                throw new TypeError("The type of the given value is not supported!");
        }

        await AsyncStorage.setItem(key, rawValue);
    }

    /**
     * Loads multiple settings simoultaniously
     * @param {string[]} keys The keys to load the stored values of
     * @param {SettingType[]} returnTypes The return types to convert the values to
     * @returns An array of [key, value] pairs
     */
    async getMultipleSettings( keys, returnTypes = null ) {
        if (returnTypes == null) returnTypes = keys.map( () => "string" );
        if (keys.length !== returnTypes.length) throw new Error("The array length of the return types must match the length of the keys");

        const rawValues = await AsyncStorage.multiGet(keys);
        /** @type {[string, any][]} */
        const kv = rawValues.map( ([key, value], index) => [key, convertValue(value, returnTypes[index])] );
        return kv;
    }

}