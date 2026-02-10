
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { addToCart } from "../../services/cart";

const { width } = Dimensions.get("window");

export default function ItemDetailsScreen({ route, navigation }) {
  const product = route?.params?.product;

  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showDesc, setShowDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isBuyer, setIsBuyer] = useState(true);
  const [role, setRole] = useState("buyer");
  const [productState, setProductState] = useState(product);

  const totalPrice = (Number(productState?.price) || 0) * quantity;

  // check user role
  useEffect(() => {
    (async () => {
      try {
        const role = await AsyncStorage.getItem("role");
        setRole(role || "buyer");
        setIsBuyer(role === "buyer");
      } catch {
        setIsBuyer(true);
      }
    })();
  }, []);

  useEffect(() => {
    setProductState(product);
  }, [product]);

  const handleAddToCart = async () => {
    try {
      if (!productState?.id) {
        Alert.alert("Error", "Product id missing. Please reload products from backend.");
        return;
      }

      setSaving(true);

      await addToCart(productState.id, quantity);

      Alert.alert("Added to cart", "Product added to cart successfully");
      setTimeout(() => {
        navigation.navigate("Buyer", { screen: "Cart" });
      }, 250);
    } catch (e) {
      Alert.alert("Error", e?.message || "Add to cart failed");
    } finally {
      setSaving(false);
    }
  };

  if (!productState) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#c7fdc9" />
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.missingContainer}>
          <Text style={styles.missingTitle}>Product not found</Text>
          <Text style={styles.missingText}>Please go back and select a product again.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#c7fdc9" />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image Card */}
        <View style={styles.imageCard}>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.95}
          >
            <Image 
              source={{ uri: productState?.image }} 
              style={styles.productImage}
              resizeMode="contain"
            />
            <View style={styles.zoomBadge}>
              <Ionicons name="expand-outline" size={11} color="#FFF" />
              <Text style={styles.zoomText}>Tap to zoom</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.productName}>{productState?.name}</Text>
              <Text style={styles.productCategory}>{productState?.category || 'Vegetable'}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Price</Text>
              {productState?.oldPrice && Number(productState.oldPrice) > Number(productState.price) && (
                <Text style={styles.oldPrice}>Rs. {productState.oldPrice}</Text>
              )}
              <Text style={styles.productPrice}>Rs. {productState?.price}</Text>
              <Text style={styles.priceUnit}>per kg</Text>
            </View>
          </View>

          {/* Vendor Info */}
          <View style={styles.vendorBox}>
            <View style={styles.vendorIconContainer}>
              <Ionicons name="storefront" size={16} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.soldByText}>Sold by</Text>
              <Text style={styles.vendorName}>{productState?.vendor || 'Raneth'}</Text>
            </View>
          </View>

          {/* Freshness & Rating Row */}
          <View style={styles.metaRow}>
            <View style={styles.freshnessBadge}>
              <Ionicons name="leaf" size={11} color="#059669" />
              <Text style={styles.freshnessText}>Best within 7 days</Text>
            </View>
            
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#FBBF24" />
              <Ionicons name="star" size={13} color="#FBBF24" />
              <Ionicons name="star" size={13} color="#FBBF24" />
              <Ionicons name="star-half" size={13} color="#FBBF24" />
              <Ionicons name="star-outline" size={13} color="#E5E7EB" />
              <Text style={styles.ratingValue}>4.5</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Quantity Section (Buyer Only) */}
          {isBuyer && (
            <View style={styles.quantitySection}>
              <View style={styles.quantityHeader}>
                <View style={styles.quantityTitleRow}>
                  <Ionicons name="cube-outline" size={18} color="#000" />
                  <Text style={styles.quantityTitle}>Select Quantity</Text>
                </View>
                <Text style={styles.availableStock}>Available: {productState?.quantity || 380}kg</Text>
              </View>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="remove" 
                    size={18} 
                    color={quantity <= 1 ? "#D1D5DB" : "#2E7D32"} 
                  />
                </TouchableOpacity>

                <View style={styles.quantityValueBox}>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <Text style={styles.quantityUnit}>kg</Text>
                </View>

                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={() => setQuantity(quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Total Amount (Buyer Only) */}
          {isBuyer && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>Rs. {totalPrice}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description Accordion */}
          <TouchableOpacity
            onPress={() => setShowDesc(!showDesc)}
            activeOpacity={0.9}
          >
            <View style={styles.descriptionHeader}>
              <View style={styles.descriptionTitleRow}>
                <Ionicons name="document-text-outline" size={18} color="#000" />
                <Text style={styles.descriptionTitle}>Product Description</Text>
              </View>
              <Ionicons 
                name={showDesc ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
              />
            </View>

            {showDesc && (
              <Text style={styles.descriptionText}>
                {productState?.description || 'Fresh and locally sourced produce. High quality, farm-fresh vegetables delivered directly to your door. Rich in nutrients and perfect for healthy meals.'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Vendor Update Button */}
        {!isBuyer && role === "vendor" && (
          <View style={styles.vendorEditContainer}>
            <TouchableOpacity
              style={styles.vendorEditButton}
              onPress={() => navigation.navigate("EditProduct", { product: productState })}
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text style={styles.vendorEditButtonText}>Update Product Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer for fixed button */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed Add to Cart Button */}
      {isBuyer && (
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={[styles.addToCartButton, saving && styles.addToCartButtonDisabled]}
            onPress={handleAddToCart}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={20} color="#FFF" />
            <Text style={styles.addToCartText}>
              {saving ? "Adding..." : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Zoom Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setModalVisible(false)}
            activeOpacity={0.8}
          >
            <View style={styles.closeIconContainer}>
              <Ionicons name="close" size={26} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Image 
            source={{ uri: productState?.image }} 
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}

 
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#c7fdc9"
  },
  scrollContent: { 
    paddingBottom: 90, 
  },

  // Back Button
  backButton: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  missingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  missingText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  // Image Card
  imageCard: {
    backgroundColor: "#FFFFFF",
    margin: 14,
    marginTop: 65,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 240,
    backgroundColor: "#FAFAFA",
  },
  zoomBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  zoomText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "600",
  },

  // Content Card
  contentCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },

  // Product Header
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
  },
  titleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  priceBox: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    minWidth: 85,
  },
  priceLabel: {
    fontSize: 9,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 1,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2E7D32",
  },
  oldPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  priceUnit: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 1,
  },

  // Vendor Update Button
  vendorEditContainer: {
    marginHorizontal: 14,
    marginTop: 14,
  },
  vendorEditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  vendorEditButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Vendor Box
  vendorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 9,
  },
  vendorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  soldByText: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 1,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },

  // Meta Row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  freshnessBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  freshnessText: {
    color: "#059669",
    fontWeight: "600",
    fontSize: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingValue: {
    marginLeft: 5,
    color: "#4B5563",
    fontWeight: "700",
    fontSize: 12,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  // Quantity Section
  quantitySection: {
    marginBottom: 16,
  },
  quantityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  quantityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  quantityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  availableStock: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  quantityButtonDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  quantityValueBox: {
    alignItems: "center",
    minWidth: 60,
  },
  quantityValue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#000",
  },
  quantityUnit: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 1,
  },

  // Total Row
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2E7D32",
  },

  // Description
  descriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  descriptionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  descriptionText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
  },

  // Fixed Button Container
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    elevation: 8,
  },
  addToCartButton: {
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#2E7D32",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0.1,
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
    height: "70%",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});