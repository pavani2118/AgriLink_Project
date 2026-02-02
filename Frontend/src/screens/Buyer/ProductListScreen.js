 
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductListScreen({ navigation }) {
  const products = [
    {
      id: "1",
      name: "Tomatoes",
      price: 100,
      quantity: "1kg",
      vendor: "Organic Veg Master",
      image: "https://images.unsplash.com/photo-1546470427-e26264be0b9b",
      description: "Fresh organic tomatoes directly from the farm",
    },
    {
      id: "2",
      name: "Tomatoes",
      price: 110,
      quantity: "1kg",
      vendor: "Green Leaf Farm",
      image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce",
      description: "Naturally grown, pesticide free tomatoes",
    },
    {
      id: "3",
      name: "Tomatoes",
      price: 95,
      quantity: "1kg",
      vendor: "Village Harvest",
      image: "https://images.unsplash.com/photo-1607305387299-a3d9611cd469",
      description: "Fresh morning harvest tomatoes",
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => navigation.navigate("ItemDetails", { product: item })}
    >
      
      <Image source={{ uri: item.image }} style={styles.productImage} />

      
      <Text style={styles.productName} numberOfLines={1}>
        {item.name}
      </Text>

      
      <Text style={styles.productDesc} numberOfLines={2}>
        {item.description}
      </Text>

      
      <Text style={styles.productQuantity}>{item.quantity}</Text>

      
      <Text style={styles.productPrice}>Rs. {item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Fresh Tomatoes</Text>
        <Text style={styles.subtitle}>Buy directly from trusted farmers</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2} 
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7fdc9",
  },

  header: {
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
  },

  welcome: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 4,
  },

  cardWrapper: {
    flex: 1,
    maxWidth: "48%", 
    margin: 6,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },

  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },

  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },

  productDesc: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 4,
  },

  productQuantity: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16a34a",
    marginBottom: 2,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
  },
});
