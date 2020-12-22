"use strict";

const fs = require("fs");
const os = require("os");
const sp = require("child_process");
const path = require("path");
const APP_CONFIG = require("./app.json");
const TARGET_FILEPATH = path.join(os.tmpdir(), "app.json");

if (process.argv.length < 3) throw new Error("Missing command line argument for the build target!");

/** @type {"android"|"ios"} */
const BUILD_TARGET = process.argv[2];

// read google maps API key
switch (BUILD_TARGET) {
    case "android":
        const keyfile = path.join(__dirname, "GOOGLE_API_KEY.txt");
        console.log(`Looking for google maps API key at ${keyfile}...`);
        if (!fs.existsSync(keyfile)) throw new Error("The file with the google maps API key is missing!");
        APP_CONFIG.expo.android.config.googleMaps.apiKey = fs.readFileSync(keyfile, "utf-8").trim();
        console.log(`Using the API key "${APP_CONFIG.expo.android.config.googleMaps.apiKey}" for the build`);
        break;
    case "ios":
        throw new Error("iOS builds are not supported ATM. Provide a key first!");
    default:
        throw new Error(`Unkown build target "${BUILD_TARGET}"!`);
}

// write temporary app.json
fs.writeFileSync(TARGET_FILEPATH, JSON.stringify(APP_CONFIG));
console.log(`Successfully written the temporary app.json for the build into "${TARGET_FILEPATH}"`);

// build in subprocess
console.log("Starting the build...");
sp.spawn("expo", ["build:android", "--config", TARGET_FILEPATH], { stdio: "inherit" });