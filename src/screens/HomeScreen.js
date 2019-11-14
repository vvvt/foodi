import React from "react";
import { View, Text, Button} from "react-native";

export default class HomeScreen extends React.Component {

    render() {

        return (
            <View>
                <Text>Test</Text>
                <Button
                    title="Go to Test"
                    onPress={() => this.props.navigation.navigate('test')}
                />
                <Button
                    title="Go to Preferences"
                    onPress={() => this.props.navigation.navigate('preferences')}
                />
                <Button
                    title="Go to Settings"
                    onPress={() => this.props.navigation.navigate('settings')}
                />
                <Button
                    title="Go to Map"
                    onPress={() => this.props.navigation.navigate('map')}
                />
            </View>
        );

    }

}