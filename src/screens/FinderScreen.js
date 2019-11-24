import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import MealItem from "../components/MealItem";
import styles from "./TemplateScreen.css";

import MealManager from "../manager/MealManager";

const mealManager = MealManager.instance;

export default class FinderScreen extends React.Component {

  state = {
    mealsWithDistances: mealManager.surroundingMeals
  };

  componentDidMount() {
    mealManager.on("mealsChanged", mealsWithDistances => this.setState({ mealsWithDistances }));
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

};