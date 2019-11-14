import React from "react";
import { Text, StyleSheet, SectionList, SafeAreaView } from "react-native";
import Constants from 'expo-constants';
import ToggleItem from '../components/ToggleItem'

const DATA = [
    {
        title: "Preferences",
        data: [
            "Beef",
            "Pork",
            "Poultry",
            "Fish",
            "Alcohol",
            "Garlic"
        ]
    },
    {
        title: "Allergies",
        data: [
            {
                code: "A",
                name: "glutenhaltiges Getreide"
            },
            {
                code: "B",
                name: "Krebstiere"
            },
            {
                code: "C",
                name: "Eier"
            },
            {
                code: "D",
                name: "Fisch"
            },
            {
                code: "E",
                name: "Erdnüsse"
            },
            {
                code: "F",
                name: "Soja"
            },
            {
                code: "G",
                name: "Milch/Milchzucker (Laktose)"
            },
            {
                code: "H",
                name: "Schalenfrüchte (Nüsse)"
            },
            {
                code: "I",
                name: "Sellerie"
            },
            {
                code: "J",
                name: "Senf"
            },
            {
                code: "K",
                name: "Sesam"
            },
            {
                code: "L",
                name: "Sulfit/Schwefeldioxid"
            },
            {
                code: "M",
                name: "Lupine"
            },
            {
                code: "N",
                name: "Weichtiere"
            }
        ]
    }
];

export default class PreferencesScreen extends React.Component {

    render() {
        return (
            <SafeAreaView style={styles.container}>
              <SectionList
                sections={DATA}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => item.name ? <ToggleItem title={item.code + " - " + item.name}/> : <ToggleItem title={item} />}
                renderSectionHeader={({ section: { title } }) => (
                  <Text style={styles.header}>{title}</Text>
                )}
              />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: Constants.statusBarHeight,
      marginHorizontal: 16,
    },
    header: {
      fontSize: 24,
      marginBottom: 8,
      marginTop: 16
    }
  });