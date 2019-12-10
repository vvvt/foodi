import React from "react";
import { View, Text, Image } from "react-native";
import { Icon } from "react-native-elements";

import styles from "./Item.css";
import modal from "./MealDetails.css";
import Util from "../classes/Util";

/** @typedef {import("../classes/Meal").default} Meal */
/** @typedef {import("../classes/Canteen").default} Canteen */

export default class MealDetails extends React.PureComponent {

    /** @type {{ meal: Meal, canteen: Canteen, distance: number, OnClosePressed?: VoidFunction, OnNavigatePressed?: VoidFunction }} */
    props;

    static defaultProps = {
        OnClosePressed: () => { },
        OnNavigatePressed: () => { }
    };

    render() {

        const { meal, canteen, distance } = this.props;
        const mealPrice = meal.prices.students ? meal.prices.students.toFixed(2) + "€" : "n/a";

        return (
            <View style={modal.item}>
                <View style={modal.column}>
                    <View style={modal.row}>
                        <Text
                            style={styles.cardSubTitle}>
                            {canteen.name.toUpperCase() + " - " + meal.category.toUpperCase()}
                        </Text>
                    </View>
                    <View style={modal.row}>
                        <Text style={styles.cardTitle}>
                            {meal.name}
                        </Text>
                    </View>
                </View>
                <Image
                    style={{
                        flex: 3
                    }}
                    source={{ uri: "https://assets3.thrillist.com/v1/image/2797371/size/tmg-article_default_mobile.jpg" }}
                />
                <View style={modal.column}>
                    <View style={modal.row}>
                        <Text style={styles.cardSubTitle}>Allergies</Text>
                    </View>
                    <View style={modal.row}>
                        <Text style={styles.cardTitle}>
                            {mealPrice}
                        </Text>
                        <Text style={styles.cardTitle}>
                            {Util.distanceToString(distance)}
                        </Text>
                    </View>
                    <View style={modal.row}>
                        <Icon
                            name="x"
                            type="feather"
                            color="#151522"
                            raised
                            onPress={this.props.OnClosePressed}
                        />
                        <Icon
                            name="map"
                            type="feather"
                            color="#0077B3"
                            reverse
                            raised
                            onPress={this.props.OnNavigatePressed}
                        />
                    </View>
                </View>
            </View>
        );
    }

}

{/* <View style={styles.item}>
                <View style={styles.row}>
                    <Text
                        style={styles.cardSubTitle}>
                        {canteen.name.toUpperCase() + " - " + meal.category.toUpperCase()}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.cardTitle}>
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
                <View styles={styles.row}>
                    {meal.notes.map((allergy, index) => <Text key={index}>{allergy}</Text>)}
                </View>
                <View style={styles.row}>
                    <Text style={styles.cardTitle}>
                        {mealPrice}
                    </Text>
                    <Text style={styles.cardTitle}>
                        {Util.distanceToString(distance)}
                    </Text>
                </View>
                <View style={[styles.row, {
                    flex: 1.5
                }]}>
                    <View style={styles.button}>
                        <Icon
                            name="x"
                            type="feather"
                            color="white"
                            onPress={this.props.OnClosePressed}
                        />
                    </View>
                    <View style={styles.button}>
                        <Icon
                            name="map"
                            type="feather"
                            color="white"
                            onPress={this.props.OnNavigatePressed}
                            style={styles.bigButton}
                        />
                    </View>
                </View>
            </View> */}