import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import globalStyles from "../../styles/globalStyles";
import { ProfileContext } from "../../context/ProfileContext";
import { getMyCart, removeCartItem } from "../../services/cart";
import { placeOrderFromCart } from "../../services/order";

export default function CartScreen({ navigation }) {
  const { profile, refreshProfile } = useContext(ProfileContext);

  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [userName, setUserName] = useState("");
  const [placing, setPlacing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    
    if (profile?.name) setUserName(profile.name);

     
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
    try {
      await removeCartItem(cartItemId);

      const updated = cart.filter((c) => c.id !== String(cartItemId));
      setCart(updated);

      const updatedSelected = { ...selectedItems };
      delete updatedSelected[String(cartItemId)];
      setSelectedItems(updatedSelected);
    } catch (e) {
      Alert.alert("Error", e.message || "Remove failed");
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

      await placeOrderFromCart(selectedIds);

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
    return (
      <View style={styles.cardWrapper}>
        {p.image ? <Image source={{ uri: p.image }} style={styles.productImage} /> : null}

        <Text style={styles.name}>{p.name}</Text>
        {p.description ? <Text style={styles.description}>{p.description}</Text> : null}

        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        <Text style={styles.price}>Rs. {p.price}</Text>

        <TouchableOpacity
          style={[
            styles.checkbox,
            { backgroundColor: selectedItems[item.id] ? "#2E7D32" : "#FFF" },
          ]}
          onPress={() => toggleSelectItem(item.id)}
        >
          {selectedItems[item.id] ? <Text style={styles.checkboxText}>✔</Text> : null}
        </TouchableOpacity>
        <Text style={{ marginLeft: 8 }}>Select</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#1976D2" }]}
            onPress={() => goToChat(p)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#d32f2f" }]}
            onPress={() => removeItem(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {userName ? `${userName}'s Shopping Cart` : "My Shopping Cart"}
      </Text>

      {cart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {cart.length > 0 ? (
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Total Amount</Text>
          <Text style={styles.totalPrice}>Rs. {getTotal()}</Text>

          <TouchableOpacity style={globalStyles.button} onPress={onCheckout} disabled={placing}>
            <Text style={globalStyles.buttonText}>{placing ? "Processing..." : "Checkout"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Order</Text>
            <Text style={styles.modalMessage}>Are you sure you want to place this order?</Text>
            <Text style={styles.modalTotal}>Total: Rs. {getTotal()}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmOrder}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9F0D6", padding: 12 },
  header: { fontSize: 26, fontWeight: "bold", color: "#2E7D32", marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 60, color: "#777" },

  cardWrapper: {
    flex: 1,
    maxWidth: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    margin: 6,
    elevation: 3,
  },
  productImage: { width: "100%", height: 100, borderRadius: 8, marginBottom: 6 },
  name: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  description: { fontSize: 12, color: "#4b5563" },
  quantity: { fontSize: 12, fontWeight: "500", color: "#16a34a" },
  price: { fontSize: 14, fontWeight: "bold", color: "#2E7D32", marginBottom: 6 },

  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  button: { flex: 1, paddingVertical: 6, borderRadius: 6, alignItems: "center", marginHorizontal: 2 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },

  totalBox: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#DDD",
  },
  totalText: { fontSize: 16, color: "#555" },
  totalPrice: { fontSize: 22, fontWeight: "bold", color: "#2E7D32", marginBottom: 12 },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
  },
  checkboxText: { color: "#FFF", fontWeight: "bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#FFF", borderRadius: 12, padding: 24, width: "80%", maxWidth: 400, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32", marginBottom: 12, textAlign: "center" },
  modalMessage: { fontSize: 16, color: "#333", marginBottom: 8, textAlign: "center" },
  modalTotal: { fontSize: 18, fontWeight: "bold", color: "#2E7D32", marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  cancelButton: { backgroundColor: "#9E9E9E" },
  confirmButton: { backgroundColor: "#2E7D32" },
  modalButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
