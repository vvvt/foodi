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
    finderScreenHeaderContainer: {
      flexDirection: "column",
      paddingVertical: 8,
      paddingHorizontal: 22,
      borderColor: "darkgrey",
      borderBottomWidth: 1
    },
    finderScreenHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderColor: "darkgrey",
    },
    canteenTitle: {
      fontSize: 22,
      fontWeight: "bold"
    },
    currentDayText: {
      fontSize: 18
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
