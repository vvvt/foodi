import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import Constants from 'expo-constants';
import ToggleItem from '../components/ToggleItem';

const DATA = [
  {
    id: "sold-out",
    title: "Show sold out meals"
  },
  {
    id: "fetch-week",
    title: "Fetch week using cellular"
  },
  {
    id: "fetch-images",
    title: "Download images using cellular"
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ToggleItem title={item.title} />}
        />
      </SafeAreaView>
    );
  }
};