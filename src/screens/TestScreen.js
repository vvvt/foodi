import React from "react";
import { View, Text } from "react-native";
import MealManager from "../manager/MealManager";
import styles from "./TemplateScreen.css";

const mealManager = MealManager.instance;

export default class TestScreen extends React.Component {

    componentDidMount() {
        this.test();
    }

    render() {

        return (
            <View style={styles.container}>
                <Text>Test</Text>
            </View>
        );

    }

    async test() {
        
    }

}