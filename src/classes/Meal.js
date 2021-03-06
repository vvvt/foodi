import Allergene from "./Allergene";
import Additive from "./Additive";

import DEFAULT_IMAGE from "../assets/default-meal-image.jpg";
import NetworkManager from "../manager/NetworkManager";
import SettingsManager from "../manager/SettingsManager";

const networkManager = NetworkManager.instance;
const settingsManager = SettingsManager.instance;

const IMAGE_URL_PROTOCOL = "http";

const PRICE_CATEGORIES = Object.freeze({
    STUDENT: "Studierende",
    STAFF: "Bedienstete",
    PUPIL: "Schüler"
});

/** @typedef {"Studierende"|"Bedienstete"} PriceGroup */

/** @typedef {{ id: number, name: string, notes: string[], prices: { [priceGroup: string]: number }, category: string, image: string }} MealObj */
/** @typedef {{ id: number, canteenId: number, name: string, date: string, category: string, imageUrl: string }} MealDatabaseRow */

export default class Meal {

    /**
     * @returns {import("react-native").ImageRequireSource} The imported local image to show if no meal image is present
     */
    static get DEFAUL_MEAL_IMAGE() { return DEFAULT_IMAGE; }

    static get PRICE_CATEGORIES() { return PRICE_CATEGORIES; }

    /**
     * Parses notes into allergenes and more meal information
     * @param {string[]} notes The notes to extract the informations of
     */
    static parseNotes( notes ) {

        const res = {
            /** @type {Allergene[]} */
            allergenes: [],
            /** @type {Additive[]} */
            additives: [],
            /** @type {string[]} */
            notes: [],
            isVegetarian: false,
            isVegan: false,
            containsPork: false,
            containsBeef: false,
            containsAlcohol: false,
            containsGarlic: false
        }

        notes.forEach( note => {
            var parsed = Allergene.fromNote(note);
            if (parsed) return res.allergenes.push(parsed);
            parsed = Additive.fromNote(note);
            if (parsed) return res.additives.push(parsed);
            if (note.startsWith("Menü ist ")) {
                switch (note.substr(9)) {
                    case "vegetarisch":
                        return res.isVegetarian = true;
                    case "vegan":
                        return res.isVegan = true;
                    default:
                        return console.warn(`Unknown meal property: "${note}"`);
                }
            }
            if (note.startsWith("enthält ")) {
                switch (note.substr(8)) {
                    case "Schweinefleisch":
                        return res.containsPork = true;
                    case "Rindfleisch":
                        return res.containsBeef = true;
                    case "Alkohol":
                        return res.containsAlcohol = true;
                    case "Knoblauch":
                        return res.containsGarlic = true;
                    default:
                        return console.warn(`Unknown meal property: "${note}"`);
                }
            }
            res.notes.push(note);
        });

        return res;
    }

    /**
     * Represents a meal in a canteen on a specific date
     * @param {number} id The id as of OpenMensa
     * @param {number} canteenId The id of the canteen that this meal belongs to
     * @param {string} name The name
     * @param {string} date The date the meal is in the canteen. In format "YYYY-MM-DD"
     * @param {string} category Eg. "fertig 1", "Wok", "Grill", ...
     * @param {{ [priceGroup: string]: number }} prices Different prices of the meal
     * @param {string[]} notes The notes eg. "vegetarian"
     * @param {import("react-native").ImageRequireSource | string} image The URL to an image showing the meal or the integer returned after importing a static (local) image
     */
    constructor( id, canteenId, name, date, category, prices = {}, notes = [], image = DEFAULT_IMAGE ) {
        if (!Meal.isValidMealDate(date)) throw new Error(`Invalid date format! Must be of format "YYYY-MM-DD" but was "${date}"`);
        if (image == null || image === "//static.studentenwerk-dresden.de/bilder/mensen/studentenwerk-dresden-lieber-mensen-gehen.jpg") image = DEFAULT_IMAGE;
        Object.keys( prices ).forEach( priceGroup => prices[priceGroup] == null ? delete prices[priceGroup] : null );
        if (typeof image === "string" && image.startsWith("//")) image = IMAGE_URL_PROTOCOL+":"+image;

        this.id = id;
        this.canteenId = canteenId;
        this.name = name.replace(/\,([^\s])/g, ", $1"); // add spaces to the meal after "," if the Studentenwerk forgot them so the layout can have line breakes on them
        this.date = date;
        this.category = category;
        this.prices = prices;
        /** @private For persitance purposes only */
        this._originalNotes = notes;

        /** @type {import("react-native").ImageSourcePropType} */
        this._image = typeof image === "string" ? { uri: image } : image;

        // extract allergenes and stuff from notes
        try {
            const mealProperties = Meal.parseNotes(notes);
            this.isVegan = mealProperties.isVegan;
            this.isVegetarian = mealProperties.isVegetarian || mealProperties.isVegan;
            this.containsBeef = mealProperties.containsBeef;
            this.containsPork = mealProperties.containsPork;
            this.containsAlcohol = mealProperties.containsAlcohol;
            this.containsGarlic = mealProperties.containsGarlic;
            this.allergenes = mealProperties.allergenes/*.filter( (a, i, arr) => arr.indexOf(a) === i )*/;
            this.additives = mealProperties.additives;
            this.notes = mealProperties.notes;
        } catch(e) {
            console.error("Error parsing the meal notes:", e);
        }
    }

    get isEveningMeal() {
        return this.category.startsWith("Abendangebot");
    }

    get hasDefaultImage() {
        return this._image === DEFAULT_IMAGE;
    }

    /** @type {import("react-native").ImageSourcePropType} */
    get image() {
        if (networkManager.networkState.trafficLimit === 0 || settingsManager.getSetting("fetch-images-cellular").value === true) return this._image;
        return DEFAULT_IMAGE;
    }

    /**
     * @returns {import("../classes/Meal").PriceGroup} The current price group to use.
     * Either staff or student
     */
    get userPriceGroup() {
        return settingsManager.getSetting("use-staff-prices").value === true ? PRICE_CATEGORIES.STAFF : this.canteenId === 30 ? PRICE_CATEGORIES.PUPIL : PRICE_CATEGORIES.STUDENT;
    }

    /**
     * Returns the price of this meal for the given price category
     * @param {PriceGroup} priceGroup The price group. Students or staff
     * @param asString DEFAULT: true. If true, the price as string with "€" is returned
     */
    getPrice( priceGroup = undefined, asString = true ) {
        if (typeof priceGroup !== "string") priceGroup = this.userPriceGroup;
        const price = this.prices[priceGroup];
        if (asString) return price === undefined ? "n/a" : price.toFixed(2) + "€";
        return price;
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

        return new Meal( row.id, row.canteenId, row.name, row.date, row.category, pricesObj, notes.map( n => n.note ), row.imageUrl );
    }

    /**
     * Checks whether the given string is in format "YYYY-MM-DD"
     * @param {string} date The date string to check
     */
    static isValidMealDate( date ) {
        return /^[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date);
    }

}