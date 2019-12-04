import EventEmitter from "events";
import NetInfo from "@react-native-community/netinfo";

/**
 * @callback ResolveFunction
 * @param {any} value
 * @returns {void}
 */

/**
 * @callback RejectFunction
 * @param {Error} [reason]
 * @returns {void}
 */

/** @typedef {"HIGH" | "MODERATE" | "LOW"} Priority */

const ENDPOINTS = Object.freeze({
    OPEN_MENSA_API: "https://api.studentenwerk-dresden.de/openmensa/v2"
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

const FETCH_PARALLEL_COUNTS_OF_NETWORK_SPEEDS = {};
FETCH_PARALLEL_COUNTS_OF_NETWORK_SPEEDS[NETWORK_SPEED.NONE] = 0;
FETCH_PARALLEL_COUNTS_OF_NETWORK_SPEEDS[NETWORK_SPEED.SLOW] = 1;
FETCH_PARALLEL_COUNTS_OF_NETWORK_SPEEDS[NETWORK_SPEED.FAST] = 10;

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

        this._currentFetchesCount = 0;

        /** @private @type {{ [priority: string]: [ResolveFunction, RejectFunction, ...any][] }} */
        this._requestQueue = {
            HIGH: [],
            MODERATE: [],
            LOW: []
        };

    }

    /**
     * @private
     */
    _workOnQueue() {
        try {
            const parallelCount = FETCH_PARALLEL_COUNTS_OF_NETWORK_SPEEDS[this.networkState.speed];
            if (this._currentFetchesCount >= parallelCount) return;

            const priorityOrder = ["HIGH", "MODERATE", "LOW"];
            const workToDo = this._requestQueue.HIGH.splice(0,0);
            priorityOrder.forEach( priority => {
                workToDo.push( ...this._requestQueue[priority].splice(0, parallelCount - this._currentFetchesCount - workToDo.length) );
            });

            // use the enqueued Promise for the fetch resolve and reject
            this._currentFetchesCount += workToDo.length;
            workToDo.forEach( ([resolve, reject, ...args]) => {
                fetch(...args)
                    .then(resolve)
                    .catch(reject)
                    .finally( () => {
                        this._currentFetchesCount--;
                        this._workOnQueue();
                    });
            });
        } catch(e) {
            console.error("Unknown error while working on the fetch queue:", e);
        }
    }
    
    /**
     * @private
     * @param {Priority} priority 
     * @param args 
     * @returns {Promise<Response>}
     */
    _queuedFetch(priority, ...args) {
        const promise = new Promise( (resolve, reject) => this._requestQueue[priority].push([resolve, reject, ...args]) );
        this._workOnQueue();
        return promise;
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

        console.log(`Current network state: speed=${this.networkState.speed} limit=${this.networkState.trafficLimit}`);
        this.emit("networkStateChanged", this.networkState);

    }

    /**
     * Executes a HTTP(S) request on a given url with params
     * @param {string} url The url to fetch on
     * @param {{ [key: string]: number | string }} params The params given as key-value pairs in and object. They will be appended on the given url
     * @param {Priority} priority The priority of this request in comparison to other requests
     */
    async fetchWithParams(url, params = {}, priority = "MODERATE") {

        // remove adherent "/" to ensure valid params url
        if (url.endsWith("/")) url = url.slice(0, -1);

        // format params
        const paramsArr = Object.keys(params).map( key => key + "=" + params[key] );
        const paramsString = paramsArr.length === 0 ? "" : ("?" + paramsArr.join("&"));

        // execute actual request. It will be executed depending on its network priority
        return await this._queuedFetch(
            priority,
            url + paramsString
        );
        
    }

}