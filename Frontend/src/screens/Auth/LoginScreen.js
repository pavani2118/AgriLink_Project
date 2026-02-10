import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
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

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centerContainer}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/agrilinklogo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>AgriLink Login</Text>
          <Text style={styles.subtitle}>Welcome back! Please login to continue</Text>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Username "
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <Text style={styles.registerText}>
            Don't have an account?{" "}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
            >
              Register
            </Text>
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    width: "100%", 
    height: "100%" 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(0,0,0,0.7)" 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 24 
  },
  card: { 
    width: "100%", 
    maxWidth: 400,
    backgroundColor: "rgba(255,255,255,0.96)", 
    padding: 32, 
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  
  // Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: { 
    width: 90, 
    height: 90, 
    resizeMode: "contain" 
  },
  
  // Title
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    textAlign: "center", 
    marginBottom: 8,
    color: "#1B5E20",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  
  // Input
  inputContainer: {
    marginBottom: 18,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: { 
    flex: 1,
    backgroundColor: "transparent", 
    padding: 14, 
    fontSize: 15,
    color: "#333",
  },
  
  // Button
  loginBtn: { 
    backgroundColor: "#2E7D32", 
    paddingVertical: 16, 
    borderRadius: 12, 
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginText: { 
    color: "#FFF", 
    fontWeight: "700", 
    textAlign: "center",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  
  // Register Link
  registerText: { 
    textAlign: "center", 
    color: "#666", 
    fontSize: 14,
  },
  registerLink: { 
    color: "#2E7D32", 
    fontWeight: "700" 
  },
});