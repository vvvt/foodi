import React from "react";
import { Text, SectionList, SafeAreaView } from "react-native";
import ToggleItem from "../components/ToggleItem";
import PREFERENCES from "../classes/Preferences";
import styles from "./TemplateScreen.css";
import SettingsManager, { Setting } from "../manager/SettingsManager"

const settingsManager = SettingsManager.instance;

export default class PreferencesScreen extends React.Component {

  render() {

    return (
      <SafeAreaView style={styles.container}>
        <SectionList
          sections={PREFERENCES}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <ToggleItem
              title={item.name}
              onValueChange={value => {
                settingsManager.storeSetting(new Setting(item.id, value));
                this.forceUpdate();
              }}
              toggleValue={settingsManager.hasSetting(item.id) ? settingsManager.getSetting(item.id).value : item.default}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
        />
      </SafeAreaView>
    );
    
  }

}