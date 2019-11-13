import React from "react";
import { FlatList, StyleSheet, SafeAreaView } from "react-native";
import Constants from 'expo-constants';
import ToggleItem from '../components/ToggleItem';
import SelectItem from '../components/SelectItem';

const DATA = [
  {
    id: "sold-out",
    title: "Show sold out meals"
  },
  {
    id: "fetch-week",
    title: "Fetch week's menu via",
    options: [
      {
        label: "WiFi only",
        value: "wifi"
      },
      {
        label: "WiFi/Cellular",
        value: "data"
      }
    ]
  },
  {
    id: "fetch-images",
    title: "Fetch meal images via",
    options: [
      {
        label: "WiFi only",
        value: "wifi"
      },
      {
        label: "WiFi/Cellular",
        value: "data"
      }
    ]
  }

];

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
          renderItem={({ item }) => item.options ? <SelectItem title={item.title} options={item.options} /> : <ToggleItem title={item.title} />}
        />
      </SafeAreaView>
    );
  }
};