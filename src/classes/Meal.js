/** @typedef {{ id: number, name: string, notes: string[], prices: { [priceGroup: string]: number }, category: string, image: string }} MealObj */
/** @typedef {{ id: number, canteenId: number, name: string, date: string, category: string, imageUrl: string }} MealDatabaseRow */

const DEFAULT_IMAGE_URL = "https://static.studentenwerk-dresden.de/bilder/mensen/studentenwerk-dresden-lieber-mensen-gehen.jpg";

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
     * @param imageUrl The URL to an image showing the meal
     */
    constructor( id, canteenId, name, date, category, prices = {}, notes = [], imageUrl = DEFAULT_IMAGE_URL ) {
        if (!Meal.isValidMealDate(date)) throw new Error(`Invalid date format! Must be of format "YYYY-MM-DD" but was "${date}"`);
        Object.keys( prices ).forEach( priceGroup => prices[priceGroup] == null ? delete prices[priceGroup] : null );

        this.id = id;
        this.canteenId = canteenId;
        this.name = name;
        this.date = date;
        this.category = category;
        this.prices = prices;
        this.notes = notes;
        this.imageUrl = imageUrl;
    }

    /**
     * Creates a meal instance from a given object and date
     * @param {MealObj} obj The object containing all meal properties as returned from the OpenMensa API
     * @param {number} canteenId The id of the canteen that this meal belongs to
     * @param {string} date The date this meals is in the canteen
     */
    static fromObject( obj, canteenId, date ) {
        return new Meal(obj.id, canteenId, obj.name, date, obj.category, obj.prices, obj.notes, obj.image);
    }

    /**
     * Creates an instance of a meal by a given database result row
     * @param {MealDatabaseRow} row The result row as loaded from the database
     * @param {{ note: string }[]} notes The notes as loaded from the table "mealNotes"
     * @param {{ price: number, priceGroup: string }[]} prices The prices as loaded from the table "mealPrices"
     */
    static fromDatabase( row, notes, prices ) {
        const pricesObj = {};
        prices.forEach( p => pricesObj[p.priceGroup] = p.price );

        return new Meal( row.id, row.canteenId, row.name, row.date, row.category,
            pricesObj,
            notes.map( n => n.note ),
            row.imageUrl
        );
    }

    /**
     * Checks whether the given string is in format "YYYY-MM-DD"
     * @param {string} date The date string to check
     */
    static isValidMealDate( date ) {
        return /^[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date);
    }

}