import React from "react";
import { Modal, Text, TouchableHighlight, View } from "react-native";
import styles from "./MealItem.css";

export default class MealItem extends React.Component {
    state = {
        toggleValue: false,
        modalVisible: false
    };

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }
    render() {
        return (
            <>
                <Modal
                    animationType="slide"
                    presentationStyle="pageSheet"
                    transparent={false}
                    visible={this.state.modalVisible}>
                    <TouchableHighlight
                        onPress={() => {
                            this.setModalVisible(!this.state.modalVisible);
                        }}>
                        <Text style={{fontSize: 24}}>Hide Modal</Text>
                    </TouchableHighlight>
                    <View style={styles.item}>
                        <Text>{this.props.meal.name}</Text>
                        <Text>{this.props.meal.price + "€"}</Text>
                        <Text>{this.props.meal.canteen}</Text>
                        <Text>{this.props.meal.distance + " km"}</Text>
                        <Text>{this.props.meal.counter}</Text>
                        <Text>{this.props.meal.allergies.join(", ")}</Text>
                    </View>
                </Modal>
                <TouchableHighlight
                    onPress={() => {
                        this.setModalVisible(true);
                    }}>
                    <View style={styles.item}>
                        <View style={styles.row}>
                            <Text style={styles.title}>{this.props.meal.name}</Text>
                            <Text style={styles.title}>{this.props.meal.price + "€"}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text>{this.props.meal.canteen}</Text>
                            <Text>{this.props.meal.distance + " km"}</Text>
                        </View>
                    </View>
                </TouchableHighlight>
            </>
        );
    }
}