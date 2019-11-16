import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { AppLoading } from "expo";

// manager imports
import DatabaseManager from "./src/manager/DatabaseManager";
import NetworkManager from "./src/manager/NetworkManager";
import LocationManager from "./src/manager/LocationManager";

// screen imports
import HomeScreen from "./src/screens/HomeScreen";
import TestScreen from "./src/screens/TestScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import PreferencesScreen from "./src/screens/PreferencesScreen";
import MapScreen from "./src/screens/MapScreen";
import PermissionDeniedScreen from "./src/screens/PermissionDeniedScreen";

const locationManager = LocationManager.instance;

/* * * * * * * * * * * *
 * ADD NEW SCREEN HERE *
 * * * * * * * * * * * */
const AppNavigator = createStackNavigator(
    {
        home: {
            screen: HomeScreen,
            navigationOptions: () => ({
                title: "Home"
            })
        },
        test: {
            screen: TestScreen,
            navigationOptions: () => ({
                title: "Test Screen"
            })
        },
        settings: {
            screen: SettingsScreen,
            navigationOptions: () => ({
                title: "Settings Screen"
            })
        },
        preferences: {
            screen: PreferencesScreen,
            navigationOptions: () => ({
                title: "Preferenes Screen"
            })
        },
        map: {
            screen: MapScreen,
            navigationOptions: () => ({
                title: "Map Screen"
            })
        }

    },
    {
        initialRouteName: "home"
    }
);

// the actual content of the app
const AppContainer = createAppContainer(AppNavigator);

// load the app and show splash screen until done
const LOADING_STATES = Object.freeze({
    LOADING: 0,
    LOADING_FAILED: 1,
    LOADING_SUCCEEDED: 2,
    PERMISSIONS_DENIED: 3
});

// the root of the app that initializes it first
export default class App extends React.PureComponent {

    state = {
        loadingState: LOADING_STATES.LOADING
    };

    render() {
        switch(this.state.loadingState) {
            case LOADING_STATES.LOADING_SUCCEEDED:
                return <AppContainer />;
            case LOADING_STATES.LOADING_FAILED:
                return null;
            case LOADING_STATES.PERMISSIONS_DENIED:
                return <PermissionDeniedScreen />
            case LOADING_STATES.LOADING:
                return (
                    <AppLoading
                        startAsync={this.initialize.bind(this)}
                        onError={err => {
                            console.error("Could not initialize the database manager:", err);
                            this.setState({ loadingState: LOADING_STATES.LOADING_FAILED });
                        }}
                        onFinish={() => this.setState({ loadingState: LOADING_STATES[locationManager.hasPermission ? "LOADING_SUCCEEDED" : "PERMISSIONS_DENIED"] })}
                    />
                );
            default:
                return null;
        }
    }

    /**
     * Initializes all managers
     */
    async initialize() {
        await Promise.all([
            DatabaseManager.instance.initialize(),
            NetworkManager.instance.initialize(),
            locationManager.initialize()
        ]);

        console.log("Successfully intialized the app");
    }

}