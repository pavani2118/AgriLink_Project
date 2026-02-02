 
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getVendorOrders, confirmOrder, rejectOrder } from "../../services/order";

export default function NotificationsScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log("📥 Loading vendor orders...");

      const res = await getVendorOrders();

      const allOrders = res?.orders || [];
      const pendingOrders = allOrders.filter((o) => o.status === "PLACED");

      console.log("📊 Orders Summary:");
      console.log("  Total:", allOrders.length);
      console.log("  PLACED:", pendingOrders.length);
      console.log("  CONFIRMED:", allOrders.filter((o) => o.status === "CONFIRMED").length);
      console.log("  REJECTED:", allOrders.filter((o) => o.status === "REJECTED").length);

      setOrders(pendingOrders);
    } catch (e) {
      console.error("❌ Load orders error:", e?.message || e);
      Alert.alert("Error", e?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

   
  const runConfirm = async (orderId) => {
    console.log("🚀 CONFIRM API START:", orderId);

    if (!orderId) return;

    if (processingId) {
      Alert.alert("Please Wait", "Processing another order...");
      return;
    }

    try {
      setProcessingId(orderId);

      const response = await confirmOrder(orderId);
      console.log("✅ CONFIRM API DONE:", response);

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      Alert.alert("Success ✅", "Order confirmed! Stock updated.");
    } catch (e) {
      console.error("❌ CONFIRM API ERROR:", e?.message || e);
      Alert.alert("Error", e?.message || "Failed to confirm order");
      loadOrders();
    } finally {
      setProcessingId(null);
    }
  };

  const runReject = async (orderId) => {
    console.log("🚀 REJECT API START:", orderId);

    if (!orderId) return;

    if (processingId) {
      Alert.alert("Please Wait", "Processing another order...");
      return;
    }

    try {
      setProcessingId(orderId);

      const response = await rejectOrder(orderId);
      console.log("✅ REJECT API DONE:", response);

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      Alert.alert("Success ✅", "Order rejected.");
    } catch (e) {
      console.error("❌ REJECT API ERROR:", e?.message || e);
      Alert.alert("Error", e?.message || "Failed to reject order");
      loadOrders();
    } finally {
      setProcessingId(null);
    }
  };

  const renderOrderItem = ({ item }) => {
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.notificationCard}>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.orderTitle}>
            Order from {item.buyer?.name || "Unknown"}
          </Text>
          <Text style={[styles.statusBadge, { color: "#f97316" }]}>PENDING</Text>
        </View>

        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>

        <View style={styles.itemsContainer}>
          {(item.items || []).map((product, index) => (
            <View key={index} style={styles.productRow}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>📦</Text>
                </View>
              )}

              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDetails}>
                  Qty: {product.quantity} × Rs. {product.price}
                </Text>
              </View>

              <Text style={styles.productTotal}>
                Rs. {(product.quantity * product.price).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.totalText}>
          Total: Rs. {item.total?.toFixed(2) || "0.00"}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              (isProcessing || processingId !== null) && styles.disabledButton,
            ]}
            onPress={() => {
              console.log("👆 REJECT BUTTON PRESSED:", item.id);
              runReject(item.id);
            }}
            disabled={isProcessing || processingId !== null}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Reject</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.confirmButton,
              (isProcessing || processingId !== null) && styles.disabledButton,
            ]}
            onPress={() => {
              console.log("👆 CONFIRM BUTTON PRESSED:", item.id);
              runConfirm(item.id);
            }}
            disabled={isProcessing || processingId !== null}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Notifications</Text>

      {loading && orders.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No pending orders</Text>
              <Text style={styles.emptySubtext}>New orders will appear here</Text>
            </View>
          ) : null
        }
        refreshing={loading && orders.length > 0}
        onRefresh={loadOrders}
        contentContainerStyle={orders.length === 0 ? styles.emptyListContent : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DFF5E3",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1B4332",
    marginBottom: 20,
  },
  notificationCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingRight: 50,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  time: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  placeholderImage: {
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  productDetails: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16a34a",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B4332",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  confirmButton: {
    backgroundColor: "#22c55e",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: "center",
    fontSize: 14,
    color: "#9CA3AF",
  },
});
