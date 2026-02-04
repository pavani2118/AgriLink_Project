import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { login } from "../../services/auth";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Please enter email and password");
        return;
      }

      console.log("=== LOGIN ATTEMPT ===");
      console.log("Email:", email);

      const data = await login({ email, password });
      
      console.log("Login response:", data);
      console.log("Token:", data.token);
      console.log("User:", data.user);

      const { token, user } = data;


      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", user.role);

      const profileData = {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
        role: user.role,
        district: user.district || "",
        shopName: user.shopName || "",
      };

      console.log("Saving profile data:", profileData);

      await AsyncStorage.setItem("profile", JSON.stringify(profileData));
      await AsyncStorage.setItem("user", JSON.stringify(profileData));

      console.log("Navigation to:", user.role === "vendor" ? "Vendor" : "Buyer");

      navigation.replace(user.role === "vendor" ? "Vendor" : "Buyer");
    } catch (err) {
      console.error("=== LOGIN ERROR ===");
      console.error(err);
      Alert.alert("Login Failed", err.message || "Login failed");
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/background.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay} />

      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <Image
            source={require("../../../assets/agrilinklogopng.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>AgriLink Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Username (not used)"
            placeholderTextColor="#777"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.registerText}>
            Don't have an account?{" "}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
            >
              Register
            </Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.7)" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  card: { width: 320, backgroundColor: "rgba(255,255,255,0.85)", padding: 22, borderRadius: 14 },
  logo: { width: 80, height: 80, alignSelf: "center", marginBottom: 10, resizeMode: "contain" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  input: { backgroundColor: "#F1F5FF", borderRadius: 8, padding: 10, marginBottom: 10 },
  loginBtn: { backgroundColor: "#2E7D32", paddingVertical: 12, borderRadius: 8, marginBottom: 8 },
  loginText: { color: "#FFF", fontWeight: "bold", textAlign: "center" },
  registerText: { textAlign: "center", color: "#666", marginTop: 4 },
  registerLink: { color: "#2E7D32", fontWeight: "bold" },
});
