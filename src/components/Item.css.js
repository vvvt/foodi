import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
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
    })
)