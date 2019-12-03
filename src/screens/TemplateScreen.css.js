import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export default Object.freeze(
    StyleSheet.create({
        container: {
            flex: 1,
            marginTop: Constants.statusBarHeight
        },
        header: {
            fontSize: 24,
            marginVertical: 8
        }
    })
)