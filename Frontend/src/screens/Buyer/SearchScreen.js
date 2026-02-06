import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getAllProducts } from "../../services/products";

const categories = ["All", "Vegetable", "Fruit", "Grains", "Surplus"];

const normalizeProducts = (list = []) =>
  list.map((p) => ({
    ...p,
    id: String(p?.id || p?._id || ""),
    image: p?.image || p?.imageUrl || "",
  })).filter((p) => p.id);

export default function SearchScreen({ navigation, route }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [userName, setUserName] = useState("");

  const isPreview = route?.params?.preview === true;

  const loadUserAndProducts = async () => {
    const userStr = await AsyncStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user?.name || "");
    }

    const res = await getAllProducts();
    setProducts(normalizeProducts(res?.products || []));
  };

  useEffect(() => {
    loadUserAndProducts().catch((e) => console.log(e.message));
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((item) => {
      const categoryLabel = item.type === "Surplus" ? "Surplus" : item.category || "All";
      const matchCategory = activeCategory === "All" || categoryLabel === activeCategory;
      const matchSearch = q.length === 0 || (item.name || "").toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, query, activeCategory]);

  const handlePressItem = (item) => {
    if (isPreview) {
      navigation.navigate("Login");
      return;
    }
    navigation.navigate("ItemDetails", { product: item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {isPreview && (
          <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signupButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.header}>{userName ? `${userName} Marketplace` : "Marketplace"}</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search vegetables, fruits, grains..."
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <Text
            key={cat}
            style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}
            onPress={() => setActiveCategory(cat)}
          >
            {cat}
          </Text>
        ))}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cardWrapper} onPress={() => handlePressItem(item)}>
            {!!item.image && <Image source={{ uri: item.image }} style={styles.productImage} />}
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.productQuantity}>Qty: {item.quantity}kg</Text>
            <Text style={styles.productPrice}>Rs. {item.price}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#E9F0D6" },
  // headerRow: { position: "relative", alignItems: "center", marginBottom: 10 },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
},
  header: { fontSize: 26, fontWeight: "800", color: "#2E7D32" },
  signupButton: {
    position: "absolute",
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderColor: "#092b0b",
    borderWidth: 2,
  },
  signupButtonText: { color: "#2E7D32", fontSize: 14, fontWeight: "700" },
  search: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 12,
    color: "#555555", 
    fontWeight:600,
  },
  categoryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  categoryText: {
    color: "#2E7D32",
    fontWeight: "500",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    fontSize: 12,
  },
  categoryTextActive: { backgroundColor: "#2E7D32", color: "#FFF" },
  cardWrapper: {
    flex: 1,
    margin: 6,
    maxWidth: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 3,
  },
  productImage: { width: "100%", height: 100, borderRadius: 8, marginBottom: 6 },
  productName: { fontSize: 16, fontWeight: "700", color: "#1f2937", marginBottom: 4 },
  productDesc: { fontSize: 12, color: "#4b5563", marginBottom: 4 },
  productQuantity: { fontSize: 12, fontWeight: "500", color: "#16a34a", marginBottom: 2 },
  productPrice: { fontSize: 14, fontWeight: "bold", color: "#2E7D32" },
});

