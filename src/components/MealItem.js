import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import styles from "./Item.css";
import Util from "../classes/Util";

/** @typedef {import("../classes/Meal").default} Meal */
/** @typedef {import("../classes/Canteen").default} Canteen */

export default class MealItem extends React.PureComponent {
  /** @type {{ meal: Meal, canteen: Canteen, distance: number, view: string, OnItemPressed?: VoidFunction }} */
  props;

  static defaultProps = {
    OnItemPressed: () => {}
  };

  render() {
    const { meal, canteen, distance, view } = this.props;
    const mealPrice = meal.prices.Studierende
      ? meal.prices.Studierende.toFixed(2) + "€"
      : "n/a";

    return (
      <TouchableOpacity onPress={this.props.OnItemPressed}>
        <View
          style={[
            styles.item,
            { backgroundColor: meal.isEveningMeal ? "lightblue" : undefined },
            { borderColor: meal.isEveningMeal ? "lightblue" : "#ddd" }
          ]}
        >
          {meal.isEveningMeal ? (
            <Icon
              color="yellow"
              name="md-moon"
              style={styles.moonIcon}
              size={25}
            />
          ) : null}
          <View style={styles.row}>
            <Text style={[styles.cardTitle, styles.columnLeft]}>
              {meal.name}
            </Text>
            <Text style={[styles.cardTitle, styles.columnRight]}>
              {mealPrice}
            </Text>
          </View>
          <View style={styles.smallSpacerVertical} />
          <View style={styles.row}>
            <Text style={[styles.cardSubTitle, styles.columnLeft]}>
              {view == "outside" ? canteen.name : meal.category}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.cardSubTitle, styles.columnRight]}
            >
              {view == "outside" ? Util.distanceToString(distance) : ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
