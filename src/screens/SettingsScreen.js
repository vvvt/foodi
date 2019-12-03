import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import ToggleItem from "../components/ToggleItem";
import Settings from "../classes/Settings";
import styles from "./TemplateScreen.css";
import SettingsManager from "../manager/SettingsManager";

const settingsManager = SettingsManager.instance;

export default class SettingsScreen extends React.Component {

  render() {

    Settings.forEach((item) => {
      settingsManager.storeSetting(item.id, "false");
    });
    console.log(settingsManager.getMultipleSettings(Settings.map((item) => item.id), Settings.map(() => "boolean")));

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={Settings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ToggleItem title={item.title} id={item.id} />}
        />
      </SafeAreaView>
    );
  }
};