import * as SQLite from "expo-sqlite";

/**
 * This singleton class is responsible for the persisting of
 * data in an SQLite database.
 */
export default class DatabaseManager {

    constructor() {
        if (DatabaseManager._instance) throw new Error("This is a singleton! Use DatabaseManager.instance to access this class instance.");
    }
    
    /**
     * @returns {DatabaseManager} The instance of the database manager singleton
     */
    static get instance() {
        if (!DatabaseManager._instance) DatabaseManager._instance = new DatabaseManager();
        return DatabaseManager._instance;
    }

}