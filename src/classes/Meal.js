/** @typedef {{ id: number, name: string, notes: string[], prices: { [priceGroup: string]: number }, category: string }} MealObj */
/** @typedef {{ id: number, name: string, date: string, notes: string, prices: string, category: string }} MealDatabaseRow */

export default class Meal {

    /**
     * Represents a meal in a canteen on a specific date
     * @param {number} id The id as of OpenMensa
     * @param {number} canteenId The id of the canteen that this meal belongs to
     * @param {string} name The name
     * @param {string} date The date the meal is in the canteen. In format "YYYY-MM-DD"
     * @param {string} category Eg. "fertig 1", "Wok", "Grill", ...
     * @param {{ [priceGroup: string]: number }} prices Different prices of the meal
     * @param {string[]} notes The notes eg. "vegetarian"
     */
    constructor( id, canteenId, name, date, category, prices = {}, notes = [] ) {
        if (!Meal.isValidMealDate(date)) throw new Error('Invalid date format! Must be of format "YYYY-MM-DD".');

        this.id = id;
        this.canteenId = canteenId;
        this.name = name;
        this.date = date;
        this.category = category;
        this.prices = prices;
        this.notes = notes;
    }

    /**
     * Creates a meal instance from a given object and date
     * @param {MealObj} obj The object containing all meal properties as returned from the OpenMensa API
     * @param {string} date The date this meals is in the canteen
     */
    static fromObject( obj, date ) {
        return new Meal(obj.id, obj.name, date, obj.category, obj.prices, obj.notes);
    }

    /**
     * Creates an instance of a meal by a given database result row
     * @param {MealDatabaseRow} row The result row as loaded from the database
     */
    static fromDatabase( row ) {
        return new Meal( row.id, row.name, row.date, row.category, JSON.parse(`[${row.prices}]`), {} );
    }

    /**
     * Checks whether the given string is in format "YYYY-MM-DD"
     * @param {string} date The date string to check
     */
    static isValidMealDate( date ) {
        return /^[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date);
    }

}