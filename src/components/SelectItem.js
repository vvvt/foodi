import React from "react";
import { View, Text, StyleSheet, Picker } from "react-native";

export default class SelectItem extends React.Component {
    state = { selectedValue: '' }

    render() {
        return (
            <View style={styles.item}>
                <Text style={styles.title}>{this.props.title}</Text>
                <Picker
                    style={styles.picker}
                    selectedValue={this.state.selectedValue}
                    onValueChange={(itemValue) => {
                        this.setState({ selectedValue: itemValue });
                        alert(this.props.title + " " + itemValue);
                    }}
                >
                    {this.props.options.map((v) => {
                        return <Picker.Item label={v.label} value={v.value} />
                    })}
                </Picker>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    item: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        padding: 16,
        marginVertical: 2,
    },
    title: {
        fontSize: 16,
    },
    picker: {
        height: 60,
        width: 200
    }
});