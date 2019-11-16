import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
        item: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#f9f9f9',
            padding: 16,
            marginVertical: 2,
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: "space-between"
        },
        title: {
            fontSize: 16,
            fontWeight: "bold"
        }
    })
)