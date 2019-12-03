import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import styles from "./Item.css";
import Util from "../classes/Util";

/** @typedef {import("../classes/Meal").default} Meal */
/** @typedef {import("../classes/Canteen").default} Canteen */

export default class MealItem extends React.PureComponent {

    /** @type {{ meal: Meal, canteen: Canteen, distance: number, OnItemPressed?: VoidFunction }} */
    props;

    static defaultProps = {
        OnItemPressed: () => {}
    };

    render() {

        const { meal, canteen, distance } = this.props;
        const mealPrice = meal.prices.students ? meal.prices.students.toFixed(2) + "€" : "n/a";

        return (
            <TouchableOpacity onPress={this.props.OnItemPressed} >
                <View style={styles.item}>
                    <View style={styles.row}>
                        <Text style={[styles.cardTitle, styles.columnLeft]}>{meal.name}</Text>
                        <Text style={[styles.cardTitle, styles.columnRight]}>{mealPrice}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.cardSubTitle, styles.columnLeft]}>{canteen.name}</Text>
                        <Text style={[styles.cardSubTitle, styles.columnRight]}>{Util.distanceToString(distance)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}