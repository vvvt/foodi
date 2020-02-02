import React from "react";
import { Text, SectionList, SafeAreaView, View, ActivityIndicator } from "react-native";
import ToggleItem from "../components/ToggleItem";
import FILTERS from "../classes/Filters";
import styles from "./TemplateScreen.css";
import SettingsManager, { Setting } from "../manager/SettingsManager"
import Spacer from "../components/Spacer";
import Locale from "../classes/Locale";

const settingsManager = SettingsManager.instance;

/** @type {{ [filterId: string]: string[] }} */
const DISABLE_SETTING_MAP = Object.freeze({
  "vegetarian": [ "beef", "pork", "D", "N" ],
  "vegan": [ "beef", "pork", "D", "N", "vegetarian", "C", "G" ]
});

export default class FilterScreen extends React.Component {

  state = {
    loading: true
  }

  /** @type {Set<string>} */
  disabledFilters = new Set();
  shouldUpdateDisabledFilters = false;

  // the function below is called before the screen is opened for the first time (it removes this listener by itself)
  initialSettingsLoader = this.props.navigation.addListener(
    "willFocus",
    () => {

      // load settings from settingsmanager into state
      const state = { loading: false };
      FILTERS.forEach( preference =>
        preference.data.forEach( data => {
          state[data.id] = settingsManager.hasSetting(data.id) ? settingsManager.getSetting(data.id).value : data.default;
        })
      );
      this.shouldUpdateDisabledFilters = true; 
      this.setState(state);

      // remove listener
      this.initialSettingsLoader.remove();
      delete this.initialSettingsLoader;

    }
  )

  render() {
    if (this.shouldUpdateDisabledFilters) this.updateDisabledFilters();

    // show loading indicator if loading (should actually never be visible)
    if (this.state.loading) return (
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }} >
        <ActivityIndicator size="large" />
      </View>
    )

    return (
      <SafeAreaView style={styles.container}>
        <SectionList
          sections={FILTERS.map( f => ({ data: f.data, title: Locale.LOCALE.FILTERS[f.topic] }))}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <ToggleItem
              title={Locale.LOCALE.FILTERS[item.id]}
              onValueChange={value => this.storeSetting( new Setting(item.id, value) )}
              toggleValue={this.state[item.id]}
              disabled={this.disabledFilters.has(item.id)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header} >{title}</Text>
          )}
          initialNumToRender={30}
          stickySectionHeadersEnabled={false}
          ItemSeparatorComponent={() => <Spacer size={5} />}
          ListFooterComponent={() => <Spacer size={24} />}
        />
      </SafeAreaView>
    );
    
  }

  /**
   * Stores the given setting in the settings manager and updates state
   * @param {Setting} setting The setting
   */
  storeSetting( setting ) {
    settingsManager.storeSetting( setting );
    this.shouldUpdateDisabledFilters = true;
    this.setState({ [setting.key]: setting.value });
  }

  updateDisabledFilters() {
    this.shouldUpdateDisabledFilters = false;

    /** @type {Set<string>} */
    const s = new Set();
    Object.keys(DISABLE_SETTING_MAP).forEach( filterId => {
      if (this.state[filterId]) DISABLE_SETTING_MAP[filterId].forEach( f => s.add(f) );
    });

    // update disabled filters
    this.disabledFilters = s;
  }

}