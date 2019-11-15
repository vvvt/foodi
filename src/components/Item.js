import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default class Item extends React.Component {
    state = {toggleValue: false}

    render() {
        return (
            <View style={styles.item}>
                <Text style={styles.title}>{this.props.title}</Text>
                <Switch  
                    value={this.state.toggleValue}  
                    onValueChange={(switchValue) => {
                        this.setState({toggleValue: switchValue});
                        alert(switchValue + " " + this.props.title);
                    }}
                />  
            </View>
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
    }
  });