import Locale from "./Locale";

export default class Additive {

    static get ADDITIVES() { return ADDITIVES; }

    /**
     * An additive contained in a meal
     * @param {number} code The number code
     */
    constructor( code ) {
        this.code = code;
    }

    /** @type {string} The descriptive name */
    get name() {
        return Locale.LOCALE.ADDITIVES[this.code];
    }

    /**
     * Gets an additive by its code
     * @param {number} code The number code of the additive
     * @returns The additive or undefined
     */
    static fromCode( code ) {
        return ADDITIVES_MAP.get(code);
    }

    /**
     * Extracts information about an additive from a note
     * @param {string} note The note
     */
    static fromNote( note ) {
        const code = /\((\d+)\)$/.exec(note);
        if (code == null) return undefined;
        return Additive.fromCode(Number.parseInt(code[1]));
    }

}

const ADDITIVES_MAP = Object.freeze(
    new Map(
        [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map( id => [id, new Additive(id)] )
    )
);
const ADDITIVES = Object.freeze(Array.from(ADDITIVES_MAP.values()));