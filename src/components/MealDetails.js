import React from "react";
import { View, Text, Image } from "react-native";
import { Icon } from "react-native-elements";

import styles from "./MealItem.css";
import Util from "../classes/Util";

/** @typedef {import("../classes/Meal").default} Meal */
/** @typedef {import("../classes/Canteen").default} Canteen */

export default class MealDetails extends React.PureComponent {

    /** @type {{ meal: Meal, canteen: Canteen, distance: number, OnClosePressed?: VoidFunction, OnNavigatePressed?: VoidFunction }} */
    props;

    static defaultProps = {
        OnClosePressed: () => {},
        OnNavigatePressed: () => {}
    };

    render() {

        const { meal, canteen, distance } = this.props;
        const mealPrice = meal.prices.students ? meal.prices.students.toFixed(2) + "€" : "n/a";

        return (
            <View style={{
                padding: 8,
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: "white"
            }}>
                <View
                    style={{
                        flexDirection: "column",
                        backgroundColor: "#f9f9f9",
                        padding: 8
                    }}
                >
                    <Text
                        style={styles.modalSide}>
                        {canteen.name.toUpperCase() + " - " + meal.category.toUpperCase()}
                    </Text>
                    <Text style={styles.modalFocus}>
                        {meal.name}
                    </Text>
                </View>
                <Image
                    style={{
                        width: "auto",
                        height: 300,
                    }}
                    source={{ uri: "https://assets3.thrillist.com/v1/image/2797371/size/tmg-article_default_mobile.jpg" }}
                />
                <View
                    style={{
                        flexDirection: "column",
                        backgroundColor: "#f9f9f9",
                        padding: 8
                    }}
                >
                    {meal.notes.map((allergy, index) => <Text key={index}>{allergy}</Text>)}
                </View>
                <View style={styles.row}>
                    <Text style={styles.modalFocus}>
                        {mealPrice}
                    </Text>
                    <Text style={styles.modalFocus}>
                        {Util.distanceToString(distance)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <View style={styles.bigButton}>
                        <Icon
                            name="x"
                            type="feather"
                            color="white"
                            onPress={this.props.OnClosePressed}
                        />
                    </View>
                    <View style={styles.bigButton}>
                        <Icon
                            name="map"
                            type="feather"
                            color="white"
                            onPress={this.props.OnNavigatePressed}
                            style={styles.bigButton}
                        />
                    </View>
                </View>
            </View>
        );
    }

}