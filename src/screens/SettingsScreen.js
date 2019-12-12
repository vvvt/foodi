import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import ToggleItem from "../components/ToggleItem";
import SETTINGS from "../classes/Settings";
import styles from "./TemplateScreen.css";
import SettingsManager, { Setting } from "../manager/SettingsManager";

const settingsManager = SettingsManager.instance;

export default class SettingsScreen extends React.Component {

  render() {

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={SETTINGS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            <ToggleItem
              title={item.title}
              onValueChange={value => {
                settingsManager.storeSetting( new Setting(item.id, value) );
                this.forceUpdate();
              }}
              toggleValue={settingsManager.hasSetting(item.id) ? settingsManager.getSetting(item.id).value : item.default}
            />
          }
        />
      </SafeAreaView>
    );
    
  }

};