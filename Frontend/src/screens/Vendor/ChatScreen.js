 
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getThreadMessages, markThreadSeen, sendMessage } from "../../services/chat";
import { getMyProfile } from "../../services/user";

function MessageBubble({ text, isMine, timestamp }) {
  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={[styles.messageContainer, isMine && styles.messageContainerMine]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{text}</Text>
        {timestamp && (
          <Text style={[styles.timestamp, isMine && styles.timestampMine]}>
            {formatTime(timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function ChatScreenVendor({ route, navigation }) {
  const { threadId, title } = route.params || {};
  const [myId, setMyId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

   
  useEffect(() => {
    navigation.setOptions({ 
      title: title || "Chat",
      headerStyle: {
        backgroundColor: "#FFFFFF",
      },
      headerTintColor: "#1F2937",
      headerTitleStyle: {
        fontWeight: "700",
      },
    });
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
      setLoading(true);
      const res = await getThreadMessages(threadId);
      setMessages(res?.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
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
      const tempMsg = {
        id: tempId,
        text: t,
        senderId: myId || "me",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMsg]);
      setText("");

      
      setTimeout(() => {
        listRef.current?.scrollToEnd?.({ animated: true });
      }, 100);

      const res = await sendMessage(threadId, t);
      const real = res?.msg;

      if (real?.id) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, ...real } : m)));
      }

      await seenNow();
    } catch (error) {
      console.error("Send message error:", error);
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => (
    <MessageBubble
      text={item.text}
      isMine={String(item.senderId) === String(myId)}
      timestamp={item.createdAt}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.emptyText}>Loading messages...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySubtitle}>Start the conversation!</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.messagesListEmpty,
        ]}
        renderItem={renderMessage}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            listRef.current?.scrollToEnd?.({ animated: true });
          }
        }}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            multiline
            maxLength={1000}
            editable={!sending}
          />

          <TouchableOpacity
            style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
            onPress={onSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Messages List
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messagesListEmpty: {
    justifyContent: "center",
  },

  // Message Container
  messageContainer: {
    marginVertical: 4,
    alignItems: "flex-start",
  },
  messageContainerMine: {
    alignItems: "flex-end",
  },

  // Bubble Styles
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleTheirs: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bubbleMine: {
    backgroundColor: "#16A34A",
    borderBottomRightRadius: 4,
  },

  // Bubble Text
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#1F2937",
  },
  bubbleTextMine: {
    color: "#FFFFFF",
  },

  // Timestamp
  timestamp: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  timestampMine: {
    color: "#D1FAE5",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },

  // Input Container
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // Send Button
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
  },
});