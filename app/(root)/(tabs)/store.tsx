import { StyleSheet, Text, View } from "react-native";
import React from "react";

const StoreScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>StoreScreen</Text>
    </View>
  );
};

export default StoreScreen;

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
