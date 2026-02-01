// src/screens/Buyer/ItemDetailsScreen.js
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { addToCart } from "../../services/cart"; // ✅ ADD THIS

export default function ItemDetailsScreen({ route, navigation }) {
  const { product } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showDesc, setShowDesc] = useState(false);
  const [saving, setSaving] = useState(false); // ✅ ADD

  const totalPrice = (Number(product?.price) || 0) * quantity;

  const handleAddToCart = async () => {
  try {
    if (!product?.id) {
      Alert.alert("Error", "Product id missing. Please reload products from backend.");
      return;
    }

    setSaving(true);

    await addToCart(product.id, quantity);

    // ✅ success message after adding
    Alert.alert("Added ✅", "Added to cart successfully");
  } catch (e) {
    Alert.alert("Error", e?.message || "Add to cart failed");
  } finally {
    setSaving(false);
  }
};


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={true}
    >
      {/* ===== Back Button ===== */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#1f2937" />
      </TouchableOpacity>

      {/* ===== Product Info Container ===== */}
      <View style={styles.productContainer}>
        {/* Product Image */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={{ uri: product?.image }} style={styles.productImage} />
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoTopRow}>
            <Text style={styles.productTitle}>{product?.name}</Text>
            <Text style={styles.price}>Rs. {product?.price}</Text>
          </View>

          <Text style={styles.soldBy}>
            Sold by <Text style={styles.vendorName}>{product?.vendor}</Text>
          </Text>

          <View style={styles.rowBetween}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Best within 7 days</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#facc15" />
              <Ionicons name="star" size={18} color="#facc15" />
              <Ionicons name="star" size={18} color="#facc15" />
              <Ionicons name="star-half" size={18} color="#facc15" />
              <Ionicons name="star-outline" size={18} color="#facc15" />
              <Text style={styles.ratingText}> 4.5</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ===== Quantity & Total ===== */}
      <View style={styles.qtyContainer}>
        <Text style={styles.sectionTitle}>Quantity</Text>
        <View style={styles.qtyControls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qtyText}>{quantity}</Text>

          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.totalValue}>Total: Rs. {totalPrice}</Text>
      </View>

      {/* ===== Description ===== */}
      <TouchableOpacity
        style={styles.descContainer}
        onPress={() => setShowDesc(!showDesc)}
        activeOpacity={0.9}
      >
        <View style={styles.descHeader}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.arrow}>{showDesc ? "−" : "+"}</Text>
        </View>

        {showDesc && <Text style={styles.descText}>{product?.description}</Text>}
      </TouchableOpacity>

      {/* ===== Add to Cart ===== */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleAddToCart}
        disabled={saving}
        activeOpacity={0.9}
      >
        <Text style={styles.actionButtonText}>{saving ? "Adding..." : "Add to Cart"}</Text>
      </TouchableOpacity>

      {/* ===== Image Modal ===== */}
      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Image source={{ uri: product?.image }} style={styles.modalImage} />
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#d0f0c0" },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  productContainer: {
    backgroundColor: "#ffe5d6ee",
    borderRadius: 24,
    padding: 18,
    margin: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  productImage: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    marginBottom: 16,
  },
  infoContainer: {},
  infoTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: { fontSize: 28, fontWeight: "800", color: "#1f2937" },
  price: { fontSize: 24, fontWeight: "800", color: "#16a34a" },

  soldBy: { fontSize: 16, color: "#4b5563", marginVertical: 6 },
  vendorName: { fontWeight: "700", color: "#16a34a" },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#f97316",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  ratingText: { marginLeft: 6, color: "#4b5563", fontWeight: "700" },

  qtyContainer: {
    backgroundColor: "#ffe5d6ee",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  qtyControls: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { backgroundColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  qtyBtnText: { fontSize: 24, fontWeight: "700" },
  qtyText: { marginHorizontal: 16, fontSize: 18, fontWeight: "700" },
  totalValue: { marginTop: 12, fontSize: 20, fontWeight: "800", color: "#16a34a" },

  descContainer: {
    backgroundColor: "#ffe5d6ee",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  descHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  arrow: { fontSize: 18, fontWeight: "700" },
  descText: { marginTop: 12, fontSize: 15, lineHeight: 22 },

  actionButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 18,
    marginHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 40,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  // ✅ fixed the typo "sheight" -> "height" (no UI change)
  modalImage: { width: "90%", height: "70%", borderRadius: 16, resizeMode: "contain" },
  modalClose: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  closeBtnText: { fontSize: 28, color: "#fff", fontWeight: "700" },
});
