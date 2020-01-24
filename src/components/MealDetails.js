import React from "react";
import { View, Text, Image } from "react-native";
import { Icon } from "react-native-elements";

import styles from "./Item.css";
import modal from "./MealDetails.css";
import Util from "../classes/Util";

/** @typedef {import("../classes/Meal").default} Meal */
/** @typedef {import("../classes/Canteen").default} Canteen */

/**
 * @param {string} body 
 * @param hasChildren 
 * @param isOpen 
 */
function createAllergeneOrAdditiveString( body, hasChildren = true, isOpen = false ) {
  if (!hasChildren) return "No " + body;
  return body + (isOpen ? " ▼" : " ▶");
}

export default class MealDetails extends React.PureComponent {
  /** @type {{ meal: Meal, canteen: Canteen, distance: number, OnClosePressed?: VoidFunction, OnNavigatePressed?: VoidFunction }} */
  props;

  constructor(props) {
    super(props);

    this.hasAllergenes = this.props.meal.allergenes.length !== 0;
    this.hasAdditives = this.props.meal.additives.length !== 0;

    this.state = {
      textAllergenes: createAllergeneOrAdditiveString("Allergenes", this.hasAllergenes),
      textAdditives: createAllergeneOrAdditiveString("Additives", this.hasAdditives),
      showAllergenes: false,
      showAdditives: false
    };
  }

  /**
   * Expand or collapse the "Allergenes" section 
   */
  toggleAllergenes = () => {
    if (!this.hasAllergenes) return;
    this.setState({
      showAllergenes: !this.state.showAllergenes,
      textAllergenes: createAllergeneOrAdditiveString("Allergenes", true, !this.state.showAllergenes)
    });
  };

  /**
   * Expand or collapse the "Additives" section 
   */
  toggleAdditives = () => {
    if (!this.hasAdditives) return;
    this.setState({
      showAdditives: !this.state.showAdditives,
      textAdditives: createAllergeneOrAdditiveString("Additives", true, !this.state.showAdditives)
    });
  };

  static defaultProps = {
    OnClosePressed: () => {},
    OnNavigatePressed: () => {}
  };

  render() {
    const { meal, canteen, distance } = this.props;
    const mealPrice = meal.prices.Studierende
      ? meal.prices.Studierende.toFixed(2) + "€"
      : "n/a";

    return (
      <View style={modal.item}>
        <View style={[modal.column, modal.paddingHorizontal]}>

          {/* The canteen and counter name */}
          <View style={modal.row}>
            <Text style={styles.cardSubTitle}>
              {canteen.name.toUpperCase() + " - " + meal.category.toUpperCase()}
            </Text>
          </View>

          {/* The meal name */}
          <View style={modal.row}>
            <Text style={styles.cardTitle}>{meal.name}</Text>
          </View>

        </View>
        <Image style={styles.image} source={meal.image} resizeMode="contain" />
        <View style={[modal.column, modal.paddingHorizontal]}>

          {/* The allergene display */}
          <View style={modal.column}>
            <Text
              style={styles.cardAllergeneTitle}
              onPress={this.toggleAllergenes}
            >
              {this.state.textAllergenes}
            </Text>
            {this.state.showAllergenes ? <Text style={styles.cardAllergene}>
              {meal.allergenes.map(a => a.name).join("\n")}
            </Text> : null}
          </View>

          {/* The additives display */}
          <View style={modal.column}>
            <Text
              style={styles.cardAllergeneTitle}
              onPress={this.toggleAdditives}
            >
              {this.state.textAdditives}
            </Text>
            {this.state.showAdditives ? <Text style={styles.cardAllergene}>
              {meal.additives.map(a => a.name).join("\n")}
            </Text> : null}
          </View>

          {/* The price and distance */}
          <View style={modal.row}>
            <Text style={styles.cardTitle}>{mealPrice}</Text>
            <Text style={styles.cardTitle}>
              {Util.distanceToString(distance)}
            </Text>
          </View>
        </View>

        {/* The navigation buttons */}
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
    );
  }
}
