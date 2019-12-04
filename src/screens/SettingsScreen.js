import React from "react";
import { FlatList, SafeAreaView, ActivityIndicator, View } from "react-native";
import ToggleItem from "../components/ToggleItem";
import SETTINGS from "../classes/Settings";
import styles from "./TemplateScreen.css";
import SettingsManager from "../manager/SettingsManager";

const settingsManager = SettingsManager.instance;
const SETTINGS_DETAILS = new Map( SETTINGS.map( s => [s.id, s] ) );

export default class SettingsScreen extends React.Component {

  settingsMap = new Map( SETTINGS.map( s => [s.id, s.default] ) );
  get settingsValues() { return Array.from(this.settingsMap.entries()); }

  state = {
    settings: this.settingsValues,
    loaded: false
  };

  // load stored settings when loading the screen the first time
  async componentDidMount() {
    const settingIds = SETTINGS.map( v => v.id );
    const storedSettings = await settingsManager.getMultipleSettings(settingIds, "boolean");
    storedSettings.forEach( s => {
      if (s[1] !== null) this.settingsMap.set(s[0], s[1]);
    });
    this.setState({ settings: this.settingsValues, loaded: true });
  }

  render() {

    if (!this.state.loaded) return (
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }} >
        <ActivityIndicator size="large" />
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.state.settings}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) =>
            <ToggleItem title={SETTINGS_DETAILS.get(item[0]).title} onValueChange={value => this.onSettingChanged(item[0], value)} toggleValue={item[1]} />
          }
        />
      </SafeAreaView>
    );
  }

  /**
   * Handles a user press on a toggle item
   * @param {string} settingId The setting to change
   * @param {boolean} value The new value
   */
  onSettingChanged( settingId, value ) {

    // save changes
    this.settingsMap.set(settingId, value);
    settingsManager.storeSetting(settingId, value);

    // rerender
    this.setState({ settings: this.settingsValues });
    
  }

};