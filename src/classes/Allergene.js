export default class Allergene {

    static get ALLERGENES() { return ALLERGENES; }

    /**
     * An allergene contained in a meal
     * @param {string} code The letter code
     * @param {string} name The descriptive name
     */
    constructor( code, name ) {
        this.code = code;
        this.name = name;
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
    new Map([
        {
            id: "A",
            name: "Gluten-containing cereals"
        },
        {
            id: "B",
            name: "Cretaceous"
        },
        {
            id: "C",
            name: "Eggs"
        },
        {
            id: "D",
            name: "Fish"
        },
        {
            id: "E",
            name: "Peanuts"
        },
        {
            id: "F",
            name: "Soy"
        },
        {
            id: "G",
            name: "Milk / Milk Sugar (Lactose)"
        },
        {
            id: "H",
            name: "Shell fruits (nuts)"
        },
        {
            id: "I",
            name: "Celery"
        },
        {
            id: "J",
            name: "Mustard"
        },
        {
            id: "K",
            name: "Sesame"
        },
        {
            id: "L",
            name: "Sulfite / sulfur dioxide"
        },
        {
            id: "M",
            name: "Lupins"
        },
        {
            id: "N",
            name: "Molluscs"
        }
    ].map( a => [a.id, new Allergene(a.id, a.name)] )
));
const ALLERGENES = Object.freeze(Array.from(ALLERGENES_MAP.values()));