import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
  RefreshControl,
  StatusBar,
  FlatList, // ✅ SAME AS SearchScreen
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getBuyerOrders } from "../../services/order";

const LIMIT = 20;

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [buyerId, setBuyerId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ prevent onEndReached calling many times
  const [momentumLock, setMomentumLock] = useState(true);

  const loadOrders = async ({ reset = false } = {}) => {
    try {
      setError(null);

      if (!reset && (loading || loadingMore || refreshing || !hasMore)) return;

      const nextPage = reset ? 1 : page + 1;

      if (reset) {
        setLoading(true);
        setPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getBuyerOrders({ page: nextPage, limit: LIMIT });
      const newOrders = Array.isArray(response?.orders) ? response.orders : [];
      const filteredOrders = buyerId
        ? newOrders.filter((o) => String(o.buyerId || "") === String(buyerId))
        : newOrders;

      setTotalCount(
        Number(response?.total || 0) || filteredOrders.length
      );

      setOrders((prev) => {
        if (reset) return filteredOrders;

        const seen = new Set(prev.map((o) => o.id));
        const merged = [...prev];
        for (const o of filteredOrders) if (!seen.has(o.id)) merged.push(o);
        return merged;
      });

      const more =
        typeof response?.hasMore === "boolean"
          ? response.hasMore
          : filteredOrders.length === LIMIT;

      setHasMore(more);
      setPage(nextPage);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
      Alert.alert("Error", "Failed to load order history");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders({ reset: true });
    }, [buyerId])
  );

  useEffect(() => {
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setBuyerId(user?.id || user?._id || "");
        }
      } catch {}
    })();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    return loadOrders({ reset: true });
  }, []);

  const onEndReached = () => {
    if (momentumLock) return;
    if (hasMore && !loadingMore) loadOrders({ reset: false });
    setMomentumLock(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PLACED":
        return "#B45309";
      case "CONFIRMED":
        return "#047857";
      case "DELIVERED":
        return "#1D4ED8";
      case "REJECTED":
      case "CANCELLED":
        return "#B91C1C";
      default:
        return "#6B7280";
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toUpperCase()) {
      case "PLACED":
        return "#FEF3C7";
      case "CONFIRMED":
        return "#D1FAE5";
      case "DELIVERED":
        return "#DBEAFE";
      case "REJECTED":
      case "CANCELLED":
        return "#FEE2E2";
      default:
        return "#F3F4F6";
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <View style={styles.orderIdRow}>
            <Ionicons name="receipt-outline" size={14} color="#6B7280" />
            <Text style={styles.orderIdText}>#{String(item.id).slice(0, 8)}</Text>
          </View>

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {String(item.status || "").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {(item.items || []).map((product, idx) => (
          <View
            key={`${item.id}-${idx}`}
            style={[styles.itemRow, idx === (item.items?.length || 0) - 1 && { marginBottom: 0 }]}
          >
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={18} color="#D1D5DB" />
              </View>
            )}

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.itemQty}>
                Qty: {product.quantity} × Rs. {Number(product.price).toFixed(2)}
              </Text>
            </View>

            <Text style={styles.itemTotal}>
              Rs. {(Number(product.quantity) * Number(product.price)).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>Rs. {Number(item.total).toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
          <Text style={styles.emptyTitle}>Failed to Load</Text>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={() => loadOrders({ reset: true })}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cart-outline" size={72} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => navigation.goBack()}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 18 }} />;
    return (
      <View style={{ paddingVertical: 14 }}>
        <ActivityIndicator size="small" color="#2E7D32" />
        <Text style={styles.footerText}>Loading more orders...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />

      {/* ✅ Header outside list (like your screenshot) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {(totalCount || orders.length)} {((totalCount || orders.length) === 1) ? "Order" : "Orders"}
          </Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          orders.length === 0 ? { flexGrow: 1 } : null,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onMomentumScrollBegin={() => setMomentumLock(false)}
        onEndReached={onEndReached}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2E7D32"]}
            tintColor="#2E7D32"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },

  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    paddingTop: 34,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  countRow: { paddingHorizontal: 16, paddingBottom: 8 },
  countText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },

  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18 },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  orderInfo: { flex: 1 },
  orderIdRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  orderIdText: { fontSize: 13, fontWeight: "800", color: "#111827" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 12, color: "#6B7280" },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginLeft: 8 },
  statusText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.4 },

  itemsContainer: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFFFF" },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },

  itemImage: {
    width: 46,
    height: 46,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#F3F4F6",
  },
  placeholderImage: { justifyContent: "center", alignItems: "center" },

  itemInfo: { flex: 1, marginRight: 8 },
  itemName: { fontSize: 14, fontWeight: "800", color: "#111827", marginBottom: 2 },
  itemQty: { fontSize: 12, color: "#6B7280" },

  itemTotal: { fontSize: 13, fontWeight: "900", color: "#2E7D32" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ECFDF5",
    borderTopWidth: 1,
    borderTopColor: "#D1FAE5",
  },
  totalLabel: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  totalAmount: { fontSize: 15, fontWeight: "900", color: "#065F46" },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 50,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#374151", marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 18 },
  loadingText: { fontSize: 13, color: "#6B7280", marginTop: 12 },
  errorText: { fontSize: 13, color: "#EF4444", textAlign: "center", marginBottom: 18 },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  shopButton: { backgroundColor: "#2E7D32", paddingHorizontal: 26, paddingVertical: 12, borderRadius: 12 },
  shopButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  footerText: { textAlign: "center", marginTop: 6, color: "#6B7280", fontSize: 12 },
});
