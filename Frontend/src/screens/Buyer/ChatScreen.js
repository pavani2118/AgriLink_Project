 import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  ActivityIndicator
} from "react-native";
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

  
  useEffect(() => {
    if (!profile?.id && typeof refreshProfile === "function") {
      refreshProfile().catch(() => {});
    }
  }, [profile?.id]);

   
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

       
      markThreadSeen(threadId).catch(() => {});

      const msgRes = await getThreadMessages(threadId);
      const list = (msgRes?.messages || []).map((m) => ({
        id: String(m.id || m._id),
        text: m.text,
        senderId: m.senderId,  
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >


      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          )
        }
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={loading ? "Loading..." : "Type a message..."}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            editable={!loading}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]} 
            onPress={onSend} 
            disabled={!input.trim() || loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={input.trim() ? "#FFFFFF" : "#9CA3AF"} 
              />
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
    backgroundColor: "#F8F9FA",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },
  headerSpacer: {
    width: 40,
  },

  // Messages List
  messagesList: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
  },

  // Input Container
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
});