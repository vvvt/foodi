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
            {
              borderBottomColor: meal.isVeggieMeal
                ? "#38b200"
                : meal.isEveningMeal
                ? "#0077B3"
                : "#b2b2b2",
              borderColor: "#EFEFEF",
            }
          ]}
        >
          {meal.isEveningMeal ? (
            <Icon
              color="#0077B3"
              name="md-moon"
              style={styles.moonIcon}
              size={20}
            />
          ) : null}

          {/* The name and price of a meal */}
          <View style={styles.row}>
            <Text style={[styles.cardTitle, styles.columnLeft]}>
              {meal.name}
            </Text>
            <Text style={[styles.cardTitle, styles.columnRight]}>
              {mealPrice}
            </Text>
          </View>

          <View style={styles.smallSpacerVertical} />
          
          {/* The canteen and distance */}
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
