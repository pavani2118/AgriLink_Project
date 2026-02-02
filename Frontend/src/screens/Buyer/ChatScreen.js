import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ChatBubble from "../../components/ChatBubble";
import globalStyles from "../../styles/globalStyles";
import { ProfileContext } from "../../context/ProfileContext";
import { openChatByProduct, getThreadMessages, sendMessage, markThreadSeen } from "../../services/chat";

export default function ChatScreen({ route, navigation }) {
  const { profile, refreshProfile } = useContext(ProfileContext);

  const vendorName = route?.params?.vendorName || route?.params?.productName || "Vendor";
  const productId = route?.params?.productId;
  const threadIdFromList = route?.params?.threadId;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(threadIdFromList || null);
  const [loading, setLoading] = useState(false);

  // ✅ ensure profile has id (important after app restart)
  useEffect(() => {
    if (!profile?.id && typeof refreshProfile === "function") {
      refreshProfile().catch(() => {});
    }
  }, [profile?.id]);

  // ✅ open/create thread if coming from product (no threadId)
  useEffect(() => {
    if (threadIdFromList) return;
    if (!productId || !profile?.id) return;

    (async () => {
      try {
        setLoading(true);
        const open = await openChatByProduct(productId);
        const tId = open?.thread?.id || open?.thread?._id;
        if (tId) setThreadId(tId);
      } catch (e) {
        console.log("Chat open error:", e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, profile?.id, threadIdFromList]);

  const loadMessages = async () => {
    if (!threadId) return;
    try {
      setLoading(true);

      // ✅ mark seen so list stops bold
      markThreadSeen(threadId).catch(() => {});

      const msgRes = await getThreadMessages(threadId);
      const list = (msgRes?.messages || []).map((m) => ({
        id: String(m.id || m._id),
        text: m.text,
        senderId: m.senderId, // ✅ keep backend field
        createdAt: m.createdAt,
      }));

      setMessages(list);
    } catch (e) {
      console.log("Chat load error:", e?.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [threadId])
  );

  const onSend = async () => {
    const text = input.trim();
    if (!text || !threadId) return;

    setInput("");

    // ✅ optimistic message with senderId (matches ChatBubble)
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, text, senderId: profile?.id, createdAt: new Date().toISOString() },
    ]);

    try {
      await sendMessage(threadId, text);
      await loadMessages(); // ✅ refresh from DB
    } catch (e) {
      setMessages((prev) => prev.filter((x) => x.id !== tempId));
      console.log("Send error:", e?.message);
    }
  };

  return (
    <View style={[styles.screen, globalStyles.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vendorName}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ChatBubble message={item} />}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      <View style={styles.inputBox}>
        <TextInput
          style={{ flex: 1, paddingVertical: 8 }}
          placeholder={loading ? "Loading..." : "Type a message..."}
          value={input}
          onChangeText={setInput}
          editable={!loading}
        />
        <TouchableOpacity onPress={onSend} disabled={loading}>
          <Ionicons name="send" size={28} color="#2E7D32" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E9F0D6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#DDD",
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10, color: "#2E7D32" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFF",
  },
});
