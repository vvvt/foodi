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
        },
        bigButton: {
            backgroundColor: "#0077B3",
            borderRadius: 30,
            height: 60,
            width: 60,
            display: "flex",
            justifyContent: "center"
        },
        modalFocus: {
            fontSize: 18,
            padding: 10
        },
        modalSide: {
            fontSize: 14,
            fontWeight: "bold"
        }
    })
)