import React from "react";
import { Text, SectionList, SafeAreaView, ActivityIndicator, View } from "react-native";
import ToggleItem from "../components/ToggleItem";
import PREFERENCES from "../classes/Preferences";
import styles from "./TemplateScreen.css";
import SettingsManager from "../manager/SettingsManager"

const settingsManager = SettingsManager.instance;

function getPreferencesArray() {
  output = [];
  PREFERENCES.forEach(section => {
    output = output.concat(section.data);
  });
  return output;
}

export default class PreferencesScreen extends React.Component {

  preferencesMap = new Map(getPreferencesArray().map(s => [s.id, s.default]));
  get preferencesValues() { return Array.from(this.preferencesMap.entries()); }

  state = {
    preferences: this.preferencesValues,
    loaded: false
  };

  async componentDidMount() {
    const preferencesIDs = getPreferencesArray().map(v => v.id);
    const storedPreferences = await settingsManager.getMultipleSettings(preferencesIDs, "boolean");
    storedPreferences.forEach(s => {
      if (s[1] !== null) this.preferencesMap.set(s[0], s[1]);
    })
    this.setState({ preferences: this.preferencesValues, loaded: true });
  }

  render() {

    if (!this.state.loaded) return (
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }} >
        <ActivityIndicator size="large" />
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        <SectionList
          sections={PREFERENCES}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <ToggleItem title={item.name} onValueChange={value => this.onSettingChanged(item.id, value)} toggleValue={this.preferencesMap.get(item.id)} id={item.id} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
        />
      </SafeAreaView>
    );
  }


  /**
   * Handles a user press on a toggle item
   * @param {string} settingId The setting to change
   * @param {boolean} value The new value
   */
  onSettingChanged(settingId, value) {

    console.log("ID: " + settingId + " set to " + value);

    // save changes
    this.preferencesMap.set(settingId, value);
    settingsManager.storeSetting(settingId, value);

    // rerender
    this.setState({ preferences: this.preferencesValues });

  }
}