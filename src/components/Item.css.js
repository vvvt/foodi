import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
        item: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginTop: 16,
            marginHorizontal: 16,
            paddingVertical: 16,

            borderRadius: 4,
            backgroundColor: '#fff',
            
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,

            elevation: 4,
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16
        },
        column: {
            flex: 1,
            flexDirection: 'column',
            paddingHorizontal: 16
        },
        cardTitle: {
            fontSize: 16
        },
        cardSubTitle: {
            fontSize: 14
        },
        columnLeft: {
            flexBasis: '85%'
        },
        columnRight: {
            flexBasis: '20%'
        },
        button: {
            backgroundColor: "#0077B3",
            borderRadius: 30,
            height: 60,
            width: 60,
            display: "flex",
            justifyContent: "center"
        }
    })
)