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
        const mealPrice = meal.prices.Studierende ? meal.prices.Studierende.toFixed(2) + "€" : "n/a";
        
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
                    style={styles.image}
                    source={meal.image}
                    resizeMode="contain"
                />
                <View style={modal.column}>
                    <View style={modal.column}>
                        <Text style={styles.cardAllergeneTitle}>Allergenes</Text>
                        <Text style={styles.cardAllergene}>{meal.allergenes.map( a => a.name ).join(", ")}</Text>
                    </View>
                    <View style={modal.column}>
                        <Text style={styles.cardAllergeneTitle}>Additives</Text>
                        <Text style={styles.cardAllergene}>{meal.additives.map( a => a.name ).join(", ")}</Text>
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