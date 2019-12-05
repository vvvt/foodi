export default class Additive {

    static get ADDITIVES() { return ADDITIVES; }

    /**
     * An additive contained in a meal
     * @param {number} code The number code
     * @param {string} name The descriptive name
     */
    constructor( code, name ) {
        this.code = code;
        this.name = name;
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
        [
            {
                id: 1,
                name: "Coloring"
            },
            {
                id: 2,
                name: "Preservative"
            },
            {
                id: 3,
                name: "Antioxidant"
            },
            {
                id: 4,
                name: "Flavor enhancer"
            },
            {
                id: 5,
                name: "Fumigated"
            },
            {
                id: 6,
                name: "Blackened"
            },
            {
                id: 7,
                name: "Waxed"
            },
            {
                id: 8,
                name: "Phosphate"
            },
            {
                id: 9,
                name: "Sweetener"
            },
            {
                id: 10,
                name: "Phenylalanine source"
            },
        ].map( a => [a.id, new Additive(a.id, a.name)] )
    )
);
const ADDITIVES = Object.freeze(Array.from(ADDITIVES_MAP.values()));