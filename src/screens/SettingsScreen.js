import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import Item from "../components/Item";
import DATA from "../classes/Settings";
import styles from "./SettingsScreen.css";

export default class SettingsScreen extends React.Component {

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Item title={item.title} id={item.id} />}
        />
      </SafeAreaView>
    );
  }
};