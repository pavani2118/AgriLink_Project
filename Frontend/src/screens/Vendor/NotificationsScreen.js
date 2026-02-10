  
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
import { openChatByProduct, sendMessage } from "../../services/chat";
import { Ionicons } from "@expo/vector-icons";

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

  // UPDATED: after confirm, auto-send message to buyer per product thread
  const runConfirm = async (orderId, orderItem = null) => {
    console.log("🚀 CONFIRM API START:", orderId);

    if (!orderId) return;

    if (processingId) {
      Alert.alert("Please Wait", "Processing another order...");
      return;
    }

    try {
      setProcessingId(orderId);

      // 1) Confirm order in backend
      const response = await confirmOrder(orderId);
      console.log("✅ CONFIRM API DONE:", response);

      // 2) Remove from pending list immediately
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      // 3) Auto-send message to THIS order's buyer only (per product thread)
      let notifiedCount = 0;

      try {
        const buyerId = orderItem?.buyer?.id;
        const productIds = (orderItem?.items || [])
          .map((x) => x?.productId)
          .filter(Boolean);

        const uniqueProductIds = Array.from(new Set(productIds));

        if (buyerId && uniqueProductIds.length > 0) {
          for (const productId of uniqueProductIds) {
            const openRes = await openChatByProduct(productId, buyerId);

            // support both possible response shapes
            const threadId = openRes?.thread?.id || openRes?.threadId;

            if (threadId) {
              await sendMessage(threadId, `Order ${orderId} confirmed by vendor`);
              notifiedCount += 1;
            }
          }
        }
      } catch (chatErr) {
        console.warn("Chat send failed:", chatErr?.message || chatErr);
      }

      // 4) One success popup only
      Alert.alert(
        "Success ✅",
        notifiedCount > 0
          ? "Order confirmed & message sent to buyer."
          : "Order confirmed, but buyer message not sent."
      );
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
        <View style={styles.pendingIndicator} />

        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={40} color="#2E7D32" />
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>
                {item.buyer?.name || "Unknown Customer"}
              </Text>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.timeText}>
                  {new Date(item.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>PENDING</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.itemsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="basket-outline" size={18} color="#1B4332" />
            <Text style={styles.sectionTitle}>Order Items</Text>
          </View>

          {(item.items || []).map((product, index) => (
            <View key={index} style={styles.productRow}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                </View>
              )}

              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
                  <Text style={styles.productPrice}>
                    @ Rs. {Number(product.price || 0).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.productTotalContainer}>
                <Text style={styles.productTotal}>
                  Rs. {(Number(product.quantity || 0) * Number(product.price || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalAmount}>
              Rs. {Number(item.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              (isProcessing || processingId !== null) && styles.disabledButton,
            ]}
            onPress={() => runReject(item.id)}
            disabled={isProcessing || processingId !== null}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.confirmButton,
              (isProcessing || processingId !== null) && styles.disabledButton,
            ]}
            onPress={() => runConfirm(item.id, item)}
            disabled={isProcessing || processingId !== null}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Confirm Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="notifications" size={28} color="#1B4332" />
          <Text style={styles.title}>Order Notifications</Text>
        </View>
        {orders.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{orders.length}</Text>
          </View>
        )}
      </View>

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
              <View style={styles.emptyIconContainer}>
                <Ionicons name="notifications-off-outline" size={80} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtext}>
                No pending orders at the moment.{"\n"}New orders will appear here.
              </Text>
            </View>
          ) : null
        }
        refreshing={loading && orders.length > 0}
        onRefresh={loadOrders}
        contentContainerStyle={orders.length === 0 ? styles.emptyListContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#1B4332" },

  badge: {
    backgroundColor: "#EF4444",
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  listContent: { padding: 16 },

  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pendingIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#F59E0B",
    zIndex: 1,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingLeft: 20,
  },
  customerInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarContainer: { marginRight: 12 },
  customerDetails: { flex: 1 },
  customerName: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 4 },

  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontSize: 13, color: "#6B7280" },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" },
  statusText: { fontSize: 11, fontWeight: "700", color: "#D97706", letterSpacing: 0.5 },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 16 },

  itemsSection: { padding: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B4332",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 8,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#E5E7EB",
  },
  placeholderImage: { justifyContent: "center", alignItems: "center" },

  productInfo: { flex: 1, marginRight: 8 },
  productName: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 4 },
  productMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  productQuantity: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  productPrice: { fontSize: 13, color: "#6B7280" },

  productTotalContainer: { alignItems: "flex-end" },
  productTotal: { fontSize: 15, fontWeight: "700", color: "#16A34A" },

  totalSection: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 15, fontWeight: "600", color: "#4B5563" },
  totalAmount: { fontSize: 20, fontWeight: "800", color: "#1B4332" },

  actionSection: { flexDirection: "row", padding: 16, gap: 12 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    minHeight: 50,
  },
  confirmButton: {
    backgroundColor: "#16A34A",
    shadowColor: "#16A34A",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: { opacity: 0.5 },

  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 15, color: "#6B7280", fontWeight: "500" },

  emptyListContent: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: { marginBottom: 24, opacity: 0.6 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#374151", marginBottom: 8 },
  emptySubtext: { textAlign: "center", fontSize: 15, color: "#9CA3AF", lineHeight: 22 },
});
