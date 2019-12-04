import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
        item: {
            flex: 1,
            flexDirection: 'column',
            marginVertical: 16,
            marginHorizontal: 16,

            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#f1f3f6',
            backgroundColor: '#fff',
            color: '#151522'
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        column: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 16
        },
        button: {
            backgroundColor: "#fff",
            borderRadius: 30,
            borderWidth: 3,
            borderColor: '#151522',
            color: '#151522',
            height: 60,
            width: 60,
            display: "flex",
            justifyContent: "center"
        }
    })
)