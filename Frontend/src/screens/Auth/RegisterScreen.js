import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import { 
  Animated,
  Dimensions, 
  Image, 
  ImageBackground, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from "react-native";
import { register } from "../../services/auth";

const { width, height } = Dimensions.get("window");

const districts = [
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle",
  "Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle",
  "Kilinochchi","Kurunegala","Mannar","Matale","Matara","Monaragala",
  "Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura",
  "Trincomalee","Vavuniya"
];

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [district, setDistrict] = useState(districts[0]);
  const [shopName, setShopName] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (role === "vendor" && !shopName) {
      alert("Please enter Shop Name");
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        role,
        district: role === "vendor" ? district : "",
        shopName: role === "vendor" ? shopName : "",
      };

      const res = await register(payload);

      if (res?.token) await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("role", res?.user?.role || role);

      alert("Registered successfully!");
      navigation.navigate("Login");
    } catch (err) {
      alert(err.message || "Register failed");
    }
  };

  return (
    <ImageBackground 
      source={require("../../../assets/background.jpg")} 
      style={styles.background}
    >
      <View style={styles.overlay} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require("../../../assets/agrilinklogo.png")} 
                style={styles.logo} 
              />
            </View>
            
            <Text style={styles.title}>AgriLink Register</Text>
            <Text style={styles.subtitle}>Create your account to get started</Text>

            {/* Role Selection */}
            <Text style={styles.roleLabel}>I am a</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity 
                style={[styles.roleButton, role === "buyer" && styles.roleButtonActive]} 
                onPress={() => setRole("buyer")}
                activeOpacity={0.7}
              >
                <View style={[styles.radioCircle, role === "buyer" && styles.radioSelected]}>
                  {role === "buyer" && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.roleEmoji}>🛒</Text>
                <Text style={[styles.radioText, role === "buyer" && styles.radioTextActive]}>
                  Buyer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleButton, role === "vendor" && styles.roleButtonActive]} 
                onPress={() => setRole("vendor")}
                activeOpacity={0.7}
              >
                <View style={[styles.radioCircle, role === "vendor" && styles.radioSelected]}>
                  {role === "vendor" && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.roleEmoji}>🌾</Text>
                <Text style={[styles.radioText, role === "vendor" && styles.radioTextActive]}>
                  Vendor
                </Text>
              </TouchableOpacity>
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Vendor Fields */}
            {role === "vendor" && (
              <>
                {/* District Picker */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>District</Text>
                  <View style={styles.pickerWrapper}>
                    <Text style={styles.inputIcon}>📍</Text>
                    <Picker
                      selectedValue={district}
                      onValueChange={(itemValue) => setDistrict(itemValue)}
                      style={styles.picker}
                    >
                      {districts.map((d) => (
                        <Picker.Item key={d} label={d} value={d} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Shop Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Shop Name</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🏪</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your shop name"
                      placeholderTextColor="#999"
                      value={shopName}
                      onChangeText={setShopName}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={styles.registerBtn} 
              onPress={handleRegister}
              activeOpacity={0.85}
            >
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text 
                style={styles.loginLink} 
                onPress={() => navigation.navigate("Login")}
              >
                Login
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(0,0,0,0.65)" 
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: "auto",
  },
  
  // Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  logo: { 
    width: 60, 
    height: 60, 
    resizeMode: "contain" 
  },
  
  // Title
  title: { 
    fontSize: 22, 
    fontWeight: "800", 
    textAlign: "center", 
    marginBottom: 4,
    color: "#1B5E20",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },

  // Role Selection
  roleLabel: { 
    fontWeight: "600", 
    marginBottom: 10,
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  roleRow: { 
    flexDirection: "row", 
    gap: 10, 
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    gap: 6,
  },
  roleButtonActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#2E7D32",
  },
  radioCircle: { 
    height: 20, 
    width: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: "#BDBDBD",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { 
    borderColor: "#2E7D32",
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
  },
  roleEmoji: {
    fontSize: 22,
  },
  radioText: { 
    fontWeight: "600", 
    color: "#666",
    fontSize: 13,
  },
  radioTextActive: {
    color: "#1B5E20",
    fontWeight: "700",
  },
  
  // Input
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: { 
    flex: 1,
    backgroundColor: "transparent", 
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  
  // Picker
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingLeft: 12,
    height: 44,
  },
  picker: { 
    flex: 1, 
    height: 44,
    color: "#333",
  },
  
  // Button
  registerBtn: { 
    backgroundColor: "#2E7D32", 
    paddingVertical: 13, 
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 16,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  registerText: { 
    color: "#FFF", 
    fontWeight: "700", 
    textAlign: "center",
    fontSize: 15,
  },
  
  // Login Link
  loginLinkText: { 
    textAlign: "center", 
    color: "#666",
    fontSize: 12.5,
  },
  loginLink: { 
    color: "#2E7D32", 
    fontWeight: "700" 
  },
});