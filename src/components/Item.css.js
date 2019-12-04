import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
        item: {
            flex: 1,
            flexDirection: 'column',
            marginTop: 16,
            marginHorizontal: 16,
            paddingVertical: 16,

            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#f1f3f6',
            backgroundColor: '#fff',
            color: '#151522'
            
            /* shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,

            elevation: 4, */
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
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
        }
    })
)