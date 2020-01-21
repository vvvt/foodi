import React from "react";
import { createAppContainer } from "react-navigation";
import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from "react-navigation-tabs";
import { AppLoading } from "expo";

// manager imports
import DatabaseManager from "./src/manager/DatabaseManager";
import NetworkManager from "./src/manager/NetworkManager";
import LocationManager from "./src/manager/LocationManager";

// screen imports
import FinderScreen from "./src/screens/FinderScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import FilterScreen from "./src/screens/FilterScreen";
import MapScreen from "./src/screens/MapScreen";
import CanteenManager from "./src/manager/CanteenManager";
import MealManager from "./src/manager/MealManager";
import PermissionsScreen from "./src/screens/PermissionsScreen";
import SettingsManager from "./src/manager/SettingsManager";

/* * * * * * * * * * * *
 * ADD NEW SCREEN HERE *
 * * * * * * * * * * * */
const AppNavigator = createBottomTabNavigator(
    {
        finder: {
            screen: FinderScreen,
            navigationOptions: () => ({
                title: "Finder",
                tabBarIcon: ({tintColor}) => (
                    <Feather
                        name="search"
                        size={19}
                        color={tintColor}
                    />
                )
            })
        },
        filter: {
            screen: FilterScreen,
            navigationOptions: () => ({
                title: "Filter",
                tabBarIcon: ({tintColor}) => (
                    <Feather
                        name="filter"
                        size={19}
                        color={tintColor}
                    />
                )
            })
        },
        map: {
            screen: MapScreen,
            navigationOptions: () => ({
                title: "Navigation",
                tabBarIcon: ({tintColor}) => (
                    <Feather
                        name="map"
                        size={19}
                        color={tintColor}
                    />
                )
            })
        },
        settings: {
            screen: SettingsScreen,
            navigationOptions: () => ({
                title: "Settings",
                tabBarIcon: ({tintColor}) => (
                    <Feather
                        name="settings"
                        size={19}
                        color={tintColor}
                    />
                )
            })
        }

    },
    {
        initialRouteName: "finder",
        tabBarOptions: {
            labelPosition: "below-icon",
            activeTintColor: "#FFFFFF",
            inactiveTintColor: "#77D0FF",
            activeBackgroundColor: "#0077B3",
            inactiveBackgroundColor: "#0077B3",
            style: {
                height: 55,
                paddingVertical: 8,
                paddingHorizontal: 8,
                backgroundColor: "#0077B3"
            }
        }
    }
);

// the actual content of the app
const AppContainer = createAppContainer(AppNavigator);

// load the app and show splash screen until done
const LOADING_STATES = Object.freeze({
    LOADING: 0,
    LOADING_FAILED: 1,
    LOADING_SUCCEEDED: 2,
    ASK_FOR_PERMISSIONS: 3
});

// the root of the app that initializes it first
export default class App extends React.PureComponent {

    state = {
        loadingState: LOADING_STATES.LOADING
    };

    render() {
        switch (this.state.loadingState) {
            case LOADING_STATES.LOADING_SUCCEEDED:
                return <AppContainer />;
            case LOADING_STATES.LOADING_FAILED:
                return null;
            case LOADING_STATES.LOADING:
                return (
                    <AppLoading
                        startAsync={this.initialize.bind(this)}
                        onError={err => {
                            console.error("Could not initialize the app:", err);
                            this.setState({ loadingState: LOADING_STATES.LOADING_FAILED });
                        }}
                        onFinish={() => this.setState({ loadingState: LocationManager.instance.hasPermission ? LOADING_STATES.LOADING_SUCCEEDED : LOADING_STATES.ASK_FOR_PERMISSIONS })}
                    />
                );
            case LOADING_STATES.ASK_FOR_PERMISSIONS:
                return (
                    <PermissionsScreen
                        OnPermissionsGranted={() => this.setState({ loadingState: LOADING_STATES.LOADING_SUCCEEDED })}
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
            (async function() {
                await Promise.all([
                    DatabaseManager.instance.initialize(),
                    SettingsManager.instance.initialize()
                ]);
                await Promise.all([
                    CanteenManager.instance.initialize(),
                    MealManager.instance.initialize()
                ]);
            })(),
            NetworkManager.instance.initialize(),
            LocationManager.instance.initialize(),
        ]);

        MealManager.instance.setEventHooks();
        CanteenManager.instance.setEventHooks();
        console.log("Successfully intialized the app");

        // triggers a prefetch if needed
        LocationManager.instance.emit("position");
    }

}