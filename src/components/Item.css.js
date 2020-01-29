import { StyleSheet } from 'react-native';

export default Object.freeze(
    StyleSheet.create({
        item: {
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 16,
            padding: 16,

            borderRadius: 4,
            borderWidth: 2,
            backgroundColor: '#fff',
            borderBottomColor: "#b2b2b2",
            borderColor: "#efefef"
        },
        itemBorderEveningMeal: {
            borderBottomColor: "#0077b3"
        },
        itemBorderVegetarianMeal: {
            borderBottomColor: "#38b200"
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: "center"
        },
        col: {
            flex: 1
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
        textRight: {
            textAlign: "right"
        },
        image: {
            flex: 3,
            width: undefined,
            height: undefined
        },
        smallSpacerVertical: {
            height: 10
        },
        moonIcon: {
            position: "absolute",
            right: 10,
            top: 10
        },
        paddingHorizontal: {
            paddingHorizontal: 16
        },
        toggleItemTitleContainer: {
            flexGrow: 1,
            flex: 1,
            marginRight: 8
        }
    })
)