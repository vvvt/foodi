import NetworkManager from "./NetworkManager";
import DatabaseManager from "./DatabaseManager";

const networkManager = NetworkManager.instance;
const databaseManager = DatabaseManager.instance;

/** @typedef {[number, number]} Coordinate An array containing latitude and longitude */
/** @typedef {{ id: number, name: string, notes: string[], prices: { [string: priceGroup]: number }, category: string, date: string }} Meal */
/** @typedef {{ id: number, name: string, city: string, address: string, coordinates: Coordinate }} Canteen */

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
     * @param {Date | string} day The day to fetch the meals. Default is today
     * @returns {Meal[]}
     */
    fetchMeals( canteenId, day = new Date() ) {
        if (typeof day !== "string") day = day.toUTCString();

        /** @type {Meal[]} */
        const meals = await networkManager.fetchWithParams( NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens/${canteenId}/days/${day}/meals` );
        
        // add date property
        meals.forEach( m => m.date = day );

        return meals;
    }

    /**
     * Fetches canteen in a given radius around a given position
     * @param {Coordinate} position The position to find canteens from
     * @param distance Default: 7.5. The maximum distance in km to the given position a returned canteen can have
     * @returns {Canteen[]}
     */
    fetchCanteens( position, distance = 7.5 ) {
        return await networkManager.fetchWithParams(
            NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens`,
            {
                "near[lat]": position[0],
                "near[lng]": position[1],
                "near[dist]": distance
            }
        );
    }

}