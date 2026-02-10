import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import globalStyles from "../../styles/globalStyles";
import { ProfileContext } from "../../context/ProfileContext";
import { getMyCart, removeCartItem } from "../../services/cart";
import { openChatByProduct, sendMessage } from "../../services/chat";
import { placeOrderFromCart } from "../../services/order";

export default function CartScreen({ navigation }) {
  const { profile, refreshProfile } = useContext(ProfileContext);

  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [userName, setUserName] = useState("");
  const [placing, setPlacing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // prefer context profile
    if (profile?.name) setUserName(profile.name);

    // fallback: older storage
    (async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData && !profile?.name) {
          const user = JSON.parse(userData);
          setUserName(user?.name || "");
        }
      } catch {}
    })();

     
    if (!profile?.name && typeof refreshProfile === "function") {
      refreshProfile().catch(() => {});
    }
  }, [profile?.name]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const normalizeCart = (res) => {
    const raw =
      (res && Array.isArray(res) && res) ||
      (res?.items && Array.isArray(res.items) && res.items) ||
      (res?.cart && Array.isArray(res.cart) && res.cart) ||
      (res?.items && typeof res.items === "object" && Object.values(res.items)) ||
      [];

    return raw
      .map((item) => {
        const id = item?.id || item?._id || item?.cartItemId;
        const quantity = Number(item?.quantity || 1);
        const p = item?.product || item;

        const product = {
          id: p?.id || p?._id || item?.productId,
          name: p?.name,
          price: p?.price,
          description: p?.description,
          image: p?.image || p?.imageUrl,
          vendor: p?.vendor || p?.vendorName,
          vendorId: p?.vendorId || p?.vendor,
        };

        if (!id || !product?.name) return null;
        return { id: String(id), quantity, product };
      })
      .filter(Boolean);
  };

  const loadCart = async () => {
    try {
      const res = await getMyCart();
      setCart(normalizeCart(res));
      setSelectedItems({});
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to load cart");
      setCart([]);
    }
  };

  const removeItem = async (cartItemId) => {
    const idStr = String(cartItemId);

    setCart((prev) => prev.filter((c) => c.id !== idStr));
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[idStr];
      return next;
    });

    try {
      await removeCartItem(idStr);
    } catch (e) {
      Alert.alert("Error", e.message || "Remove failed");
      loadCart();
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSelectedIds = () => cart.filter((x) => selectedItems[x.id]).map((x) => x.id);

  const getTotal = () =>
    cart.reduce((total, item) => {
      if (!selectedItems[item.id]) return total;
      const price = Number(item?.product?.price || 0);
      const qty = Number(item?.quantity || 1);
      return total + price * qty;
    }, 0);

  const goToChat = (p) => {
    navigation.navigate("Chat", {
      screen: "ChatScreen",
      params: {
        productId: p.id,
        productName: p.name,
        vendorName: p.vendor,
        vendorId: p.vendorId,
      },
    });
  };

  const handlePlaceOrder = async (selectedIds) => {
    if (placing) return;

    try {
      setPlacing(true);

      const res = await placeOrderFromCart(selectedIds);

      const orderedItems = cart.filter((c) => selectedItems[c.id]);
      const vendorMap = {};
      for (const it of orderedItems) {
        const vId = it.product?.vendorId || "";
        if (!vendorMap[vId]) vendorMap[vId] = [];
        vendorMap[vId].push(it);
      }

      for (const [vendorId, items] of Object.entries(vendorMap)) {
        try {
          const firstProductId = items[0]?.product?.id;
          if (!firstProductId) continue;

          const openRes = await openChatByProduct(firstProductId).catch(() => null);
          const threadId = openRes?.thread?.id;
          if (!threadId) continue;

          const formatCurrency = (v) => `Rs. ${Number(v || 0).toFixed(2)}`;
          const formatDate = (d) => new Date(d).toLocaleString();

          const orderId = res?.order?.id || "-";
          let vendorTotal = 0;
          const itemLines = items.map((it) => {
            const name = it.product?.name || "Item";
            const qty = Number(it.quantity || 1);
            const price = Number(it.product?.price || 0);
            const subtotal = qty * price;
            vendorTotal += subtotal;
            return `• ${name}\n  Qty: ${qty}   ${formatCurrency(price)} each   Subtotal: ${formatCurrency(subtotal)}`;
          });

          const header = `🛒 New Order Received\n\nOrder ID: ${orderId}\nBuyer: ${profile?.name || "Buyer"}\nDate: ${formatDate(Date.now())}\n\nItems:\n`;
          const footer = `\nSubtotal: ${formatCurrency(vendorTotal)}\n\nPlease confirm when the items are ready. Thank you! 🙏`;

          const text = header + itemLines.join("\n\n") + footer;
          await sendMessage(threadId, text).catch(() => {});
        } catch (e) {
          // ignore per-vendor errors
        }
      }

      const remaining = cart.filter((c) => !selectedItems[c.id]);
      setCart(remaining);
      setSelectedItems({});

      Alert.alert("Success", "Order placed successfully!");
    } catch (e) {
      Alert.alert("Error", e.message || "Place order failed");
    } finally {
      setPlacing(false);
    }
  };

  const onCheckout = () => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) {
      Alert.alert("Select items", "Please select at least one item to checkout.");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmOrder = () => {
    const selectedIds = getSelectedIds();
    setShowConfirmModal(false);
    handlePlaceOrder(selectedIds);
  };

  const renderItem = ({ item }) => {
    const p = item.product || {};
    const isSelected = selectedItems[item.id];
    
    return (
      <TouchableOpacity 
        style={[styles.cardWrapper, isSelected && styles.cardSelected]}
        onPress={() => toggleSelectItem(item.id)}
        activeOpacity={0.9}
      >
        {/* Selection Indicator */}
        <View style={styles.selectionBadge}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          {p.image ? (
            <Image source={{ uri: p.image }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.name} numberOfLines={2}>{p.name}</Text>
          
          {p.vendor && (
            <View style={styles.vendorBadge}>
              <Text style={styles.vendorText} numberOfLines={1}>
                {p.vendor}
              </Text>
            </View>
          )}

          {p.description && (
            <Text style={styles.description} numberOfLines={2}>
              {p.description}
            </Text>
          )}

          <View style={styles.priceRow}>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.price}>Rs. {Number(p.price).toFixed(2)}</Text>
          </View>

          {/* Subtotal */}
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Subtotal:</Text>
            <Text style={styles.subtotalPrice}>
              Rs. {(Number(p.price) * Number(item.quantity)).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.chatBtn]}
            onPress={(e) => {
              e.stopPropagation();
              goToChat(p);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnText}>💬 Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.removeBtn]}
            onPress={(e) => {
              e.stopPropagation();
              removeItem(item.id);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnText}>🗑️ Remove</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const selectedCount = getSelectedIds().length;
  const totalAmount = getTotal();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>
          {userName ? `${userName}'s Cart` : "Shopping Cart"}
        </Text>
        {cart.length > 0 && (
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>{cart.length}</Text>
          </View>
        )}
      </View>

      {/* Empty State */}
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items to get started</Text>
        </View>
      ) : (
        <>
          {/* Selection Info Bar */}
          {selectedCount > 0 && (
            <View style={styles.selectionBar}>
              <Text style={styles.selectionText}>
                {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedItems({})}
                style={styles.clearSelectionBtn}
              >
                <Text style={styles.clearSelectionText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cart Items */}
          <FlatList
            data={cart}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Checkout Footer */}
      {cart.length > 0 && (
        <View style={styles.checkoutFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>Rs. {totalAmount.toFixed(2)}</Text>
            {selectedCount > 0 && (
              <Text style={styles.itemsSelectedText}>
                {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              globalStyles.button,
              styles.checkoutBtn,
              placing && styles.checkoutBtnDisabled
            ]}
            onPress={onCheckout}
            disabled={placing}
            activeOpacity={0.8}
          >
            <Text style={[globalStyles.buttonText, styles.checkoutBtnText]}>
              {placing ? "Processing..." : "Proceed to Checkout"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>✓</Text>
              <Text style={styles.modalTitle}>Confirm Your Order</Text>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalLabel}>Items Selected:</Text>
                <Text style={styles.modalValue}>{selectedCount}</Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalLabel}>Total Amount:</Text>
                <Text style={styles.modalValueHighlight}>
                  Rs. {totalAmount.toFixed(2)}
                </Text>
              </View>

              <Text style={styles.modalMessage}>
                Are you sure you want to place this order?
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmOrder}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Confirm Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7fdc9",
  },

  // Header Styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.5,
  },
  itemCountBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 36,
    alignItems: "center",
  },
  itemCountText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Selection Bar
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2E7D32",
  },
  selectionText: {
    color: "#1B5E20",
    fontSize: 14,
    fontWeight: "600",
  },
  clearSelectionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearSelectionText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // List Styles
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 200,
  },

  // Card Styles
  cardWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "#2E7D32",
    backgroundColor: "#F1F8F4",
  },

  // Selection Badge
  selectionBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#B0BEC5",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Image Styles
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#F5F5F5",
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
    backgroundColor: "#E0E0E0",
  },
  placeholderText: {
    color: "#9E9E9E",
    fontSize: 14,
    fontWeight: "500",
  },

  // Product Info
  productInfo: {
    marginBottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    lineHeight: 22,
  },
  vendorBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  vendorText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 8,
  },

  // Price Row
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  quantityBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32",
  },

  // Subtotal Row
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  subtotalLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  subtotalPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtn: {
    backgroundColor: "#1976D2",
  },
  removeBtn: {
    backgroundColor: "#DC2626",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
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
  },

  // Checkout Footer
  checkoutFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  totalSection: {
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: "#2E7D32",
    letterSpacing: 0.5,
  },
  itemsSelectedText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  checkoutBtn: {
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutBtnDisabled: {
    opacity: 0.6,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
  },
  modalBody: {
    marginBottom: 24,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  modalValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "700",
  },
  modalValueHighlight: {
    fontSize: 20,
    color: "#2E7D32",
    fontWeight: "800",
  },
  modalMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  confirmButton: {
    backgroundColor: "#2E7D32",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});