import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function() {
    return (
        <View style={styles.container} >
            <Text style={styles.text} >Bitte erlauben Sie die Lokalisierungsfunktion, damit Sie die App nutzen können.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 50
    },

    text: {
        textAlign: "center",
        fontSize: 20
    }
});