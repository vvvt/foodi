import React from "react";
import { View, Text, Switch } from "react-native";
import styles from "./Item.css";

export default class ToggleItem extends React.Component {
    state = { toggleValue: false }

    render() {
        return (
            <View style={styles.item}>
                <View style={styles.row}>
                    <Text style={styles.cardTitle}>{this.props.title}</Text>
                    <Switch
                        value={this.state.toggleValue}
                        onValueChange={(switchValue) => {
                            this.setState({ toggleValue: switchValue }, () => { alert(this.props.id + " - " + this.state.toggleValue) });
                        }}
                    />
                </View>
            </View>
        );
    }
}