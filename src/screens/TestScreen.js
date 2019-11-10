import React from "react";
import { View, Text } from "react-native";
import MealManager from "../manager/MealManager";

const mealManager = MealManager.instance;

export default class TestScreen extends React.Component {

    componentDidMount() {
        this.test();
    }

    render() {

        return (
            <View>
                <Text>Test</Text>
            </View>
        );

    }

    async test() {
        const canteens = await mealManager.fetchCanteens([51.050407, 13.737262], 15);
        await mealManager.saveCanteens(canteens);
        console.log(await mealManager.loadCanteens());

        const meals = await mealManager.fetchMeals(79, "2019-11-11");
        await mealManager.saveMeals(meals);
        console.log(await mealManager.loadMeals());
    }

}