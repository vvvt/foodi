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

  /** @type {Map<number, { canteen: import("../classes/Canteen").default, distance: number, meal: Meal }>} */
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

  async onCanteensChanged() {
    try {
      const promises = canteenManager.surroundingCanteens.map( async c => {
        try {
          const meals = await mealManager.loadOrFetchMeals(c.canteen.id, this.state.selectedDay);
          meals.forEach( m => this.mealsWithDistancesMap.set( m.id, { canteen: c.canteen, distance: c.distance, meal: m } ) );
          this.setState({
              mealsWithDistances: Array.from(this.mealsWithDistancesMap.values())
                .sort( (a, b) => a.distance > b.distance ? 1 : a.distance < b.distance ? -1 : 0 )
          });
        } catch(e) {
          console.warn(`Could not fetch or load meals of canteen "${c.canteen.name}" for ${this.state.selectedDay}`, e);
        }
      });

      await Promise.all(promises);
    } catch(e) {
      console.warn("Could not load or fetch meals:", e);
    }
  }

};