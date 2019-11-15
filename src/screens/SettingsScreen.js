import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import Constants from 'expo-constants';
import Item from "../components/Item";
import DATA from "../classes/Settings";

export default class SettingsScreen extends React.Component {

  render() {
    return (
      <SafeAreaView style={{
        flex: 1,
        marginTop: Constants.statusBarHeight,
        marginHorizontal: 16
      }}>
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Item title={item.title} id={item.id}/>}
        />
      </SafeAreaView>
    );
  }
};