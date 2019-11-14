import NetworkManager from "./NetworkManager";
import DatabaseManager from "./DatabaseManager";

import Canteen from "../classes/Canteen";
import Coordinate from "../classes/Coordinate";

const networkManager = NetworkManager.instance;
const databaseManager = DatabaseManager.instance;

export default class CanteenManager {

    constructor() {
        if (CanteenManager._instance) throw new Error("This is a singleton! Use CanteenManager.instance to access this class instance.");
    }
    
    /**
     * @returns {CanteenManager} The instance of the canteen manager singleton
     */
    static get instance() {
        if (!CanteenManager._instance) CanteenManager._instance = new CanteenManager();
        return CanteenManager._instance;
    }

    /**
     * Fetches canteen in a given radius around a given position
     * @param {Coordinate} position The position to find canteens from
     * @param distance Default: 7.5. The maximum distance in km to the given position a returned canteen can have
     */
    async fetchCanteens( position, distance = 7.5 ) {
        if (!Array.isArray(position) || position.length !== 2) throw new TypeError("The position must be an array containing 2 elements!");

        /** @type {import("../classes/Canteen").CanteenObj[]} */
        const canteenObjs = await networkManager.fetchWithParams(
            NetworkManager.ENDPOINTS.OPEN_MENSA_API + `/canteens`,
            {
                "near[lat]": position[0],
                "near[lng]": position[1],
                "near[dist]": distance
            }
        );

        return canteenObjs.map( c => Canteen.fromObject( c ) );
    }

    /**
     * Saves the given array of canteens in the database
     * @param {Canteen[]} canteens The canteens to save
     */
    async saveCanteens( canteens ) {
        await databaseManager.runInTransaction(
            canteens.map( c =>
                [DatabaseManager.STATEMENTS.INSERT_INTO_CANTEENS, c.id, c.name, c.city, c.address, c.coordinate.latitude, c.coordinate.longitude]
            )
        );
    }

    /**
     * Loads all cached (persisted) canteens from the database. A search region can be passed.
     * If so, the canteens are returned with their distance to the given position
     * @param {Coordinate} position Optional: The position to load cached canteens from.
     * If none given, all canteens will be returned
     * @param distance Default: 7.5. The search radius around the given position in km 
     */
    async loadCanteens( position = null, distance = 7.5 ) {
        /** @type {import("../classes/Canteen").CanteenDatabaseRow[]} */
        let rows = [];

        if (position == null) {
            rows = await databaseManager.getAll(DatabaseManager.STATEMENTS.LOAD_ALL_CANTEENS);
            return rows.map( r => Canteen.fromDatabase(r) );
        } else {
            const boundingBox = Coordinate.getBoundingCoordinates( position, distance );
            rows = await databaseManager.getAll(
                DatabaseManager.STATEMENTS.LOAD_CANTEENS_BETWEEN_COORDINATES,
                [boundingBox[0].latitude, boundingBox[1].latitude, boundingBox[0].longitude, boundingBox[1].longitude]
            );

            // sadly SQLite does not have any SQRT() function, so we have to do further filtering here
            return rows
                .map( r => ({ canteen: Canteen.fromDatabase(r), distance: Coordinate.calcDistance( Coordinate.fromDatabase(r), position ) }) )
                .filter( c => c.distance <= distance );


        }
    }

}