import React from "react";
import { FlatList, SafeAreaView, View, ActivityIndicator, Text, Button } from "react-native";
import ToggleItem from "../components/ToggleItem";
import SETTINGS from "../classes/Settings";
import styles from "./TemplateScreen.css";
import settingsStyles from "./SettingsScreen.css";

import SettingsManager, { Setting } from "../manager/SettingsManager";
import DatabaseManager from "../manager/DatabaseManager";
import CanteenManager from "../manager/CanteenManager";

const settingsManager = SettingsManager.instance;
const databaseManager = DatabaseManager.instance;
const canteenManager = CanteenManager.instance;

export default class SettingsScreen extends React.PureComponent {

  state = {
    loading: true
  }

  // the function below is called before the screen is opened for the first time (it removes this listener by itself)
  initialSettingsLoader = this.props.navigation.addListener(
    "willFocus",
    () => {

      // load settings from settingsmanager into state
      const state = { loading: false };
      SETTINGS.forEach( setting => {
        state[setting.id] = settingsManager.hasSetting(setting.id) ? settingsManager.getSetting(setting.id).value : setting.default;
      });
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
        <FlatList
          data={SETTINGS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            <ToggleItem
              title={item.title}
              onValueChange={value => {
                console.log("store " + item.id + " " + value);
                settingsManager.storeSetting( new Setting(item.id, value) );
                this.setState({ [item.id]: value });
              }}
              toggleValue={this.state[item.id]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.itemSeperator} />}
          ListHeaderComponent={() => <Text style={styles.header} >Settings</Text>}
        />
        <View style={settingsStyles.clearCacheContainer} >
          <Button
            title="Clear cache"
            onPress={this.clearCache.bind(this)}
          />
        </View>
      </SafeAreaView>
    );
    
  }

  async clearCache() {
    try {
      await databaseManager.dropAllTables();
      canteenManager.clearLastPrefetchPosition();
    } catch(e) {
      console.error("Could not clear the cache:", e);
      alert("An error occured while clearing the cache!");
    }
  }

};