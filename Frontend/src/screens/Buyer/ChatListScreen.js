 import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMyThreads } from "../../services/chat";

export default function ChatListScreen({ navigation }) {
  const [threads, setThreads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const pickDate = (t) => {
    
    const d =
      t?.lastMessageAt ||
      t?.updatedAt ||
      t?.createdAt ||
      null;
    return d ? new Date(d).getTime() : 0;
  };

   
  const dedupeByOtherUser = (list) => {
    const map = new Map(); // key = otherUserId

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
        style={[styles.chatItem]}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            threadId: item.id,  
            vendorName: other.name || "Vendor",
          })
        }
        activeOpacity={0.7}
      >
        
        <View style={styles.avatarContainer}>
          <Image
            source={avatarUri ? { uri: avatarUri } : require("../../../assets/defaultProfile.png")}
            style={styles.avatar}
          />
          
        </View>

       
        <View style={styles.chatInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {other.name || "Vendor"}
            </Text>
            <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, item.unread && styles.lastMessageUnread]}
              numberOfLines={2}
            >
              {item.lastMessageText || "Say hi 👋"}
            </Text>
            
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
     
 
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
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptySubtitle}>Start a conversation with vendors</Text>
          </View>
        }
      />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
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
    backgroundColor: "#2E7D32",
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

  // Message Row
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: "#1F2937",
    fontWeight: "600",
  },

  // Unread Badge
  unreadBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
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
    textAlign: "center",
  },
});