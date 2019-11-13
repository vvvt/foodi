import React, { useState } from "react";
import { View, Text, FlatList, Picker, StyleSheet, SafeAreaView, Switch } from "react-native";
import Constants from 'expo-constants';

const DATA = [
  {
    id: "sold-out",
    title: "Show sold out meals"
  },
  {
    id: "fetch-week",
    title: "Fetch week's menu via",
    options: [
      {
        label: "WiFi only",
        value: "wifi"
      },
      {
        label: "WiFi/Cellular",
        value: "data"
      }
    ]
  },
  {
    id: "fetch-images",
    title: "Fetch meal images via",
    options: [
      {
        label: "WiFi only",
        value: "wifi"
      },
      {
        label: "WiFi/Cellular",
        value: "data"
      }
    ]
  }

];

function ToggleItem({ title }) {
  const [toggleValue, setToggleValue] = useState(0);

  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Switch
        value={toggleValue}
        onValueChange={(val) => {
          setToggleValue(val);
          alert(title + " " + val);
        }}
      />
    </View>
  );
}

function SelectItem({ title, options }) {
  const [selectValue, setSelectValue] = useState("wifi");

  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Picker
          style={styles.picker}
          selectedValue={selectValue}
          onValueChange={(itemValue) =>
            {
              alert(title + " " + itemValue);
              setSelectValue(itemValue);
            }
          }
      >
        {options.map((v) => {
          return <Picker.Item label={v.label} value={v.value} />
        })}
      </Picker>
        </View >
    )
}

export default class SettingsScreen extends React.Component {

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={DATA}
          renderItem={({ item }) => item.options ? <SelectItem title={item.title} options={item.options} /> : <ToggleItem title={item.title} />}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    marginHorizontal: 16,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 2,
  },
  title: {
    fontSize: 16,
  },
  picker: {
    height: 60,
    width: 200
  }
  
});