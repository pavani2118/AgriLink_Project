import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ProfileContext } from "../context/ProfileContext";

export default function ChatBubble({ message }) {
  const { profile } = useContext(ProfileContext);

  
  const hasSenderId = message?.senderId !== undefined && message?.senderId !== null;

  const isMine = hasSenderId
    ? String(message.senderId) === String(profile?.id)
    : message?.sender === "buyer"; 

  return (
    <View style={[styles.bubble, isMine ? styles.sender : styles.receiver]}>
      <Text style={styles.text}>{message?.text || ""}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { padding: 10, marginVertical: 5, borderRadius: 8, maxWidth: "70%" },
  sender: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  receiver: { backgroundColor: "#f0f0f0", alignSelf: "flex-start" },
  text: { fontSize: 16 },
});

