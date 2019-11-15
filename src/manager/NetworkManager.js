import EventEmitter from "events";
import NetInfo from "@react-native-community/netinfo";

const ENDPOINTS = Object.freeze({
    OPEN_MENSA_API: "https://openmensa.org/api/v2"
});

const NETWORK_TRAFFIC_LIMIT = Object.freeze({
    UNLIMITED: 0,
    LIMITED: 1
});

const NETWORK_SPEED = Object.freeze({
    NONE: 0,
    SLOW: 1,
    FAST: 2
});

/**
 * This singleton class is responsible for all HTTP(S) requests
 * and other duties that belong to the networking.
 */
export default class NetworkManager extends EventEmitter {

    static get ENDPOINTS() { return ENDPOINTS; }
    static get NETWORK_SPEED() { return NETWORK_SPEED; }
    static get NETWORK_TRAFFIC_LIMIT() { return NETWORK_TRAFFIC_LIMIT; }

    /**
     * @returns {NetworkManager} The instance of the networkmanager singleton
     */
    static get instance() {
        if (!NetworkManager._instance) NetworkManager._instance = new NetworkManager();
        return NetworkManager._instance;
    }

    constructor() {
        super();
        if (NetworkManager._instance) throw new Error("This is a singleton! Use NetworkManager.instance to access this class instance.");

        // set dummy network state properties
        this.networkState = {
            /** One of NEWORK_TRAFFIC_LIMIT */
            trafficLimit: NETWORK_TRAFFIC_LIMIT.LIMITED,
            /** One of NEWORK_SPEED */
            speed: NETWORK_SPEED.SLOW
        };
    }

    /**
     * Asynchronously prepares everything that is needed to use this singleton
     * class.
     */
    async initialize() {

        // set the initial network state
        this.handleNetworkStateChange( await NetInfo.fetch() );

        // handle network state changes
        NetInfo.addEventListener( this.handleNetworkStateChange.bind(this) );

    }

    /**
     * A callback to be called when the network state of the device changes
     * @param {import("@react-native-community/netinfo").NetInfoState} state The new network state
     */
    handleNetworkStateChange( state ) {

        // if has internet => determine network speed and traffic limit
        if (state.isConnected) {
            switch (state.type) {
                case "wifi":
                case "vpn":
                case "ethernet":
                case "wimax":
                    this.networkState.trafficLimit = NETWORK_TRAFFIC_LIMIT.UNLIMITED;
                    this.networkState.speed = NETWORK_SPEED.FAST;
                    break;
                
                case "cellular":
                    // get specific cellular connection status
                    const cellularGeneration = state.details.cellularGeneration;
                    this.networkState.trafficLimit = NETWORK_TRAFFIC_LIMIT.LIMITED;
                    
                    switch (cellularGeneration) {
                        case "3g":
                        case "4g":
                            this.networkState.speed = NETWORK_SPEED.FAST;
                            break;

                        default:
                            this.networkState.speed = NETWORK_SPEED.SLOW;
                    }
                    break;

                default:
                    this.networkState.trafficLimit = NETWORK_TRAFFIC_LIMIT.LIMITED;
                    this.networkState.speed = NETWORK_SPEED.SLOW;
            }
        } else {
            this.networkState.speed = NETWORK_SPEED.NONE;
        }

        console.log(`Current network state:\n` +
            `[network speed]:\t${this.networkState.speed}\n` +
            `[traffic limit]:\t${this.networkState.trafficLimit}\n`
        );
        this.emit("networkStateChanged", this.networkState);

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