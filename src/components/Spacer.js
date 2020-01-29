import React from "react";
import { View, StyleSheet } from "react-native";

export default class Spacer extends React.PureComponent {

    /** @type {{ vertical?: boolean, size: number }} */
    props;
  
    constructor(props) {
      super(props);
      this.style = StyleSheet.create({
        height: this.props.vertical ? 0 : this.props.size,
        width: !this.props.vertical ? 0 : this.props.size
      });
    }
  
    render() {
      return (
        <View style={this.style} />
      );
    }
  }