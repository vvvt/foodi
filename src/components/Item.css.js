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
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: "center",
            paddingHorizontal: 16
        },
        cardTitle: {
            fontSize: 16,
            textAlignVertical: "center"
        },
        cardSubTitle: {
            fontSize: 14,
            fontWeight: "bold",
            marginBottom: 5
        },
        cardAllergeneTitle: {
            fontSize: 14,
            fontWeight: "bold",
            marginBottom: 3
        },
        cardAllergene: {
            fontSize: 14
        },
        columnLeft: {
            flexBasis: '85%'
        },
        columnRight: {
            flexBasis: '20%'
        },
        image: {
            flex: 3,
            width: undefined,
            height: undefined
        }
    })
)