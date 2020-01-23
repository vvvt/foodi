import { AsyncStorage } from "react-native";
import SETTINGS from "../classes/Settings";
import FILTERS from "../classes/Filters";

/** @typedef {"string" | "object" | "number" | "boolean"} SettingType */
/** @typedef {[string, string]} SavableStringObject Contains [value, typeof value]. So the saved setting can be reconstructed by only the saved string */

/**
 * Converts a string value into the given data type
 * @param {string} value The value to convert
 * @param {SettingType} type The target data type
 */
function stringToValue( value, type ) {
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
 * Converts a given value into its string representation
 * @param {any} value The value to convert
 */
function valueToString( value ) {
    switch(typeof value) {
        case "string":
            return value;
        case "number":
            return value.toString();
        case "boolean":
            return value ? "true" : "false";
        case "object":
            return JSON.stringify(value);
        default:
            throw new TypeError("The type of the given value is not supported!");
    }
}

export class Setting {

    /**
     * Creates a new instance of a setting
     * @param {string} key The unique key of the setting
     * @param {any} value The value to safe. Can be of any data type
     */
    constructor( key, value ) {
        if (typeof key !== "string") throw new TypeError("The key must be of type string!");
        this.key = key;
        this.value = value;
    }

    /**
     * @returns A string that can be passed to Setting.fromPersistableString
     */
    toPersistableString() {
        return JSON.stringify( [valueToString(this.value), typeof this.value] );
    }

    /**
     * Creates an instance of a setting by the loaded string from AsyncStorage and the key
     * @param {string} key The key of the setting
     * @param {string} s The string as retrieved from the AsyncStorage
     */
    static fromPersistableString( key, s ) {
        /** @type {SavableStringObject} */
        const settingStringObject = JSON.parse(s);
        return new Setting( key, stringToValue(settingStringObject[0], settingStringObject[1]) );
    }

}

/**
 * This singleton class is responsible for the persisting of
 * settings as key-value pairs via AsyncStorage.
 */
export default class SettingsManager {

    constructor() {
        if (SettingsManager._instance) throw new Error("This is a singleton! Use SettingsManager.instance to access this class instance.");
        /** @type {Map<string, Setting>} A map containing all settings */
        this.settings = new Map();
    }
    
    /**
     * @returns {SettingsManager} The instance of the settings manager singleton
     */
    static get instance() {
        if (!SettingsManager._instance) SettingsManager._instance = new SettingsManager();
        return SettingsManager._instance;
    }

    async initialize() {
        const allRawValues = await AsyncStorage.multiGet( await AsyncStorage.getAllKeys() );
        allRawValues.forEach( ([key, persistableString]) => {
            try {
                this.settings.set(key, Setting.fromPersistableString(key, persistableString));
            } catch(e) {}
        });

        // save default settings if not saved yet
        SETTINGS.forEach( s => {
            if (!this.hasSetting(s.id)) this.storeSetting(new Setting(s.id, s.default));
        });
        FILTERS.forEach( p => p.data.forEach( s => {
            if (!this.hasSetting(s.id)) this.storeSetting(new Setting(s.id, s.default));
        }));
    }

    /**
     * Checks if a setting is stored
     * @param {string} key The key of the setting
     */
    hasSetting( key ) {
        return this.settings.has(key);
    }

    /**
     * Gets a setting by its key
     * @param {string} key The key of the setting
     * @returns The setting
     */
    getSetting( key ) {
        return this.settings.has(key) ? this.settings.get(key) : new Setting(key, null);
    }

    /**
     * Stores a given Setting. If null or undefined is given this results in a delete of the setting
     * @param {Setting} setting The setting to save
     */
    storeSetting( setting ) {
        if (!setting instanceof Setting) throw new TypeError("The setting must be of type Setting!");
        if (setting.value == null) {
            this.deleteSetting(setting.key);
        } else {
            this.settings.set(setting.key, setting);
            AsyncStorage.setItem(setting.key, setting.toPersistableString());
        }
    }

    /**
     * Removes a stored setting
     * @param {string} key The key to access the setting with
     */
    deleteSetting( key ) {
        AsyncStorage.removeItem(key);
        return this.settings.delete(key);
    }

    deleteAllSettings() {
        console.warn("Deleting all settings!");
        this.settings = new Map();
        AsyncStorage.clear();
    }

}