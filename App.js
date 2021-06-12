import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from '@expo/vector-icons';
import AppLoading from "expo-app-loading";
import * as Localization from "expo-localization";
import Constants from "expo-constants";

// class imports
import Locale from "./src/classes/Locale";

// manager imports
import DatabaseManager from "./src/manager/DatabaseManager";
import NetworkManager from "./src/manager/NetworkManager";
import LocationManager from "./src/manager/LocationManager";
import SettingsManager from "./src/manager/SettingsManager";
import CanteenManager from "./src/manager/CanteenManager";
import MealManager from "./src/manager/MealManager";

// screen imports
import FinderScreen from "./src/screens/FinderScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import FilterScreen from "./src/screens/FilterScreen";
import MapScreen from "./src/screens/MapScreen";
import PermissionsScreen from "./src/screens/PermissionsScreen";

// component imports
import Spacer from "./src/components/Spacer";

// set language
Locale.setLanguage( Localization.locale.split("-")[0] );

// load the app and show splash screen until done
const LOADING_STATES = Object.freeze({
    LOADING: 0,
    LOADING_FAILED: 1,
    LOADING_SUCCEEDED: 2,
    ASK_FOR_PERMISSIONS: 3
});

class AppContainer extends React.PureComponent {

    render() {

        return (
            <>
                <Spacer size={Constants.statusBarHeight} />
                {this.props.children}
            </>
        );

    }

}

const AppNavigator = createBottomTabNavigator();

// the root of the app that initializes it first
export default class App extends React.PureComponent {

    state = {
        loadingState: LOADING_STATES.LOADING
    };

    render() {
        switch (this.state.loadingState) {
            case LOADING_STATES.LOADING_SUCCEEDED:
                return (
                    <AppContainer>
                        <NavigationContainer>
                            <AppNavigator.Navigator
                                screenOptions={({ route }) => {
                                    let title = "";
                                    let iconName = "help-circle";

                                    switch (route.name) {
                                        case "finder":
                                            iconName = "search";
                                            title = Locale.LOCALE.TAB_NAVIGATOR.finder;
                                            break;
                                        case "filter":
                                            iconName = "filter";
                                            title = Locale.LOCALE.TAB_NAVIGATOR.filter;
                                            break;
                                        case "map":
                                            iconName = "map";
                                            title = Locale.LOCALE.TAB_NAVIGATOR.map;
                                            break;
                                        case "settings":
                                            iconName = "settings";
                                            title = Locale.LOCALE.TAB_NAVIGATOR.settings;
                                            break;
                                    }
                                    
                                    return ({
                                        tabBarIcon: ({ focused, color, size }) => (
                                            <Feather
                                                name={iconName}
                                                size={size}
                                                color={color}
                                            />
                                        ),
                                        title
                                    });
                                }}
                                tabBarOptions={{
                                    labelPosition: "below-icon",
                                    activeTintColor: "#FFFFFF",
                                    inactiveTintColor: "#7CD3FF",
                                    activeBackgroundColor: "#0077B3",
                                    inactiveBackgroundColor: "#0077B3",
                                    style: {
                                        height: 55,
                                        paddingVertical: 8,
                                        paddingHorizontal: 8,
                                        backgroundColor: "#0077B3"
                                    }
                                }}
                                initialRouteName="finder"
                            >
                                <AppNavigator.Screen name="finder" component={FinderScreen} />
                                <AppNavigator.Screen name="filter" component={FilterScreen} />
                                <AppNavigator.Screen name="map" component={MapScreen} />
                                <AppNavigator.Screen name="settings" component={SettingsScreen} />
                            </AppNavigator.Navigator>
                        </NavigationContainer>
                    </AppContainer>
                );
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
                    <AppContainer>
                        <PermissionsScreen
                            OnPermissionsGranted={() => this.setState({ loadingState: LOADING_STATES.LOADING_SUCCEEDED })}
                        />
                    </AppContainer>
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
            LocationManager.instance.initialize( CanteenManager.instance ),
        ]);

        MealManager.instance.setEventHooks();
        CanteenManager.instance.setEventHooks();
        console.log("Successfully intialized the app");

        // triggers a prefetch if needed
        LocationManager.instance.emit("position");
    }

}