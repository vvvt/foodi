import STATEMENTS from "../classes/DatabaseStatements";
import * as SQLite from "expo-sqlite";

/**
 * This singleton class is responsible for the persisting of
 * data in an SQLite database.
 */
export default class DatabaseManager {

    constructor() {
        if (DatabaseManager._instance) throw new Error("This is a singleton! Use DatabaseManager.instance to access this class instance.");

        // open database handle
        this.db = SQLite.openDatabase("main.db");
    }
    
    /**
     * @returns {DatabaseManager} The instance of the database manager singleton
     */
    static get instance() {
        if (!DatabaseManager._instance) DatabaseManager._instance = new DatabaseManager();
        return DatabaseManager._instance;
    }

    /**
     * Creates all database tables if they don't exist
     */
    async initialize() {
        await this.run(STATEMENTS.CREATE_TABLE_CANTEENS);
        await this.run(STATEMENTS.CREATE_TABLE_MEALS);
        await this.run(STATEMENTS.CREATE_TABLE_MEAL_NOTES);
    }

    /**
     * Runs a given sql command
     * @param {string} sql The SQL command to execute
     * @param {(string | number)[]} args Arguments to insert for "?" inside the SQL string
     * @returns {Promise<number>} The amount of rows affected
     */
    run( sql, args = [] ) {
        return new Promise( (resolve, reject) => {
            this.db.transaction(
                t => t.executeSql(
                    sql,
                    args,
                    (_, resultSet) => {
                        resolve(resultSet.rowsAffected);
                    },
                    reject
                ),
                reject
            )
        });
    }

    /**
     * Runs a given SQL command and returns the retreived results
     * @param {string} sql The SQL command to execute
     * @param {(string | number)[]} args Arguments to insert for "?" inside the SQL string
     * @returns {Promise<any[]>} The result rows
     */
    getAll( sql, args = [] ) {
        return new Promise( (resolve, reject) => {
            this.db.transaction(
                t => t.executeSql(
                    sql,
                    args,
                    (_, resultSet) => {
                        resolve(resultSet.rows);
                    },
                    reject
                ),
                reject
            )
        });
    }

    /**
     * Runs a given SQL command and returns the first result row
     * @param {string} sql The SQL command to execute
     * @param {(string | number)[]} args Arguments to insert for "?" inside the SQL string
     * @returns The result row or undefined
     */
    getFirst( sql, args = [] ) {
        return new Promise( (resolve, reject) => {
            this.db.transaction(
                t => t.executeSql(
                    sql,
                    args,
                    (_, resultSet) => {
                        resolve(resultSet.rows.item(0));
                    },
                    reject
                ),
                reject
            )
        });
    }

}