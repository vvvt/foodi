import React from "react";
import { View, Text, Switch } from "react-native";
import styles from "./MealItem.css";

export default class MealItem extends React.Component {
    state = { toggleValue: false }

    render() {
        return (
            <View style={styles.item}>
                <View style={styles.row}>
                    <Text style={styles.title}>{this.props.meal.name}</Text>
                    <Text style={styles.title}>{this.props.meal.price}</Text>
                </View>
                <View style={styles.row}>
                    <Text>{this.props.meal.canteen}</Text>
                    <Text>{this.props.meal.distance}</Text>
                </View>
            </View>
        );
    }
}