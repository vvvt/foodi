import React from "react";
import { Text, StyleSheet, SectionList, SafeAreaView } from "react-native";
import Constants from 'expo-constants';
import Item from "../components/Item";

const DATA = [
    {
        title: "Preferences",
        data: [
            {
                id: "beef",
                name: "Beef"
            },
            {
                id: "pork",
                name: "Pork"
            },
            {
                id: "poultry",
                name: "Poultry"
            },
            {
                id: "fish",
                name: "Fish"
            },
            {
                id: "alcohol",
                name: "Alcohol"
            },
            {
                id: "garlic",
                name: "Garlic"
            }
        ]
    },
    {
        title: "Allergies",
        data: [
            {
                id: "A",
                name: "A - glutenhaltiges Getreide"
            },
            {
                id: "B",
                name: "B - Krebstiere"
            },
            {
                id: "C",
                name: "C - Eier"
            },
            {
                id: "D",
                name: "D - Fisch"
            },
            {
                id: "E",
                name: "E - Erdnüsse"
            },
            {
                id: "F",
                name: "F - Soja"
            },
            {
                id: "G",
                name: "G - Milch/Milchzucker (Laktose)"
            },
            {
                id: "H",
                name: "H - Schalenfrüchte (Nüsse)"
            },
            {
                id: "I",
                name: "I - Sellerie"
            },
            {
                id: "J",
                name: "J - Senf"
            },
            {
                id: "K",
                name: "K - Sesam"
            },
            {
                id: "L",
                name: "L - LSulfit/Schwefeldioxid"
            },
            {
                id: "M",
                name: "M - Lupine"
            },
            {
                id: "N",
                name: "N - Weichtiere"
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
                renderItem={({ item }) => <Item title={item.name} id={item.id}/>}
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