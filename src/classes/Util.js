export default class Util {

    /**
     * The current unix timestamp
     */
    static get currentUnixTimestamp() {
        return Math.round( Date.now()/1000 );
    }

}