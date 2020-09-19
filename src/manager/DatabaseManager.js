import STATEMENTS from "../classes/DatabaseStatements";
import * as SQLite from "expo-sqlite";

/**
 * This singleton class is responsible for the persisting of
 * data in an SQLite database.
 */
export default class DatabaseManager {

    static get STATEMENTS() { return STATEMENTS; }

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
     * Executes an array of SQL commands. Only use when necessary eg. for "PRAGMA" statements
     * @param {string []} sqlCommands The SQL commands to execute
     */
    exec( sqlCommands = [] ) {
        return new Promise( resolve => this.db.exec( sqlCommands.map( sql => ({ sql, args: [] }) ), false, resolve) );
    }

    /**
     * Creates all database tables if they don't exist
     */
    async initialize() {
        //await this.dropAllTables();

        // enable foreign keys
        await this.exec([STATEMENTS.ENABLE_FOREIGN_KEYS]);

        // create tables
        await this.run(STATEMENTS.CREATE_TABLE_CANTEENS);
        await Promise.all([ STATEMENTS.CREATE_TABLE_MEALS, STATEMENTS.CREATE_TABLE_FETCHED_DAYS ].map( s => this.run(s) ));
        await Promise.all([ STATEMENTS.CREATE_TABLE_MEAL_NOTES, STATEMENTS.CREATE_TABLE_MEAL_PRICES ].map( s => this.run(s) ));
        
        // clean up
        await Promise.all([ STATEMENTS.DELETE_FETCHED_DAYS_BEFORE_LAST_WEEK, STATEMENTS.DELETE_MEALS_BEFORE_LAST_WEEK ].map( s => this.run(s) ));
    }

    /**
     * Drops all database tables. Use with caution!
     */
    async dropAllTables() {
        console.warn("Dropping all database tables!");
        await Promise.all([ STATEMENTS.DROP_TABLE_MEAL_NOTES, STATEMENTS.DROP_TABLE_MEAL_PRICES ].map( s => this.run(s) ));
        await Promise.all([ STATEMENTS.DROP_TABLE_MEALS, STATEMENTS.DROP_TABLE_FETCHED_DAYS ].map( s => this.run(s) ));
        await this.run(STATEMENTS.DROP_TABLE_CANTEENS);
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
                    (_, err) => err ? reject(err) : null
                )
            )
        });
    }

    /**
     * Runs all the given SQL statements in a single transaction
     * @param {[string, ...(number|string)][]} statements The SQL statements given as an array. Each statement is built like this: [sql, arg1, arg2, ..., argn]
     * @returns {Promise<number>} The amount of affected rows
     */
    runInTransaction( statements = [] ) {
        let rowsAffected = 0;

        return new Promise( (resolve, reject) => {
            /**
             * @param {SQLite.SQLTransaction} transaction
             */
            function executeNext( transaction ) {
                if (statements.length === 0) return resolve(rowsAffected);
                
                const statement = statements.splice(0, 1)[0];
                const sql = statement[0];
                const args = statement.slice(1);
                transaction.executeSql(
                    sql,
                    args,
                    (tx, resultSet) => {
                        rowsAffected += resultSet.rowsAffected;
                        executeNext(tx);
                    }
                );
            }

            this.db.transaction(
                executeNext,
                err => err ? reject(err) : null
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
                        resolve(resultSet.rows._array);
                    },
                    (_, err) => err ? reject(err) : null
                )
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
                    (_, err) => err ? reject(err) : null
                )
            )
        });
    }

}