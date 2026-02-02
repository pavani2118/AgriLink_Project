 
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getThreadMessages, markThreadSeen, sendMessage } from "../../services/chat";
import { getMyProfile } from "../../services/user";

function Bubble({ text, isMine }) {
  return (
    <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  );
}

export default function ChatScreenVendor({ route, navigation }) {
  const { threadId, title } = route.params || {};
  const [myId, setMyId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
 
  useEffect(() => {
    navigation.setOptions({ title: title || "Chat" });
  }, [title, navigation]);

  const loadMe = async () => {
    try {
      const me = await getMyProfile();
      const id = me?.user?.id || me?.id;
      setMyId(id || null);
    } catch {
      setMyId(null);
    }
  };

  const loadMessages = async () => {
    if (!threadId) return;
    try {
      const res = await getThreadMessages(threadId);
      setMessages(res?.messages || []);
    } catch {
      setMessages([]);
    }
  };

  const seenNow = async () => {
    if (!threadId) return;
    try {
      await markThreadSeen(threadId);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      loadMe();
      loadMessages();
      seenNow();
    }, [threadId])
  );

  const onSend = async () => {
    const t = text.trim();
    if (!t || !threadId || sending) return;

    try {
      setSending(true);

      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: tempId, text: t, senderId: myId || "me", createdAt: new Date().toISOString() },
      ]);
      setText("");

      const res = await sendMessage(threadId, t);
      const real = res?.msg;

      if (real?.id) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, ...real } : m)));
      }

      await seenNow();
      listRef.current?.scrollToEnd?.({ animated: true });
    } catch {
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <Bubble text={item.text} isMine={String(item.senderId) === String(myId)} />
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={onSend} disabled={sending}>
          <Text style={styles.sendText}>{sending ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  bubble: { padding: 10, marginVertical: 6, borderRadius: 10, maxWidth: "78%" },
  mine: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  theirs: { backgroundColor: "#f0f0f0", alignSelf: "flex-start" },
  bubbleText: { fontSize: 16 },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendText: { color: "#fff", fontWeight: "bold" },
});
