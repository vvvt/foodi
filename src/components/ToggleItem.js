import React from "react";
import { View, Text, Switch } from "react-native";
import styles from "./Item.css";

export default class ToggleItem extends React.Component {
    
    /** @type {{ onValueChange?: (value: boolean) => void, toggleValue?: boolean, title: string }} */
    props;

    static defaultProps = {
        onValueChange: () => {},
        toggleValue: false
    };

    render() {

        const style = {};
        if (this.props.title.length > 30) style.fontSize = 12;

        return (
            <View style={styles.row}>
                <Text style={[styles.cardTitle, style]}>{this.props.title}</Text>
                <Switch
                    value={this.props.toggleValue}
                    onValueChange={this.props.onValueChange}
                />
            </View>
        );

    }
}