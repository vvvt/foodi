import EventEmitter from "events";

import NetworkManager from "./NetworkManager";
import DatabaseManager from "./DatabaseManager";
import CanteenManager from "./CanteenManager";
import SettingsManager from "./SettingsManager";

import Meal from "../classes/Meal";
import moment from "moment";

const networkManager = NetworkManager.instance;
const databaseManager = DatabaseManager.instance;
const canteenManager = CanteenManager.instance;
const settingsManager = SettingsManager.instance;

/** @typedef {{ meal: Meal, distance: number, canteen: import("../classes/Canteen").default }} MealWithDistance */

var currentMealDay = moment().format("YYYY-MM-DD");

/** @type {Map<number, MealWithDistance>} Map<mealId, MealWithDistance> A map containing the meals of surrounding canteens */
var surroundingMeals = new Map();

export default class MealManager extends EventEmitter {

    constructor() {
        super();
        if (MealManager._instance) throw new Error("This is a singleton! Use MealManager.instance to access this class instance.");

        /** @type {Map<string, Map<number, Meal[]>>} Map<date, Map<canteenId, meals>> */
        this.canteenMeals = new Map();

        this.surroundingMeals = Array.from(surroundingMeals.values()).sort( ({ distance: a }, { distance: b }) => a-b );;
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
     * All meals after filtering with the users meal preferences
     */
    get surroundingMealFiltered() {

        /**
         * Checks if an allergene in the meal is ok for the user
         * @param {string} settingId The id of the allergene or additive to check (as stored in settingsManager)
         * @returns True if the allergene or additive is no problem (is true in the preferences)
         */
        function checkAllergene( settingId ) {
            return (
                !settingsManager.hasSetting(settingId) ||
                settingsManager.getSetting(settingId).value === true
            );
        }

        return this.surroundingMeals.filter( ({ meal: m }) => {

                if (settingsManager.hasSetting("vegetarian") && settingsManager.getSetting("vegetarian").value === true && !(m.isVegetarian || m.isVegan)) return false;
                if (settingsManager.hasSetting("vegan") && settingsManager.getSetting("vegan").value === true && !m.isVegan) return false;

                /** @type {string[]} An array with allergenes (their code) */
                const filters = [
                    ["pork", m.containsPork],
                    ["beef", m.containsBeef],
                    ["alcohol", m.containsAlcohol],
                    ["garlic", m.containsGarlic],
                    ["evening-meal", m.isEveningMeal]
                ]
                    .filter( v => v[1] )
                    .map( v => v[0] )
                    .concat(m.additives.map( a => a.code ))
                    .concat(m.allergenes.map( a => a.code ));

                return !filters.some( settingId => !checkAllergene(settingId) );

            }
        );

    }

    /**
     * To be called after the app was initialized
     */
    setEventHooks() {
        // load cached canteens near by
        canteenManager.on("canteensChanged", this._onCanteensOrNetworkChanged.bind(this));
        networkManager.on("networkStateChanged", this._onCanteensOrNetworkChanged.bind(this));
        canteenManager.on("canteensChanged", this.updateSurroundingMeals.bind(this));
    }

    /** The currently selected day for the meals in the format YYYY-MM-DD */
    get currentMealDay() {
        return currentMealDay;
    }

    set currentMealDay( day ) {
        if (day === this.currentMealDay) return;
        surroundingMeals = new Map();
        currentMealDay = day;
        this.emit("currentDayChanged", this.currentMealDay);
        this.updateSurroundingMeals(canteenManager.surroundingCanteens, canteenManager.surroundingCanteens);
    }

    /**
     * Function to get called by the CanteenManager "canteensChanged" event
     * @param {import("./CanteenManager").CanteenWithDistance[]} currentSurroundingCanteens The currently surrounding canteens
     * @param {import("./CanteenManager").CanteenWithDistance[]} lastSurroundingCateens The canteens that were around before this function call
     */
    updateSurroundingMeals(currentSurroundingCanteens = [], lastSurroundingCateens = []) {

        const day = this.currentMealDay;

        // if there are any meals in the surrounding meal map: delete those which are out of range
        if (surroundingMeals.size !== 0) {

            // get canteens that left the tracking range
            const canteensOutOfRange = lastSurroundingCateens.filter(
                c1 => currentSurroundingCanteens.findIndex( c2 => c1.canteen.id === c2.canteen.id ) === -1
            ).map( v => v.canteen.id );
            
            // delete meals of those canteens
            for (let { meal: { id: mealId, canteenId } } of surroundingMeals.values()) {
                if (canteensOutOfRange.includes( canteenId )) surroundingMeals.delete(mealId);
            }

        }

        // get surrounding meals and update distance for each meal
        this.getSurroundingMeals(day, mealsWithDistances => {

            // update meals map
            mealsWithDistances.forEach( value => surroundingMeals.set( value.meal.id, value ) );

            // update state with the new meals/ distances
            this.surroundingMeals = Array.from(surroundingMeals.values()).sort( ({ distance: a }, { distance: b }) => a-b );
            
            // emit event
            this.emit("mealsChanged", this.surroundingMeals);

        });

    }

    /**
     * @callback OnMealLoaded
     * @param {MealWithDistance[]}
     * @returns {void}
     */
    /**
     * Gets the surrounding canteens from the canteen manager and loads or
     * fetches the meals (with high network priority).
     * @param {string} day The day to get the surrounding meals for (in format YYYY-MM-DD)
     * @param {OnMealLoaded} onMealsLoaded Optional: A callback to call whenever meals were loaded
     * @returns All meals with their distances of the surrounding canteens
     */
    async getSurroundingMeals( day, onMealsLoaded = () => {} ) {

        /** @type {MealWithDistance[]} */
        const res = [];

        // for each surrounding canteen: load or fetch meals
        const promises = canteenManager.surroundingCanteens.map( async c => {
            try {

                // the meals of a surrounding canteen
                const meals = await this.loadOrFetchMeals(c.canteen.id, day);

                // map the meals to their distance
                const mealsWithDistance = meals.map( m => ({ canteen: c.canteen, distance: c.distance, meal: m }) );
                onMealsLoaded(mealsWithDistance);
                res.push(...mealsWithDistance);

            } catch(e) {
                console.log(`Could not fetch or load meals of canteen "${c.canteen.name}" for ${day}`, e);
            }
        });

        // return when all meals are fetched/ loaded
        await promises;
        return res;

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
                            await this.saveMeals( await this.fetchMeals(canteen.id, day, NaN, "LOW") );
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
        if (!this.canteenMeals.has(day) || !this.canteenMeals.get(day).has(canteenId)) await this.saveMeals( await this.fetchMeals(canteenId, day, NaN, "HIGH") );
        return this.canteenMeals.get(day)?.get(canteenId) || [];

    }

    /**
     * Refetches a meal and saves it
     * @param {Meal} meal The meal to refetch
     * @returns The updated meal or null
     */
    async refetchMeal( meal ) {
        try {
            const meals = await this.fetchMeals( meal.canteenId, meal.date, meal.id, "HIGH" );
            this.saveMeals( meals ).catch();
            return meals[0] || null;
        } catch(e) {
            return null;
        }
    }

    /**
     * Fetches all meals of a given canteen for a day
     * @param {number} canteenId The canteen id to fetch the meals of
     * @param day The day to fetch the meals in format "YYYY-MM-DD". Default is today
     * @param mealId The id of the meal to fetch. If provided, only this meal is fetched. Default is NaN
     * @param {import("./NetworkManager").Priority} priority The network priority to fetch with. Default is "MODERATE"
     * @returns An array of meals or an empty array
     */
    async fetchMeals( canteenId, day = moment().format("YYYY-MM-DD"), mealId = NaN, priority = "MODERATE" ) {
        
        // fetch from OpenMensa API
        const res = await networkManager.fetchWithParams(
            NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens/${canteenId}/days/${day}/meals${isNaN(mealId) ? "" : "/"+mealId}`,
            {},
            priority
        );
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Network request failed (${res.status}${res.statusText ? " " + res.statusText : ""}`);

        /** @type {import("../classes/Meal").MealObj[]} */
        let mealsObjs = await res.json();

        if (isNaN(mealId)) {
            // if is an array of meals
            if (!Array.isArray(mealsObjs)) return [];
        } else {
            // if is a single, specific meal => wrap in array
            if (typeof mealsObjs !== "object" || mealsObjs.id !== mealId) return [];
            mealsObjs = [mealsObjs];
        }
        
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
                ...m._originalNotes.map( note => [DatabaseManager.STATEMENTS.INSERT_INTO_MEAL_NOTES, m.id, note]),
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