import Locale from "./Locale";

export default class Allergene {

    static get ALLERGENES() { return ALLERGENES; }

    /**
     * An allergene contained in a meal
     * @param {string} code The letter code
     */
    constructor( code ) {
        this.code = code;
    }

    /** @type {string} The descriptive name */
    get name() {
        return Locale.LOCALE.ALLERGENES[this.code];
    }

    /**
     * Gets an allergene by its code
     * @param {string} code The letter code of the allergene
     * @returns The allergene or undefined
     */
    static fromCode( code ) {
        return ALLERGENES_MAP.get(code);
    }
    
    /**
     * Extracts information about an allergene from a note
     * @param {string} note The note
     */
    static fromNote( note ) {
        const code = /\(([A-N])\)$/.exec(note);
        if (code == null) return undefined;
        return Allergene.fromCode(code[1]);
    }

}

const ALLERGENES_MAP = Object.freeze(
    new Map([ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N" ].map( id => [id, new Allergene(id)] )
));
const ALLERGENES = Object.freeze(Array.from(ALLERGENES_MAP.values()));