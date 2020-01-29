import { StyleSheet } from "react-native";

export default Object.freeze(
  StyleSheet.create({
    container: {
      flex: 1
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      marginHorizontal: 16,
      marginBottom: 8,
      marginTop: 24
    },
    itemSeperator: {
      height: 5
    },
    footerContainer: {
      height: 24
    },
    finderScreenHeaderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 22,
      borderColor: "darkgrey",
      borderBottomWidth: 1,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5
    },
    canteenTitle: {
      fontSize: 22,
      fontWeight: "bold"
    },
    emptyListMessageContainer: {
      width: "100%",
      height: 400,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    emptyListMessage: {
      color: "#aaa"
    },
    paddingHorizontal: {
      paddingHorizontal: 16
    }
  })
);
