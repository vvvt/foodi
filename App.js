import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { AppLoading } from "expo";

import DatabaseManager from "./src/manager/DatabaseManager";

// screen imports
import HomeScreen from "./src/screens/HomeScreen";
import TestScreen from "./src/screens/TestScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import PreferencesScreen from "./src/screens/PreferencesScreen";
import MapScreen from "./src/screens/MapScreen";

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
        initialRouteName: "test"
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
                        startAsync={() => DatabaseManager.instance.initialize()}
                        onError={err => {
                            console.error("Could not initialize the database manager:", err);
                            this.setState({ loadingState: LOADING_STATES.LOADING_FAILED });
                        }}
                        onFinish={() => this.setState({ loadingState: LOADING_STATES.LOADING_SUCCEEDED })}
                    />
                );
        }
    }

}