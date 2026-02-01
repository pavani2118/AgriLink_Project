import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import globalStyles from "../../styles/globalStyles";
import { deleteProduct, getMyProducts } from "../../services/products";

export default function DashboardScreen({ navigation }) {
  const [vendorName, setVendorName] = useState("");
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadVendorAndProducts = async () => {
    try {
      setLoading(true);
      console.log("=== Loading vendor products ===");

      // Load vendor name
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("Vendor user:", user);
        setVendorName(user?.name || "");
      }

      // Load products
      console.log("Fetching products...");
      const res = await getMyProducts();
      console.log("Raw response:", res);
      console.log("Products array:", res?.products);
      
      const products = res?.products || [];
      console.log("Setting products, count:", products.length);
      
      setVendorProducts(products);
    } catch (e) {
      console.error("=== Load products error ===");
      console.error("Error:", e);
      console.error("Error message:", e.message);
      Alert.alert("Error", e.message || "Failed to load products");
      setVendorProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorAndProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Dashboard focused, reloading products...");
      loadVendorAndProducts();
    }, [])
  );

  const removeProduct = async (id) => {
    try {
      console.log("Removing product:", id);
      await deleteProduct(id);
      await loadVendorAndProducts();
      Alert.alert("Success", "Product removed");
    } catch (e) {
      console.error("Remove error:", e);
      Alert.alert("Error", e.message || "Delete failed");
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>
        {vendorName ? `${vendorName}'s Products` : "My Products"}
      </Text>

      {loading && (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
          Loading...
        </Text>
      )}

      {!loading && vendorProducts.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
          You have no products
        </Text>
      )}

      {!loading && vendorProducts.length > 0 && (
        <FlatList
          data={vendorProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.productImage} />
              )}

              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>Rs. {item.price}</Text>
              {item.quantity !== undefined && (
                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
              )}

              {item.type === "Surplus" && (
                <View style={styles.surplusBadge}>
                  <Text style={styles.surplusText}>Surplus</Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#ff4d4d" }]}
                  onPress={() => removeProduct(item.id)}
                >
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#2E7D32" }]}
                  onPress={() => navigation.navigate("ItemDetails", { product: item })}
                >
                  <Text style={styles.buttonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate("ChooseType")}
      >
        <Text style={globalStyles.buttonText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    maxWidth: "48%",
    backgroundColor: "#E6F4EA",
    borderRadius: 14,
    padding: 10,
    margin: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  productImage: { width: "100%", height: 100, borderRadius: 12, marginBottom: 6, backgroundColor: "#eee" },
  name: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  price: { fontSize: 14, fontWeight: "bold", color: "#16a34a", marginVertical: 2 },
  quantity: { fontSize: 12, fontWeight: "600", color: "#f97316" },
  surplusBadge: {
    backgroundColor: "#f97316",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  surplusText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, paddingVertical: 6, borderRadius: 6, alignItems: "center", marginHorizontal: 2 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
});
