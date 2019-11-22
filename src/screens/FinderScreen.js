import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import MealItem from "../components/MealItem";
import styles from "./TemplateScreen.css";

import CanteeenManager from "../manager/CanteenManager";
import MealManager from "../manager/MealManager";
import Meal from "../classes/Meal";
import moment from "moment";

const canteenManager = CanteeenManager.instance;
const mealManager = MealManager.instance;

export default class FinderScreen extends React.Component {

  /** @type {Map<number, { canteen: import("../classes/Canteen").default, distance: number, meal: Meal }>} Map<mealId, data> */
  mealsWithDistancesMap = new Map();

  state = {
    mealsWithDistances: Array.from(this.mealsWithDistancesMap.values()),
    selectedDay: moment.utc().format("YYYY-MM-DD")
  };

  componentDidMount() {
    this.onCanteensChanged();
    canteenManager.on("canteensChanged", this.onCanteensChanged.bind(this));
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.state.mealsWithDistances}
          keyExtractor={(item) => item.meal.id+""}
          renderItem={({ item }) => (
            <MealItem
              id={item.meal.id+""}
              meal={item.meal}
              canteen={item.canteen}
              distance={item.distance}
              navigate={() => {this.props.navigation.navigate("map")}}
            />
          )}
        />
      </SafeAreaView>
    );
  }

  /**
   * Callback to be called when the surrounding canteens or their distance changed
   * @param {import("../manager/CanteenManager").CanteenWithDistance[]} currentSurroundingCanteens
   * @param {import("../manager/CanteenManager").CanteenWithDistance[]} lastSurroundingCateens
   */
  async onCanteensChanged(currentSurroundingCanteens = [], lastSurroundingCateens = []) {
    try {

      // get canteens that left the tracking range
      const canteensOutOfRange = lastSurroundingCateens.filter(
        c1 => currentSurroundingCanteens.findIndex( c2 => c1.canteen.id === c2.canteen.id ) === -1
      ).map( v => v.canteen.id );
      
      // delete meals of those canteens
      for (let { meal: { id: mealId, canteenId } } of this.mealsWithDistancesMap.values()) {
        if (canteensOutOfRange.includes( canteenId )) this.mealsWithDistancesMap.delete(mealId);
      }

      // get surrounding meals and update distance for each meal
      await mealManager.getSurroundingMeals(this.state.selectedDay, mealsWithDistances => {

        // update meals map
        mealsWithDistances.forEach( value => this.mealsWithDistancesMap.set( value.meal.id, value ) );

        // update state with the new meals/ distances
        this.setState({
          mealsWithDistances: Array.from(this.mealsWithDistancesMap.values())
            .sort( (a, b) => a.distance > b.distance ? 1 : a.distance < b.distance ? -1 : 0 )
        });

      });

    } catch(e) {
      console.warn("Could not load or fetch meals:", e);
    }
  }

};