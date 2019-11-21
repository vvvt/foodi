import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import styles from "./MealItem.css";
import Util from "../classes/Util";

export default class MealItem extends React.Component {

    /** @type {{ meal: import("../classes/Meal").default, canteen: import("../classes/Canteen").default, distance: number }} */
    props;

    state = {
        toggleValue: false,
        modalVisible: false
    };

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    render() {

        const { meal, canteen, distance } = this.props;

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
                                {canteen.name.toUpperCase() + " - " + meal.category.toUpperCase()}
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
                            {meal.notes.map((allergy, index) => <Text key={index}>{allergy}</Text>)}
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.modalFocus}>
                                {meal.prices.students + "€"}
                            </Text>
                            <Text style={styles.modalFocus}>
                                {Util.distanceToString(distance)}
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
                            <Text style={styles.title}>{meal.prices.students + "€"}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text>{canteen.name}</Text>
                            <Text>{Util.distanceToString(distance)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        );
    }
}