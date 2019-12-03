import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
        item: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 16,
            marginVertical: 10,
            marginHorizontal: 16,

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
            justifyContent: 'space-between'
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: "bold",
            lineHeight: 16
        },
        cardSubTitle: {
            fontSize: 14,
            lineHeight: 18
        },
        columnLeft: {
            flexBasis: '85%'
        },
        columnRight: {
            flexBasis: '20%'
        }
    })
)