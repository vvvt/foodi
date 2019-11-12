/** @typedef {[number, number]} Coordinate An array containing latitude and longitude int this order */
/** @typedef {{ id: number, name: string, city: string, address: string, coordinates: Coordinate }} CanteenObj */
/** @typedef {{ id: number, name: string, city: string, address: string, lat: number, lng: number }} CanteenDatabaseRow */

const EARTH_VERTICAL = 20004;
const EARTH_HORIZONTAL = 40074;

export default class Canteen {

    /**
     * Creates an instance of a canteen
     * @param {number} id The id of the canteen as given from the OpenMensa API
     * @param {string} name The name of the canteen
     * @param {string} city The city name
     * @param {string} address The canteen address in format "Street nr., 01234 City, Country"
     * @param {Coordinate} coordinates The location of the canteen
     */
    constructor( id, name, city, address, coordinates ) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.address = address;
        this.coordinates = coordinates;
    }

    /**
     * Creates an instance of a canteen by a given object
     * @param {CanteenObj} obj The cannteen Object
     */
    static fromObject( obj ) {
        return new Canteen( obj.id, obj.name, obj.city, obj.address, obj.coordinates );
    }


    /**
     * Creates an instance of a canteen by a given database result row
     * @param {CanteenDatabaseRow} row The result row as loaded from the database
     */
    static fromDatabase( row ) {
        return new Canteen( row.id, row.name, row.city, row.address, [row.lat, row.lng] );
    }

    /**
     * Calculates the distance in km between two coordinates. This function
     * uses an efficient approximation that expects the earth to be flat.
     * Since the distances in this app are pretty small, this approx
     * should be sufficient.
     * @param {Coordinate} c1 The first coordinate
     * @param {Coordinate} c2 The second coordinate
     */
    static calcDistance( c1, c2 ) {

        // the vertical distance in km
        const dy = EARTH_VERTICAL * (Math.abs(c1[0]-c2[0])/180);

        // the horizontal distance in km
        const dx = EARTH_HORIZONTAL * (Math.abs(c1[1]-c2[1])/360) * Math.cos((c1[0]+c2[0])/2);

        // the euclidean distance
        return Math.sqrt(dx*dx + dy*dy);

    }

    /**
     * Calculates the distance of this canteen to another coordinate.
     * See Canteen.calcDistance() for more information
     * @param {Coordinate} c The coordinate [lat, lng] to calc the distance to
     */
    distanceTo( c ) {
        return Canteen.calcDistance( this.coordinates, c );
    }

    /**
     * Calculates a square given by two coordinates that contain at least all
     * coordinates in the given distance (as approximation). Every coordinate
     * outside of this square are definetly not inside the desired radius
     * @param {Coordinate} c The coordinate to get the bounds around
     * @param d The distance in km
     * @returns {[Coordinate, Coordinate]} [leftTopCoordinate, bottomRightCoordinate]
     */
    static getBoundingCoordinates( c, d = 7.5 ) {

        const c1 = [NaN, NaN];
        const c2 = [NaN, NaN];

        const lngSum = (d / EARTH_HORIZONTAL / Math.cos(c[0])) * 360;
        const lngs = [c[1] + lngSum, c[1] - lngSum];
        c1[1] = Math.min(...lngs);
        c2[1] = Math.max(...lngs);

        const latSum = (d / EARTH_VERTICAL) * 180;
        const lats = [c[0] + latSum, c[0] - latSum];
        c1[0] = Math.min(...lats);
        c2[0] = Math.max(...lats);

        return [c1, c2];

    }

}