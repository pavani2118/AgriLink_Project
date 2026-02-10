import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../styles/globalStyles";
import { deleteProduct, getMyProducts } from "../../services/products";

export default function DashboardScreen({ navigation }) {
  const [vendorName, setVendorName] = useState("");
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVendorAndProducts();
    setRefreshing(false);
  };

  const handleConfirmDelete = async (productId, productName) => {
    console.log("🔥🔥🔥 handleConfirmDelete STARTED 🔥🔥🔥");
    console.log("Deleting product ID:", productId);
    
    try {
      // Step 1: Delete from database
      console.log("🔄 Calling deleteProduct API...");
      const result = await deleteProduct(productId);
      console.log("✅ Delete API completed:", result);
      
      // Step 2: Update UI
      console.log("🔄 Updating UI - removing from state...");
      setVendorProducts((prevProducts) => {
        const filtered = prevProducts.filter(
          (p) => (p.id || p._id) !== productId
        );
        console.log(`Products updated: ${prevProducts.length} → ${filtered.length}`);
        return filtered;
      });
      
      console.log(" DELETION COMPLETE ");
      Alert.alert("Success", `${productName} removed successfully`);
      
    } catch (error) {
      console.error(" DELETE FAILED ");
      console.error("Error:", error);
      console.error("Message:", error.message);
      
      Alert.alert("Error", error.message || "Failed to delete");
      await loadVendorAndProducts();
    }
  };

  const removeProduct = (product) => {
    const productId = product?.id || product?._id;
    const productName = product?.name || "this product";
    
    console.log("=== REMOVE PRODUCT CALLED ===");
    console.log("Product ID:", productId);
    console.log("Product Name:", productName);
    console.log("Platform:", Platform.OS);
    
    if (!productId) {
      Alert.alert("Error", "Missing product ID");
      return;
    }

    // For WEB platform, use window.confirm
    if (Platform.OS === 'web') {
      console.log("Using window.confirm for web");
      const confirmed = window.confirm(`Are you sure you want to remove "${productName}"?`);
      console.log("User confirmation:", confirmed);
      
      if (confirmed) {
        console.log(" User confirmed deletion (WEB)");
        handleConfirmDelete(productId, productName);
      } else {
        console.log("User cancelled (WEB)");
      }
    } else {
      // For mobile (iOS/Android), use Alert
      console.log("Using Alert.alert for mobile");
      Alert.alert(
        "Remove Product",
        `Are you sure you want to remove "${productName}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log(" User cancelled (MOBILE)")
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              console.log(" User confirmed deletion (MOBILE)");
              handleConfirmDelete(productId, productName);
            }
          }
        ]
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      {/* Product Image */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ItemDetails", { product: item })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
            </View>
          )}

          {/* Surplus Badge */}
          {item.type === "Surplus" && (
            <View style={styles.surplusBadge}>
              <Text style={styles.surplusText}>Surplus</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs. {Number(item.price).toFixed(2)}</Text>
          {item.quantity !== undefined && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.detailsBtn]}
          onPress={() => navigation.navigate("ItemDetails", { product: item })}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.removeBtn]}
          onPress={() => {
            console.log("🔴 Remove button pressed for:", item.name);
            removeProduct(item);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Products</Text>
          {vendorName && (
            <Text style={styles.headerSubtitle}>{vendorName}</Text>
          )}
        </View>
        {vendorProducts.length > 0 && (
          <View style={styles.productCountBadge}>
            <Text style={styles.productCountText}>{vendorProducts.length}</Text>
          </View>
        )}
      </View>

      {/* Loading State */}
      {loading && vendorProducts.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && vendorProducts.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cube-outline" size={80} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>No products yet</Text>
          <Text style={styles.emptySubtitle}>Add your first product to get started</Text>
          
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => navigation.navigate("ChooseType")}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.emptyAddButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products List */}
      {!loading && vendorProducts.length > 0 && (
        <FlatList
          data={vendorProducts}
          keyExtractor={(item) => String(item.id || item._id)}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2E7D32"
              colors={["#2E7D32"]}
            />
          }
        />
      )}

      {/* Floating Add Button */}
      {vendorProducts.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate("ChooseType")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  productCountBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 36,
    alignItems: "center",
  },
  productCountText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyAddButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  // List Styles
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },

  // Card Styles
  cardWrapper: {
    flex: 1,
    maxWidth: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    margin: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },

  // Image Container
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 140,
    backgroundColor: "#F3F4F6",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },

  // Surplus Badge
  surplusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#F97316",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  surplusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  // Product Info
  productInfo: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 20,
    minHeight: 40,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32",
  },
  quantityBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    paddingTop: 0,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  detailsBtn: {
    backgroundColor: "#2E7D32",
  },
  removeBtn: {
    backgroundColor: "#DC2626",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Floating Add Button
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
});