// ==============================
// Frontend/src/screens/Vendor/VendorEditProfileScreen.js
// (Same UI; shows logged-in vendor details; Save updates DB; image stored base64)
// ==============================
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { VendorProfileContext } from "../../context/VendorProfileContext";
import globalStyles from "../../styles/globalStyles";
import { updateMyProfile } from "../../services/user";

export default function VendorEditProfileScreen({ navigation }) {
  const { vendorProfile, setVendorProfile, refreshVendorProfile } = useContext(VendorProfileContext);

   
  const [profileImage, setProfileImage] = useState(vendorProfile.profileImage);
  const [fullName, setFullName] = useState(vendorProfile.name || "");
  const [email, setEmail] = useState(vendorProfile.email || "");
  const [district, setDistrict] = useState(vendorProfile.district || "");
  const [shopName, setShopName] = useState(vendorProfile.shopName || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  
  useEffect(() => {
    setProfileImage(vendorProfile.profileImage);
    setFullName(vendorProfile.name || "");
    setEmail(vendorProfile.email || "");
    setDistrict(vendorProfile.district || "");
    setShopName(vendorProfile.shopName || "");
  }, [vendorProfile]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const mime = asset.mimeType || "image/jpeg";
      const dataUrl = asset.base64 ? `data:${mime};base64,${asset.base64}` : asset.uri;
      setProfileImage(dataUrl);
    }
  };

  const saveChanges = async () => {
    if (password && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const payload = {
        name: fullName,
        email,
        district,
        shopName,
        profileImage: profileImage || "",
        ...(password ? { password } : {}),
      };

      const res = await updateMyProfile(payload);

      const u = res.user;
      const next = {
        name: u.name || "",
        email: u.email || "",
        district: u.district || "",
        shopName: u.shopName || "",
        profileImage: u.profileImage || null,
        role: u.role || "",
      };

      setVendorProfile(next);

     
      await refreshVendorProfile().catch(() => {});

      alert("Vendor profile updated!");
      navigation.navigate("Vendor", { screen: "Profile" }); // ✅ unchanged
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <Text style={[globalStyles.title, { textAlign: "center", marginBottom: 15 }]}>
          {vendorProfile.name ? `Edit ${vendorProfile.name} Profile` : "Edit Profile"}
        </Text>

        <View style={{ position: "relative" }}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../../../assets/defaultProfile.png")
            }
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />

          <TouchableOpacity
            onPress={pickImage}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#2E7D32",
              borderRadius: 20,
              padding: 6,
            }}
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={globalStyles.input}
        placeholder="Full Name"
        placeholderTextColor="rgba(0,0,0,0.3)"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        placeholderTextColor="rgba(0,0,0,0.3)"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="District"
        placeholderTextColor="rgba(0,0,0,0.3)"
        value={district}
        onChangeText={setDistrict}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Shop Name"
        placeholderTextColor="rgba(0,0,0,0.3)"
        value={shopName}
        onChangeText={setShopName}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        placeholderTextColor="rgba(0,0,0,0.3)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Confirm Password"
        placeholderTextColor="rgba(0,0,0,0.3)"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={globalStyles.button} onPress={saveChanges}>
        <Text style={globalStyles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}
