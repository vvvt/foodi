const ENDPOINTS = Object.freeze({
    OPEN_MENSA_API: "https://openmensa.org/api/v2"
});

/**
 * This singleton class is responsible for all HTTP(S) requests
 * and other duties that belong to the networking.
 */
export default class NetworkManager {

    static get ENDPOINTS() { return ENDPOINTS; }

    constructor() {
        if (NetworkManager._instance) throw new Error("This is a singleton! Use NetworkManager.instance to access this class instance.");
    }
    
    /**
     * @returns {NetworkManager} The instance of the networkmanager singleton
     */
    static get instance() {
        if (!NetworkManager._instance) NetworkManager._instance = new NetworkManager();
        return NetworkManager._instance;
    }

    /**
     * Executes a HTTP(S) request on a given url with params
     * @param {string} url The url to fetch on
     * @param {{ [key: string]: number | string }} params The params given as key-value pairs in and object. They will be appended on the given url
     * @param {"GET"} method The HTTP method to use
     */
    async fetchWithParams(url, params = {}, method) {

        // remove adherent "/" to ensure valid params url
        if (url.endsWith("/")) url = url.slice(0, -1);

        // format params
        const paramsArr = Object.keys(params).map( key => key + "=" + params[key] );
        const paramsString = paramsArr.length === 0 ? "" : ("?" + paramsArr.join("&"));

        // execute actual request
        const res = await fetch(
            url + paramsString,
            {
                method,
                headers: {
                    "accept": "application/json"
                }
            }
        );

        // error checking
        if (!res.ok) throw new Error("HTTP request failed: " + await res.text());
        return await res.json();
        
    }

}