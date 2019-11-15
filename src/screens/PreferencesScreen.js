import React from "react";
import { Text, SectionList, SafeAreaView } from "react-native";
import Item from "../components/Item";
import DATA from "../classes/Preferences";
import styles from "./SettingsScreen.css";

export default class PreferencesScreen extends React.Component {

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <SectionList
          sections={DATA}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => <Item title={item.name} id={item.id} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
        />
      </SafeAreaView>
    );
  }
}