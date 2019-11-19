export default class Util {

    /**
     * The current unix timestamp
     */
    static get currentUnixTimestamp() {
        return Math.round( Date.now()/1000 );
    }

    /**
     * Converts a given distance in km to a humanly readable string
     * @param {number} distance The distance in km
     */
    static distanceToString( distance ) {
        if (distance < 1) return Math.round(distance*1000) + "m";
        return distance.toFixed(2) + "km";
    }

}