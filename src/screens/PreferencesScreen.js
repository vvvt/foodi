import React from "react";
import { Text, SectionList, SafeAreaView, View, ActivityIndicator } from "react-native";
import ToggleItem from "../components/ToggleItem";
import PREFERENCES from "../classes/Preferences";
import styles from "./TemplateScreen.css";
import SettingsManager, { Setting } from "../manager/SettingsManager"

const settingsManager = SettingsManager.instance;

export default class PreferencesScreen extends React.Component {

  state = {
    loading: true
  }

  // the function below is called before the screen is opened for the first time (it removes this listener by itself)
  initialSettingsLoader = this.props.navigation.addListener(
    "willFocus",
    () => {

      // load settings from settingsmanager into state
      const state = { loading: false };
      PREFERENCES.forEach( preference =>
        preference.data.forEach( data => {
          state[data.id] = settingsManager.hasSetting(data.id) ? settingsManager.getSetting(data.id).value : data.default;
        })
      );
      this.setState(state);

      // remove listener
      this.initialSettingsLoader.remove();
      delete this.initialSettingsLoader;

    }
  )

  render() {

    if (this.state.loading) return (
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }} >
        <ActivityIndicator size="large" />
      </View>
    )

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
                this.setState({ [item.id]: value });
              }}
              toggleValue={this.state[item.id]}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header} >{title}</Text>
          )}
          initialNumToRender={30}
          stickySectionHeadersEnabled={false}
        />
      </SafeAreaView>
    );
    
  }

}