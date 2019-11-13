import React, { useState } from "react";
import { View, Text, StyleSheet, SectionList, SafeAreaView, Switch } from "react-native";
import Constants from 'expo-constants';

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

function Item({ title }) {
  const [toggleValue, setValue] = useState(0);
  
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Switch  
        value={toggleValue}  
        onValueChange={(switchValue) => {
          setValue(switchValue);
          alert(switchValue + " " + title);
        }}
      />  
    </View>
  );
}

export default class PreferenceScreen extends React.Component {

    render() {
        return (
            <SafeAreaView style={styles.container}>
              <SectionList
                sections={DATA}
                renderItem={({ item }) => item.name ? <Item title={item.code + " - " + item.name}/> : <Item title={item} />}
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
    item: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#f9f9f9',
      padding: 16,
      marginVertical: 2,
    },
    header: {
      fontSize: 24,
      marginBottom: 8,
      marginTop: 16
    },
    title: {
      fontSize: 16,
    },
  });