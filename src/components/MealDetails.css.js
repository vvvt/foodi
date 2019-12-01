import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8
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
            fontSize: 18
        },
        modalSide: {
            fontSize: 14,
            fontWeight: "bold"
        }
    })
)