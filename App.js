import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

// screen imports
import HomeScreen from "./src/screens/HomeScreen";

/* * * * * * * * * * * *
 * ADD NEW SCREEN HERE *
 * * * * * * * * * * * */
const AppNavigator = createStackNavigator({
    home: {
        screen: HomeScreen
    }
});

// the root of the app
export default createAppContainer(AppNavigator);