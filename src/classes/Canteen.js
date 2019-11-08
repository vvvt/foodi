/** @typedef {[number, number]} Coordinate An array containing latitude and longitude */
/** @typedef {{ id: number, name: string, city: string, address: string, coordinates: Coordinate }} CanteenObj */
/** @typedef {{ id: number, name: string, city: string, address: string, lat: number, lng: number }} CanteenDatabaseRow */

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

}