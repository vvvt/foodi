import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
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

        meal = this.props.meal;

        return (
            <>
                <Modal
                    animationType="slide"
                    presentationStyle="pageSheet"
                    transparent={false}
                    visible={this.state.modalVisible}>
                    <View style={{
                        padding: 8,
                        flex: 1,
                        flexDirection: "column",
                        justifyContent: "space-between",
                        backgroundColor: "white"
                    }}>
                        <View
                            style={{
                                flexDirection: "column",
                                backgroundColor: "#f9f9f9",
                                padding: 8
                            }}
                        >
                            <Text
                                style={styles.modalSide}>
                                {meal.canteen.toUpperCase() + " - " + meal.counter.toUpperCase()}
                            </Text>
                            <Text style={styles.modalFocus}>
                                {meal.name}
                            </Text>
                        </View>
                        <Image
                            style={{
                                width: "auto",
                                height: 300,
                            }}
                            source={{ uri: "https://assets3.thrillist.com/v1/image/2797371/size/tmg-article_default_mobile.jpg" }}
                        />
                        <View
                            style={{
                                flexDirection: "column",
                                backgroundColor: "#f9f9f9",
                                padding: 8
                            }}
                        >
                            {meal.allergies.map((item, index) => <Text key={index}>{item}</Text>)}
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.modalFocus}>
                                {meal.price + "€"}
                            </Text>
                            <Text style={styles.modalFocus}>
                                {meal.distance + " km"}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={styles.bigButton}
                                onPress={() => {
                                    this.setModalVisible(!this.state.modalVisible);
                                }}
                            >
                                <Icon
                                    name="x"
                                    type="feather"
                                    color="white"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.bigButton}
                                onPress={() => {
                                    this.props.navigate();
                                    this.setModalVisible(!this.state.modalVisible);
                                }}
                            >
                                <Icon
                                    name="map"
                                    type="feather"
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <TouchableOpacity
                    onPress={() => {
                        this.setModalVisible(true);
                    }}>
                    <View style={styles.item}>
                        <View style={styles.row}>
                            <Text style={styles.title}>{meal.name}</Text>
                            <Text style={styles.title}>{meal.price + "€"}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text>{meal.canteen}</Text>
                            <Text>{meal.distance + " km"}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        );
    }
}