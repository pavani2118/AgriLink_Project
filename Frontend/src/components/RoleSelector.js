import React from "react";
import { View, Button, StyleSheet } from "react-native";

export default function RoleSelector({ navigation }) {
  return (
    <View style={styles.container}>
      <Button title="Buyer" onPress={() => navigation.replace("Buyer")} />
      <Button title="Vendor" onPress={() => navigation.replace("Vendor")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" }
});
