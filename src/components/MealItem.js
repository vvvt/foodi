import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import styles from "./Item.css";
import Util from "../classes/Util";
import Spacer from "./Spacer";

/** @typedef {import("../classes/Meal").default} Meal */
/** @typedef {import("../classes/Canteen").default} Canteen */

const EVENING_MEAL_ICON = (
  <Ionicons
    color="#0077B3"
    name="md-moon"
    size={20}
    style={styles.mealIcon}
    key="moon"
  />
);

const VEGAN_MEAL_ICON = (
  <FontAwesome5
    color="#38b200"
    name="leaf"
    size={20}
    style={styles.mealIcon}
    key="leaf"
  />
);

const VEGETARIAN_MEAL_ICON = (
  <FontAwesome5
    color="orange"
    name="carrot"
    size={20}
    style={styles.mealIcon}
    key="carrot"
  />
);

export default class MealItem extends React.PureComponent {
  /** @type {{ meal: Meal, canteen: Canteen, distance: number, view: string, OnItemPressed?: VoidFunction }} */
  props;

  static defaultProps = {
    OnItemPressed: () => {}
  };

  /**
   * Returns the corresponding stylesheet for the meal
   * @param {Meal} meal The meal
   */
  getBorderStyleOfMeal( meal ) {
    return (
      meal.isVegan ? styles.itemBorderVeganMeal :
      meal.isVegetarian ? styles.itemBorderVegetarianMeal :
      /*meal.isEveningMeal ? styles.itemBorderEveningMeal :*/
      null
    );
  }

  render() {
    const { meal, canteen, distance, view } = this.props;
    const mealPrice = meal.prices.Studierende
      ? meal.prices.Studierende.toFixed(2) + "€"
      : "n/a"
    ;
    /** @type {JSX.Element[]} */
    const mealIcons = [];
    if (meal.isVegan) {
      mealIcons.push(VEGAN_MEAL_ICON);
    } else if (meal.isVegetarian) {
      mealIcons.push(VEGETARIAN_MEAL_ICON);
    }
    if (meal.isEveningMeal) mealIcons.push(EVENING_MEAL_ICON);

    return (
      <TouchableOpacity onPress={this.props.OnItemPressed}>
        <View
          style={[
            styles.item,
            this.getBorderStyleOfMeal(meal)
          ]}
        >
          
          {/* The name and the canteen name or category of the meal */}
          <View style={styles.columnLeft} >
            <Text style={styles.cardTitle}>
              {meal.name}
            </Text>
            <Text style={[styles.cardSubTitle, styles.marginTop]}>
              {view == "outside" ? canteen.name : meal.category}
            </Text>
          </View>

          {/* The price and optionally the distance and/or moon icon */}
          <View style={styles.columnRight} >
            <View style={styles.row} >
              {mealIcons.reduce( (prev, cur, i) => [prev, <Spacer key={"spacer-"+i} size={5} vertical />, cur], [] )}
            </View>
            <Text style={[styles.cardTitle]}>
              {mealPrice}
            </Text>
            {view === "inside" ? null : (
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.cardSubTitle, styles.marginTop]}
              >
                {Util.distanceToString(distance)}
              </Text>
            )}
          </View>
          
        </View>
      </TouchableOpacity>
    );
  }
}
