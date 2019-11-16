import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import ToggleItem from "../components/ToggleItem";
import DATA from "../classes/Settings";
import styles from "./TemplateScreen.css";

export default class SettingsScreen extends React.Component {

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ToggleItem title={item.title} id={item.id} />}
        />
      </SafeAreaView>
    );
  }
};