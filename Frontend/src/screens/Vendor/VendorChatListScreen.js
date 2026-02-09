import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { 
  FlatList, 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  RefreshControl 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMyThreads } from "../../services/chat";

const pickDate = (t) => {
  const d = t?.lastMessageAt || t?.updatedAt || t?.createdAt || null;
  return d ? new Date(d).getTime() : 0;
};

const dedupeByOtherUser = (list) => {
  const map = new Map();

  for (const t of list || []) {
    const otherId = t?.otherUser?.id;
    if (!otherId) continue;

    const existing = map.get(otherId);

    if (!existing) {
      map.set(otherId, t);
      continue;
    }

    const curTime = pickDate(t);
    const exTime = pickDate(existing);

    if (curTime > exTime) {
      t.unread = Boolean(t.unread || existing.unread);
      map.set(otherId, t);
    } else {
      existing.unread = Boolean(existing.unread || t.unread);
      map.set(otherId, existing);
    }
  }

  return Array.from(map.values()).sort((a, b) => pickDate(b) - pickDate(a));
};

export default function VendorChatListScreen({ navigation }) {
  const [threads, setThreads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadThreads = async () => {
    try {
      const res = await getMyThreads();
      const raw = res?.threads || [];
      const unique = dedupeByOtherUser(raw);
      setThreads(unique);
    } catch (e) {
      setThreads([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadThreads();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadThreads();
    setRefreshing(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  };

  const renderItem = ({ item }) => {
    const other = item.otherUser || {};
    const avatarUri = other.image || (item.product && item.product.image) || null;
    const timestamp = pickDate(item);

    return (
      <TouchableOpacity
        style={[styles.chatItem, item.unread && styles.chatItemUnread]}
        onPress={() =>
          navigation.navigate("ChatScreenVendor", {
            threadId: item.id,
            title: other.name || "Buyer",
          })
        }
        activeOpacity={0.7}
      >
        {/* Avatar with Unread Indicator */}
        <View style={styles.avatarContainer}>
          <Image
            source={avatarUri ? { uri: avatarUri } : require("../../../assets/defaultProfile.png")}
            style={styles.avatar}
          />
          {item.unread && <View style={styles.unreadDot} />}
        </View>

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {other.name || "Buyer"}
            </Text>
            <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
          </View>

          <Text
            style={[styles.lastMessage, item.unread && styles.lastMessageUnread]}
            numberOfLines={2}
          >
            {item.lastMessageText || "Say hi 👋"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chat List */}
      <FlatList
        data={threads}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={threads.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2E7D32"
            colors={["#2E7D32"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptySubtitle}>
              Messages from buyers will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  // List Styles
  listContent: {
    paddingTop: 8,
  },

  // Chat Item Styles
  chatItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chatItemUnread: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BFDBFE",
  },

  // Avatar Styles
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  unreadDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#16A34A",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // Chat Info
  chatInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  lastMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: "#1F2937",
    fontWeight: "600",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#374151",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
  },
});