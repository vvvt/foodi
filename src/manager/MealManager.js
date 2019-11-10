import NetworkManager from "./NetworkManager";
import DatabaseManager from "./DatabaseManager";

import Meal from "../classes/Meal";
import Canteen from "../classes/Canteen";

const networkManager = NetworkManager.instance;
const databaseManager = DatabaseManager.instance;

export default class MealManager {

    constructor() {
        if (MealManager._instance) throw new Error("This is a singleton! Use MealManager.instance to access this class instance.");
    }
    
    /**
     * @returns {MealManager} The instance of the meal manager singleton
     */
    static get instance() {
        if (!MealManager._instance) MealManager._instance = new MealManager();
        return MealManager._instance;
    }

    /**
     * Fetches all meals of a given canteen for a day
     * @param {number} canteenId The canteen id to fetch the meals of
     * @param {string} day The day to fetch the meals in format "YYYY-MM-DD". Default is today
     */
    async fetchMeals( canteenId, day ) {
        if (typeof day !== "string") day = day.toUTCString();

        /** @type {import("../classes/Meal").MealObj[]} */
        const mealsObjs = await networkManager.fetchWithParams( NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens/${canteenId}/days/${day}/meals` );
        
        // add date property
        return mealsObjs.map( m => Meal.fromObject( m, canteenId, day ) );
    }

    /**
     * Fetches canteen in a given radius around a given position
     * @param {import("../classes/Canteen").Coordinate} position The position to find canteens from
     * @param distance Default: 7.5. The maximum distance in km to the given position a returned canteen can have
     */
    async fetchCanteens( position, distance = 7.5 ) {
        if (!Array.isArray(position) || position.length !== 2) throw new TypeError("The position must be an array containing 2 elements!");

        /** @type {import("../classes/Canteen").CanteenObj[]} */
        const canteenObjs = await networkManager.fetchWithParams(
            NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens`,
            {
                "near[lat]": position[0],
                "near[lng]": position[1],
                "near[dist]": distance
            }
        );

        return canteenObjs.map( c => Canteen.fromObject( c ) );
    }

    /**
     * Saves the given array of meals in the database
     * @param {Meal[]} meals The meals to save
     */
    async saveMeals( meals ) {
        const statements = [];

        meals.forEach( m =>
            statements.push(
                [DatabaseManager.STATEMENTS.INSERT_INTO_MEALS, m.id, m.canteenId, m.name, m.date, m.category],
                ...m.notes.map( note => [DatabaseManager.STATEMENTS.INSERT_INTO_MEAL_NOTES, m.id, note]),
                ...Object.keys(m.prices).map( priceGroup => [DatabaseManager.STATEMENTS.INSERT_INTO_MEAL_PRICES, m.id, priceGroup, m.prices[priceGroup]] )
            )
        );

        await databaseManager.runInTransaction( statements );
    }


    /**
     * Loads all cached (persisted) meals from the database
     * @param canteenId Optional. If given, only the meals of the canteen will be returned
     */
    async loadMeals( canteenId = 0 ) {

        // load meals from database
        /** @type {import("../classes/Meal").MealDatabaseRow[]} */
        const rows = await databaseManager.getAll(DatabaseManager.STATEMENTS[canteenId > 0 ? "LOAD_MEALS_OF_CANTEEN" : "LOAD_ALL_MEALS"], canteenId > 0 ? [canteenId] : []);
        
        // load the notes and prices of each meal and return the fully composed meal object
        return await Promise.all(
            rows.map( async r => {
                const [
                    notes,
                    prices
                ] = await Promise.all([
                    databaseManager.getAll(DatabaseManager.STATEMENTS.LOAD_MEAL_NOTES_OF_MEAL, [r.id]),
                    databaseManager.getAll(DatabaseManager.STATEMENTS.LOAD_MEAL_PRICES_OF_MEAL, [r.id])
                ]);

                return Meal.fromDatabase(r, notes, prices);
            })
        );

    }

    /**
     * Saves the given array of canteens in the database
     * @param {Canteen[]} canteens The canteens to save
     */
    async saveCanteens( canteens ) {
        await databaseManager.runInTransaction(
            canteens.map( c =>
                [DatabaseManager.STATEMENTS.INSERT_INTO_CANTEENS, c.id, c.name, c.city, c.address, c.coordinates[0], c.coordinates[1]]
            )
        );
    }

    /**
     * Loads all cached (persisted) canteens from the database
     */
    async loadCanteens() {
        const rows = await databaseManager.getAll(DatabaseManager.STATEMENTS.LOAD_ALL_CANTEENS);
        return rows.map( r => Canteen.fromDatabase(r) );
    }

}