const EARTH_VERTICAL = 20004;
const EARTH_HORIZONTAL = 40074;

/** @typedef {[number, number]} CoordinateArray An array containing latitude and longitude in this order */
/** @typedef {{ lat: number, lng: number }} CoordinateDatabaseRow */

export default class Coordinate {
    
    /**
     * Represents a coordinate in the world with a given latitude and longitude
     * @param {number} latitude The latidude (between -90 and 90)
     * @param {number} longitude The longitude (between -180 and 180)
     */
    constructor( latitude, longitude ) {
        if (typeof latitude !== "number" || isNaN(latitude) || latitude < -90 || latitude > 90)
            throw new TypeError("The latitude must be a number between -90 and 90!");
        if (typeof longitude !== "number" || isNaN(longitude) || longitude < -180 || longitude > 180)
            throw new TypeError("The longitude must be a number between -180 and 180!");

        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Creates an instance of a coordinate from a database result row
     * @param {CoordinateDatabaseRow} row The database result row
     */
    static fromDatabase( row ) {
        return new Coordinate( row.lat, row.lng );
    }

    /**
     * Creates a new coordinate from an array as returned from the OpenMensa API
     * @param {CoordinateArray} arr An array containing latitude and longitude in this order
     */
    static fromArray( arr ) {
        if (!Array.isArray(arr) || arr.length !== 2) throw new TypeError("The given object must be an array of length 2!");
        return new Coordinate( arr[0], arr[1] );
    }

    /**
     * @returns {Coordinate} An array containing latitude and longitude in this order
     */
    toArray() {
        return [this.latitude, this.longitude];
    }

    /**
     * Calculates the distance in km between two coordinates. This function
     * uses an efficient approximation that expects the earth to be flat
     * (uuh flat earther). Since the distances in this app are pretty small,
     * this approx should be sufficient.
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
     * Calculates the distance of this coordinate to another coordinate in km
     * @see Cordinate.calcDistance() for more information
     * @param {Coordinate} c The coordinate to calc the distance to
     */
    distanceTo( c ) {
        return Coordinate.calcDistance( this, c );
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