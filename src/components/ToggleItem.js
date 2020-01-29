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

        return (
            <View style={[styles.row, styles.paddingHorizontal]}>
                <View style={styles.toggleItemTitleContainer} ><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.cardTitle]}>{this.props.title}</Text></View>
                <Switch
                    value={this.props.toggleValue}
                    onValueChange={this.props.onValueChange}
                />
            </View>
        );

    }
}