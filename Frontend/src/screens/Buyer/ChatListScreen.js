// src/screens/Buyer/ChatListScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getMyThreads } from "../../services/chat";

export default function ChatListScreen({ navigation }) {
  const [threads, setThreads] = useState([]);

  const pickDate = (t) => {
    // use lastMessageAt first; else fallback
    const d =
      t?.lastMessageAt ||
      t?.updatedAt ||
      t?.createdAt ||
      null;
    return d ? new Date(d).getTime() : 0;
  };

  // ✅ Keep only the latest thread per vendor/other user
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

      // choose newer thread
      const curTime = pickDate(t);
      const exTime = pickDate(existing);

      if (curTime > exTime) {
        // keep unread as OR so user sees if any unread exists with this vendor
        t.unread = Boolean(t.unread || existing.unread);
        map.set(otherId, t);
      } else {
        existing.unread = Boolean(existing.unread || t.unread);
        map.set(otherId, existing);
      }
    }

    // return sorted latest first
    return Array.from(map.values()).sort((a, b) => pickDate(b) - pickDate(a));
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const res = await getMyThreads();
          const raw = res?.threads || [];
          const unique = dedupeByOtherUser(raw);
          setThreads(unique);
        } catch (e) {
          setThreads([]);
        }
      })();
    }, [])
  );

  const renderItem = ({ item }) => {
    const other = item.otherUser || {};

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            threadId: item.id, // ✅ open existing newest thread for this vendor
            vendorName: other.name || "Vendor",
          })
        }
        activeOpacity={0.8}
      >
        <Image
          source={require("../../../assets/defaultProfile.png")}
          style={styles.avatar}
        />

        <View style={styles.chatInfo}>
          <Text style={styles.name}>{other.name || "Vendor"}</Text>

          <Text
            style={[styles.lastMessage, item.unread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {item.lastMessageText || "Say hi 👋"}
          </Text>
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
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "#777" }}>
            No chats yet
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  avatar: { width: 55, height: 55, borderRadius: 28, marginRight: 12 },
  chatInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold" },

  lastMessage: { color: "#666", marginTop: 2 },
  lastMessageUnread: { color: "#000", fontWeight: "800" }, // ✅ unread bold black
});
