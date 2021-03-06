/** @typedef {[number, number]} CoordinateArray An array containing latitude and longitude in this order */
/** @typedef {{ lat: number, lng: number }} CoordinateDatabaseRow */
/** @typedef {{ latitude: number, longitude: number }} CoordinateObj */

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
     * Creates a new coordinate from an object as returned from the Location tracking
     * @param {CoordinateObj} obj The object
     */
    static fromObject( obj ) {
        return new Coordinate( obj.latitude, obj.longitude );
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

        const x = c2.latitude - c1.latitude;
        const y = (c2.longitude - c1.longitude) * Math.cos((c1.latitude + c2.latitude) / 2);
        return 110.25 * Math.sqrt(x*x + y*y);

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
     * Compares two coordinates on equality
     * @param {Coordinate} c1 First coordinate
     * @param {Coordinate} c2 Second coordinate
     */
    static equal(c1, c2) {
        return c1.latitude === c2.latitude && c1.longitude === c2.longitude;
    }

    /**
     * Checks if this coordinate is equal to anther on
     * @param {Coordinate} c The coordinate to compare
     */
    equalTo( c ) {
        return Coordinate.equal(this, c);
    }

}