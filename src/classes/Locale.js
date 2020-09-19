import moment from "moment";
import "moment/locale/de";

/** @typedef {"en" | "de"} CountryCode */

const LOCALES = Object.freeze({
    "en": {
        FILTERS: {
            "preferences": "Preferences",
            "allergenes": "Allergenes",
            "additives": "Additives",
            "vegetarian": "Vegetarian only",
            "vegan": "Vegan only",
            "beef": "Beef",
            "pork": "Pork",
            "alcohol": "Alcohol",
            "garlic": "Garlic",
            "evening-meal": "Evening meals",
            "A": "A - Gluten-containing cereals",
            "B": "B - Crustacean",
            "C": "C - Eggs",
            "D": "D - Fish",
            "E": "E - Peanuts",
            "F": "F - Soy",
            "G": "G - Milk / Milk Sugar (Lactose)",
            "H": "H - Shell fruits (nuts)",
            "I": "I - Celery",
            "J": "J - Mustard",
            "K": "K - Sesame",
            "L": "L - Sulfite / sulfur dioxide",
            "M": "M - Lupins",
            "N": "N - Molluscs",
            "1": "1 - Food dye",
            "2": "2 - Preservative",
            "3": "3 - Antioxidants",
            "4": "4 - Flavor enhancer",
            "5": "5 - Sulfurated",
            "6": "6 - Blackened",
            "7": "7 - Waxed",
            "8": "8 - Contains phosphate",
            "9": "9 - Containes sweeteners",
            "10": "10 - Contains a phenylalanine source"
        },
        ALLERGENES: {
            "A": "Gluten-containing cereals",            
            "B": "Cretaceous",            
            "C": "Eggs",            
            "D": "Fish",            
            "E": "Peanuts",            
            "F": "Soy",            
            "G": "Milk / Milk Sugar (Lactose)",            
            "H": "Shell fruits (nuts)",            
            "I": "Celery",            
            "J": "Mustard",            
            "K": "Sesame",            
            "L": "Sulfite / sulfur dioxide",            
            "M": "Lupins",            
            "N": "Molluscs"
        },
        ADDITIVES: {
            1: "Coloring",
            2: "Preservative",
            3: "Antioxidant",
            4: "Flavor enhancer",
            5: "Fumigated",
            6: "Blackened",
            7: "Waxed",
            8: "Phosphate",
            9: "Sweetener",
            10: "Phenylalanine source"
        },
        SETTINGS: {
            "fetch-images-cellular": "Download images using cellular",
            "settings": "Settings",
            "clear-cache": "Clear cache",
            "cache-cleared": "The cache was cleared.",
            "cache-clear-error": "An error occured while clearing the cache!"
        },
        TAB_NAVIGATOR: {
            "finder": "Finder",
            "filter": "Filter",
            "map": "Navigation",
            "settings": "Settings"
        },
        FINDER_SCREEN: {
            "list_no-meals": "No meals found :(",
            "today": "today",
            "tomorrow": "tomorrow",
            "yesterday": "yesterday",
        },
        MEAL_DETAILS: {
            "allergenes": "Allergenes",
            "additives": "Additives",
            "no": "No"
        },
        MAP_SCREEN: {
            "away": "away"
        }
    },

    "de": {
        FILTERS: {
            "preferences": "Präferenzen",
            "allergenes": "Allergene",
            "additives": "Zusatzstoffe",
            "vegetarian": "Nur vegetatrisch",
            "vegan": "Nur vegan",
            "beef": "Rindfleisch",
            "pork": "Schweinefleisch",
            "alcohol": "Alkohol",
            "garlic": "Knoblauch",
            "evening-meal": "Abendangebote",
            "A": "A - Glutenhaltiges Getreide",
            "B": "B - Krebstiere",
            "C": "C - Eier",
            "D": "D - Fisch",
            "E": "E - Erdnüsse",
            "F": "F - Soja",
            "G": "G - Milch / Milchzucker (Laktose)",
            "H": "H - Schalenfrüchte (Nüsse)",
            "I": "I - Sellerie",
            "J": "J - Senf",
            "K": "K - Sesam",
            "L": "L - Sulfit / Schwefeldioxid",
            "M": "M - Lupine",
            "N": "N - Weichtiere",
            "1": "1 - Farbstoff",
            "2": "2 - Konservierungsstoffe",
            "3": "3 - Antioxidationsmittel",
            "4": "4 - Geschmacksverstärker",
            "5": "5 - Geschwefelt",
            "6": "6 - Geschwärzt",
            "7": "7 - Gewachst",
            "8": "8 - Phosphat",
            "9": "9 - Süßungsmittel",
            "10": "10 - Phenylalaninquellen"
        },
        ALLERGENES: {
            "A": "Glutenhaltiges Getreide",
            "B": "Krebstiere",
            "C": "Eier",
            "D": "Fisch",
            "E": "Erdnüsse",
            "F": "Soja",
            "G": "Milch / Milchzucker (Laktose)",
            "H": "Schalenfrüchte (Nüsse)",
            "I": "Sellerie",
            "J": "Senf",
            "K": "Sesam",
            "L": "Sulfit / Schwefeldioxid",
            "M": "Lupine",
            "N": "Weichtiere",
        },
        ADDITIVES: {
            1: "Farbstoff",
            2: "Konservierungsstoffe",
            3: "Antioxidationsmittel",
            4: "Geschmacksverstärker",
            5: "Geschwefelt",
            6: "Geschwärzt",
            7: "Gewachst",
            8: "Phosphat",
            9: "Süßungsmittel",
            10: "Phenylalaninquellen"
        },
        SETTINGS: {
            "fetch-images-cellular": "Bilder mit mobilen Daten laden",
            "settings": "Einstellungen",
            "clear-cache": "Cache leeren",
            "cache-cleared": "Der Cache wurde geleert.",
            "cache-clear-error": "Der Cache konnte auf Grund eines Fehlers nicht geleert werden!"
        },
        TAB_NAVIGATOR: {
            "finder": "Finder",
            "filter": "Filter",
            "map": "Navigation",
            "settings": "Einstellungen"
        },
        FINDER_SCREEN: {
            "list_no-meals": "Keine Gerichte gefunden :(",
            "today": "heute",
            "tomorrow": "morgen",
            "yesterday": "gestern",
        },
        MEAL_DETAILS: {
            "allergenes": "Allergene",
            "additives": "Zusatzstoffe",
            "no": "Keine"
        },
        MAP_SCREEN: {
            "away": "entfernt"
        }
    }
});

/** @type {CountryCode} */
let CURRENT_LANGUAGE = "en"

export default class Locale {

    /** @returns {CountryCode} The currently set language code */
    static get language() {
        return CURRENT_LANGUAGE;
    }

    /**
     * Sets the new language to use in the app
     * @param {CountryCode} language The country code of the new language
     */
    static setLanguage( language ) {
        if (LOCALES[language]) {
            console.log(`Changing the language from "${CURRENT_LANGUAGE}" to "${language}"...`);
            CURRENT_LANGUAGE = language;
            moment.locale(language);
        } else {
            console.warn(`No translation found for the language "${language}", keeping the previously set language!`);
        }
    }

    static get LOCALE() {
        return LOCALES[Locale.language];
    }
    
}