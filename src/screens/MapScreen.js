import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";

import LocationManager from "../manager/LocationManager";
import CanteenManager from "../manager/CanteenManager";
import Util from "../classes/Util";

const locationManager = LocationManager.instance;
const canteenManager = CanteenManager.instance;

const position = {
    latitude: 51.025629,
    longitude: 13.723381
}

export default class MapScreen extends React.Component {

    constructor(props) {
        super(props);

        this.setSurroundingCanteensState = this.setSurroundingCanteensState.bind(this);
    }

    state = {
        surroundingCanteens: canteenManager.surroundingCanteens
    }

    /**
     * Called when this screen is loaded
     */
    componentDidMount() {
        canteenManager.on("canteensChanged", this.setSurroundingCanteensState);
    }

    /**
     * Called when this screen is left
     */
    componentWillUnmount() {
        canteenManager.off("canteensChanged", this.setSurroundingCanteensState);
    }

    render() {

        const currentPosition = Object.assign({}, locationManager.lastDevicePosition.timestamp === 0 ? position : locationManager.lastDevicePosition.coordinate);
        const currentRegion = Object.assign(currentPosition, {            
            latitudeDelta: 0.010,
            longitudeDelta: 0.010
        });

        return (
            <View style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    region={currentRegion}
                    showsUserLocation
                >
                    { this.renderCanteens() }
                </MapView>
            </View>
        );
    }

    renderCanteens() {
        console.log(`Rendering ${this.state.surroundingCanteens.length} canteen markers`);

        return this.state.surroundingCanteens.map(
            ({ canteen, distance }) => (
                <Marker
                    key={canteen.id}
                    title={canteen.name}
                    description={Util.distanceToString(distance) + " away"}
                    coordinate={canteen.coordinate}
                />
            )
        );
    }

    setSurroundingCanteensState( surroundingCanteens ) {
        console.log("Cannteens changed!");
        this.setState({ surroundingCanteens });
    }

}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        height: 'auto',
        width: 'auto',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});