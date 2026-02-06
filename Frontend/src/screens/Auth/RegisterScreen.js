import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Dimensions, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    <ImageBackground source={require("../../../assets/background.jpg")} style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.card}>
        <Image source={require("../../../assets/agrilinklogopng.png")} style={styles.logo} />
        <Text style={styles.title}>AgriLink Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
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
        />

        {role === "vendor" && (
          <>
            <View style={styles.pickerContainer}>
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

            <TextInput
              style={styles.input}
              placeholder="Shop Name"
              placeholderTextColor="#777"
              value={shopName}
              onChangeText={setShopName}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#777"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text style={styles.roleLabel}>Select Role</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity style={styles.radioContainer} onPress={() => setRole("buyer")}>
            <View style={[styles.radioCircle, role === "buyer" && styles.radioSelected]} />
            <Text style={styles.radioText}>Buyer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.radioContainer} onPress={() => setRole("vendor")}>
            <View style={[styles.radioCircle, role === "vendor" && styles.radioSelected]} />
            <Text style={styles.radioText}>Vendor</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.loginLinkText}>
          Already have an account?{" "}
          <Text style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
            Login
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { width, height, justifyContent: "center", alignItems: "center" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  card: {
    width: 320,
    backgroundColor: "rgba(255,255,255,0.65)",
    padding: 22,
    borderRadius: 14,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  logo: { width: 80, height: 80, alignSelf: "center", marginBottom: 10, resizeMode: "contain" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  input: { backgroundColor: "#F1F5FF", borderRadius: 8, padding: 10, marginBottom: 10 },
  pickerContainer: { backgroundColor: "#F1F5FF", borderRadius: 8, marginBottom: 10, paddingHorizontal: 5 },
  picker: { height: 44, width: "100%" },
  roleLabel: { fontWeight: "600", marginBottom: 6 },
  roleRow: { flexDirection: "row", justifyContent: "flex-start", gap: 12, marginBottom: 14 },
  radioContainer: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  radioCircle: { height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: "#2E7D32", marginRight: 6 },
  radioSelected: { backgroundColor: "#2E7D32" },
  radioText: { fontWeight: "600", color: "#333" },
  registerBtn: { backgroundColor: "#2E7D32", paddingVertical: 12, borderRadius: 8, marginBottom: 8 },
  registerText: { color: "#FFF", fontWeight: "bold", textAlign: "center" },
  loginLinkText: { textAlign: "center", color: "#666", marginTop: 4 },
  loginLink: { color: "#2E7D32", fontWeight: "bold" },
});
