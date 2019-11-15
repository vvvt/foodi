import React from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import Item from "../components/Item";
import DATA from "../classes/Settings";

export default class SettingsScreen extends React.Component {

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Item title={item.title} id={item.id}/>}
        />
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  header: {
    fontSize: 24,
    marginVertical: 8
  }
});