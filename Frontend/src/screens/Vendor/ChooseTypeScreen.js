import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ChooseTypeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Product Type</Text>

       
      <TouchableOpacity
        style={[styles.cardButton, styles.freshButton]}
        onPress={() => navigation.navigate("AddProduct")}
        activeOpacity={0.8}
      >
        <Text style={styles.cardText}>Fresh Product</Text>
      </TouchableOpacity>

     
      <TouchableOpacity
        style={[styles.cardButton, styles.surplusButton]}
        onPress={() => navigation.navigate("AddSurplus")}
        activeOpacity={0.8}
      >
        <Text style={styles.cardText}>Surplus Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4EA",  
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 36,
    textAlign: "center",
  },

  cardButton: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 5, 
    shadowColor: "#000", 
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    alignItems: "center",
  },

  freshButton: {
    backgroundColor: "#22c55e", // green
  },

  surplusButton: {
    backgroundColor: "#f97316", // orange
  },

  cardText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
});
