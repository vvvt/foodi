import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationEvents } from "react-navigation";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";

import LocationManager from "../manager/LocationManager";
import CanteenManager from "../manager/CanteenManager";
import Util from "../classes/Util";
import Locale from "../classes/Locale";

const locationManager = LocationManager.instance;
const canteenManager = CanteenManager.instance;

export default class MapScreen extends React.PureComponent {

    constructor(props) {
        super(props);

        this.setSurroundingCanteensState = this.setSurroundingCanteensState.bind(this);
        this.mapView = React.createRef();
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

        return (
            <View style={styles.container}>
                <NavigationEvents
                    onDidFocus={() => {
                        // when this screen is focuse: check if there is a target coordinate given
                        /** @type {import("../classes/Coordinate").default} */
                        const c = this.props.navigation.getParam("targetCoordinate");
                        if (c) {
                            this.props.navigation.setParams({ targetCoordinate: undefined });
                            console.log(`Navigating on MapScreen to ${c.latitude},${c.longitude}`);
                            this.navigateToCoordinate(c);
                        }
                    }}
                />

                <MapView
                    ref={this.mapView}
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={styles.map}
                    initialRegion={ locationManager.lastDevicePosition.timestamp === 0 ? null : {
                        latitude: locationManager.lastDevicePosition.coordinate.latitude,
                        longitude: locationManager.lastDevicePosition.coordinate.longitude,
                        latitudeDelta: 0.010,
                        longitudeDelta: 0.010
                    }}
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
                    description={Util.distanceToString(distance) + " " + Locale.LOCALE.MAP_SCREEN.away}
                    coordinate={canteen.coordinate}
                />
            )
        );
    }

    setSurroundingCanteensState( surroundingCanteens ) {
        console.log("Cannteens changed!");
        this.setState({ surroundingCanteens });
    }

    /**
     * Sets the focus on a given coordinate with a nice animation
     * @param {import("../classes/Coordinate").default} coordinate The coordinate to focus on
     */
    navigateToCoordinate( coordinate ) {
        /** @type {import("react-native-maps").default} */
        const mapView = this.mapView.current;
        if (mapView) mapView.animateCamera({ center: { latitude: coordinate.latitude, longitude: coordinate.longitude } }, { duration: 1000 });
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