import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
        item: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#f9f9f9',
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginVertical: 4
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8
        },
        title: {
            fontSize: 16,
            fontWeight: "bold"
        },
        columnLeft: {
            flexBasis: '90%'
        },
        columnRight: {
            flexBasis: '20%'
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