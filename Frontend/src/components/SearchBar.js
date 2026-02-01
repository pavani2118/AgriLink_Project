import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

export default function SearchBar({ value, onChange }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search products..."
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  input: { backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8 }
});
