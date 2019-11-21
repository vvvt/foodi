import NetworkManager from "./NetworkManager";
import DatabaseManager from "./DatabaseManager";
import CanteenManager from "./CanteenManager";

import Meal from "../classes/Meal";
import moment from "moment";

const networkManager = NetworkManager.instance;
const databaseManager = DatabaseManager.instance;
const canteenManager = CanteenManager.instance;

export default class MealManager {

    constructor() {
        if (MealManager._instance) throw new Error("This is a singleton! Use MealManager.instance to access this class instance.");

        /** @type {Map<string, Map<number, Meal[]>>} Map<date, Map<canteenId, meals>> */
        this.canteenMeals = new Map();

        // load cached canteens near by
        canteenManager.on("canteensChanged", this._onCanteensOrNetworkChanged.bind(this));
        networkManager.on("networkStateChanged", this._onCanteensOrNetworkChanged.bind(this));
    }

    async _onCanteensOrNetworkChanged() {
        if (networkManager.networkState.speed !== NetworkManager.NETWORK_SPEED.FAST) return;

        // if in wifi => fetch next 7 days
        const days = networkManager.networkState.trafficLimit === NetworkManager.NETWORK_TRAFFIC_LIMIT.UNLIMITED ?
            [0,1,2,3,4,5,6].map( d => moment().add(d, "days") )
        :
            [moment()]
        ;

        this.prefetchMealsIfNotExist(
            canteenManager.surroundingCanteens.map( c => c.canteen ),
            days.map( m => m.format("YYYY-MM-DD") )
        );
    }
    
    /**
     * @returns {MealManager} The instance of the meal manager singleton
     */
    static get instance() {
        if (!MealManager._instance) MealManager._instance = new MealManager();
        return MealManager._instance;
    }

    /**
     * Loads all persisted meals into the cache
     */
    async initialize() {
        const meals = await this.loadMeals();
        meals.forEach( m => {
            if (!this.canteenMeals.has(m.date)) this.canteenMeals.set(m.date, new Map());
            const canteensOfDate = this.canteenMeals.get(m.date);
            if (!canteensOfDate.has(m.canteenId)) canteensOfDate.set(m.canteenId, []);
            canteensOfDate.get(m.canteenId).push(m);
        });
    }
    
    /**
     * Gets the cached meals of a given day
     * @param {string} day The day to get the meals of
     * @param {number} canteenId Optional: The canteen to get the meals of
     */
    getMeals( day, canteenId = 0 ) {
        if (!this.canteenMeals.has(day)) return [];
        if (canteenId === 0) return Array.from( this.canteenMeals.get(day).values() )
            .reduce( (prev, cur) => [...prev, ...cur], [] );
        return this.canteenMeals.get(day).get(canteenId) || [];
    }

    /**
     * Fetches and saves meals for the given canteens on the given days. If they were fetched already nothing is done.
     * @param {import("../classes/Canteen").default[]} canteens The canteens to fetch the meals of
     * @param {string[]} days The days to fetch the meals of
     */
    async prefetchMealsIfNotExist( canteens, days ) {
        /** @type {Promise<void>[]} */
        const promises = [];

        // prefetch all meals in parallel (with low priority)
        days.forEach( day =>
            canteens.forEach( canteen =>
                promises.push(async () => {
                    try {
                        // do not prefetch if it was already
                        if (!this.canteenMeals.has(day) || !this.canteenMeals.get(day).has(canteen.id))
                            await this.saveMeals( await this.fetchMeals(canteen.id, day, "LOW") );
                    } catch(e) {
                        console.warn(`Could not prefetch the meals of canteen "${canteen.name}" for the date ${day}:`, e);
                    }
                })
            )
        );

        await Promise.all(promises);
    }

    /**
     * Fetches or loads from cache the meals of a given canteen for a given day
     * @param {number} canteenId The canteen to load the meals of
     * @param {string} day The day to load the meals of
     */
    async loadOrFetchMeals( canteenId, day ) {

        // fetch meals (with high priority) if not done already
        if (!this.canteenMeals.has(day) || !this.canteenMeals.get(day).has(canteenId)) await this.saveMeals( await this.fetchMeals(canteenId, day, "HIGH") );
        return this.canteenMeals.get(day).get(canteenId) || [];

    }

    /**
     * Fetches all meals of a given canteen for a day
     * @param {number} canteenId The canteen id to fetch the meals of
     * @param {string} day The day to fetch the meals in format "YYYY-MM-DD". Default is today
     * @param {import("./NetworkManager").Priority} priority The network priority to fetch with
     */
    async fetchMeals( canteenId, day, priority = "MODERATE" ) {
        if (typeof day !== "string") day = day.toUTCString();

        /** @type {import("../classes/Meal").MealObj[]} */
        const mealsObjs = await networkManager.fetchWithParams(
            NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens/${canteenId}/days/${day}/meals`,
            {},
            priority
        );
        
        // add date property
        return mealsObjs.map( m => Meal.fromObject( m, canteenId, day ) );
    }

    /**
     * Saves the given array of meals in the database
     * @param {Meal[]} meals The meals to save
     */
    async saveMeals( meals ) {
        if (!Array.isArray(meals)) throw new TypeError("The given meals must be of type array!");
        if (meals.length === 0) return;

        const statements = [];
        meals.forEach( m => {

            // add to cache
            if (!this.canteenMeals.has(m.date)) this.canteenMeals.set(m.date, new Map());
            const canteenMealsOfDay = this.canteenMeals.get(m.date);
            if (!canteenMealsOfDay.has(m.canteenId)) canteenMealsOfDay.set(m.canteenId, []);
            canteenMealsOfDay.get(m.canteenId).push(m);

            // persist in database
            statements.push(
                [DatabaseManager.STATEMENTS.INSERT_INTO_MEALS, m.id, m.canteenId, m.name, m.date, m.category],
                ...m.notes.map( note => [DatabaseManager.STATEMENTS.INSERT_INTO_MEAL_NOTES, m.id, note]),
                ...Object.keys(m.prices).map( priceGroup => [DatabaseManager.STATEMENTS.INSERT_INTO_MEAL_PRICES, m.id, priceGroup, m.prices[priceGroup]] )
            );

        });

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

}