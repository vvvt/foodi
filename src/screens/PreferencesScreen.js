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
                name: "glutenhaltiges Getreide"
            },
            {
                id: "B",
                name: "Krebstiere"
            },
            {
                id: "C",
                name: "Eier"
            },
            {
                id: "D",
                name: "Fisch"
            },
            {
                id: "E",
                name: "Erdnüsse"
            },
            {
                id: "F",
                name: "Soja"
            },
            {
                id: "G",
                name: "Milch/Milchzucker (Laktose)"
            },
            {
                id: "H",
                name: "Schalenfrüchte (Nüsse)"
            },
            {
                id: "I",
                name: "Sellerie"
            },
            {
                id: "J",
                name: "Senf"
            },
            {
                id: "K",
                name: "Sesam"
            },
            {
                id: "L",
                name: "Sulfit/Schwefeldioxid"
            },
            {
                id: "M",
                name: "Lupine"
            },
            {
                id: "N",
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
                renderItem={({ item }) => <Item title={item.id + " - " + item.name} id={item.id}/>}
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