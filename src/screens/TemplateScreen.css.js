import { StyleSheet } from "react-native";
import Constants from "expo-constants";

export default Object.freeze(
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: Constants.statusBarHeight
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
    locationRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 16,
      marginHorizontal: 22
    },
    canteenTitle: {
      fontSize: 22,
      fontWeight: "bold"
    }
  })
);
