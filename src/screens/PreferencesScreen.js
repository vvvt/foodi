import React from "react";
import { Text, StyleSheet, SectionList, SafeAreaView } from "react-native";
import Item from "../components/Item";
import DATA from "../classes/Preferences";

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
      paddingHorizontal: 16
    },
    header: {
      fontSize: 24,
      marginVertical: 8
    }
});