import React from "react";
import { createAppContainer } from "react-navigation";
import { Icon } from 'react-native-elements'
import { createBottomTabNavigator } from "react-navigation-tabs";
import { AppLoading } from "expo";

// manager imports
import DatabaseManager from "./src/manager/DatabaseManager";
import NetworkManager from "./src/manager/NetworkManager";

// screen imports
import TestScreen from "./src/screens/TestScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import PreferencesScreen from "./src/screens/PreferencesScreen";
import MapScreen from "./src/screens/MapScreen";

/* * * * * * * * * * * *
 * ADD NEW SCREEN HERE *
 * * * * * * * * * * * */
const AppNavigator = createBottomTabNavigator(
    {
        test: {
            screen: TestScreen,
            navigationOptions: () => ({
                title: "Test",
                tabBarIcon: () => (
                    <Icon
                        name="search"
                        type="feather"
                    />
                )
            }),
            tabBarOptions: {
                labelPosition: "below-icon",
                activeTintColor: "#FFFFFF",
                inactiveTintColor: "#CA5EFD",
                activeBackgroundColor: "#8600FA",
                inactiveBackgroundColor: "#8600FA"
            }
        },
        settings: {
            screen: SettingsScreen,
            navigationOptions: () => ({
                title: "Settings",
                tabBarIcon: () => (
                    <Icon
                        name="settings"
                        type="feather"
                    />
                )
            }),
            tabBarOptions: {
                labelPosition: "below-icon",
                activeTintColor: "#FFFFFF",
                inactiveTintColor: "#CA5EFD",
                activeBackgroundColor: "#8600FA",
                inactiveBackgroundColor: "#8600FA"
            }
        },
        preferences: {
            screen: PreferencesScreen,
            navigationOptions: () => ({
                title: "Preferences",
                tabBarIcon: () => (
                    <Icon
                        name="sliders"
                        type="feather"
                    />
                )
            }),
            tabBarOptions: {
                labelPosition: "below-icon",
                activeTintColor: "#FFFFFF",
                inactiveTintColor: "#CA5EFD",
                activeBackgroundColor: "#8600FA",
                inactiveBackgroundColor: "#8600FA"
            }
        },
        map: {
            screen: MapScreen,
            navigationOptions: () => ({
                title: "Navigation",
                tabBarIcon: () => (
                    <Icon
                        name="map"
                        type="feather"
                    />
                )
            }),
            tabBarOptions: {
                labelPosition: "below-icon",
                activeTintColor: "#FFFFFF",
                inactiveTintColor: "#CA5EFD",
                activeBackgroundColor: "#8600FA",
                inactiveBackgroundColor: "#8600FA"
            }
        }

    },
    {
        initialRouteName: "map"
    }
);

// the actual content of the app
const AppContainer = createAppContainer(AppNavigator);

// load the app and show splash screen until done
const LOADING_STATES = Object.freeze({
    LOADING: 0,
    LOADING_FAILED: 1,
    LOADING_SUCCEEDED: 2
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
            case LOADING_STATES.LOADING:
                return (
                    <AppLoading
                        startAsync={this.initialize}
                        onError={err => {
                            console.error("Could not initialize the database manager:", err);
                            this.setState({ loadingState: LOADING_STATES.LOADING_FAILED });
                        }}
                        onFinish={() => this.setState({ loadingState: LOADING_STATES.LOADING_SUCCEEDED })}
                    />
                );
        }
    }

    /**
     * Initializes all managers
     */
    async initialize() {
        await Promise.all([
            DatabaseManager.instance.initialize(),
            NetworkManager.instance.initialize()
        ]);

        console.log("Successfully intialized the app");
    }

}