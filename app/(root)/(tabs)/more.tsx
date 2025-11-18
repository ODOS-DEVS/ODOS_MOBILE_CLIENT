import { StyleSheet, Text, View } from "react-native";
import React from "react";

const MoreScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>MoreScreen</Text>
    </View>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
       container: {
           flex: 1,
           justifyContent: "center",
           alignItems: "center",
       },
       text: {
           fontSize: 24,
           fontWeight: "bold",
       },     
});
