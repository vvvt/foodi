import React from "react";
import { View, Text } from "react-native";
import LocationManager from "../manager/LocationManager";

export default class PermissionsScreen extends React.PureComponent {

    /** @type {{ OnPermissionsGranted: VoidFunction }} */
    props;

    static defaultProps = {
        OnPermissionsGranted: () => {}
    }

    async askForPermissions() {
        await LocationManager.instance.requestPermissions();
        if (LocationManager.instance.hasPermission) this.props.OnPermissionsGranted();
    }

    componentDidMount() {
        this.askForPermissions();
    }

    render() {
        return (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 30 }} >
                <Text style={{ textAlign: "center" }} >Bitte erlauben Sie das Location Tracking für diese App</Text>
            </View>
        );
    }

}