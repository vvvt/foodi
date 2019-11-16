import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import MealItem from "../components/MealItem";
import styles from "./TemplateScreen.css";
import DATA from "../classes/MockupMeals";

export default class FinderScreen extends React.Component {

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={DATA.sort((a, b) => {
            if (a.meal.distance < b.meal.distance) {
                return -1;
            }
            if (a.meal.distance > b.meal.distance) {
                return 1;
            }
            return 0;
          })}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MealItem id={item.id} meal={item.meal} />}
        />
      </SafeAreaView>
    );
  }
};