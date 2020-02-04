const fs = require("fs");

// check environment variable
const setApiKey = process.env["SET_API_KEY"] == "true";

// constants
const GOOGLE_API_KEY_FILEPATH = "GOOGLE_API_KEY.txt";
const APP_JSON_FILEPATH = "app.json";
const DEFAULT_API_KEY = "api-key";
const GOOGLE_API_KEY = fs.existsSync(GOOGLE_API_KEY_FILEPATH) ?  fs.readFileSync(GOOGLE_API_KEY_FILEPATH, "utf-8") : DEFAULT_API_KEY;

// the api key to write into app.json
const API_KEY_TO_WRITE = setApiKey ? GOOGLE_API_KEY : DEFAULT_API_KEY;

// read app.json
const appJson = JSON.parse(fs.readFileSync(APP_JSON_FILEPATH, "utf-8"));

// set google API key
console.log(`Settings google maps API key to "${API_KEY_TO_WRITE}"`);
appJson.expo.android.config.googleMaps.apiKey = API_KEY_TO_WRITE;

// write back app.json
fs.writeFileSync(APP_JSON_FILEPATH, JSON.stringify(appJson, null, 2));