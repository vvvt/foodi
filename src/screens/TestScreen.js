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
        
    }

}