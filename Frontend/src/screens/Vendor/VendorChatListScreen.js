import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMyThreads } from "../../services/chat";

const dedupeByOtherUser = (threads = []) => {
  const map = {};
  for (const t of threads) {
    const otherId = t?.otherUser?.id;
    if (!otherId) continue;

    const tTime = new Date(t?.lastMessageAt || 0).getTime();
    const savedTime = new Date(map[otherId]?.lastMessageAt || 0).getTime();

    if (!map[otherId] || tTime > savedTime) map[otherId] = t;
  }
  return Object.values(map).sort((a, b) => {
    const ta = new Date(a?.lastMessageAt || 0).getTime();
    const tb = new Date(b?.lastMessageAt || 0).getTime();
    return tb - ta;
  });
};

export default function VendorChatListScreen({ navigation }) {
  const [threads, setThreads] = useState([]);

  const loadThreads = async () => {
    try {
      const res = await getMyThreads();
      const raw = res?.threads || [];
      setThreads(dedupeByOtherUser(raw));
    } catch {
      setThreads([]);
    }
  };

  useFocusEffect(useCallback(() => { loadThreads(); }, []));

  const renderItem = ({ item }) => {
    const name = item?.otherUser?.name || "Buyer";
    const threadId = item?.id;
    const lastText = item?.lastMessageText || "Tap to chat";
    const unread = item?.unread;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate("ChatScreenVendor", { threadId, title: name })}
      >
        <Image source={require("../../../assets/defaultProfile.png")} style={styles.avatar} />
        <View style={styles.chatInfo}>
          <View style={styles.row}>
            <Text style={styles.name}>{name}</Text>
            {unread ? <View style={styles.unreadDot} /> : null}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>{lastText}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#777" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={threads}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 40, color: "#777" }}>No chats yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatItem: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderColor: "#eee" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  chatInfo: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 16, fontWeight: "bold" },
  lastMessage: { color: "#666", marginTop: 2 },
  unreadDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: "#22c55e" },
});
