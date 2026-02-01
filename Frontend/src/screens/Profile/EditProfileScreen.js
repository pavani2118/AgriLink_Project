import { Ionicons } from "@expo/vector-icons"; // ✅ for camera icon
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ProfileContext } from "../../context/ProfileContext";
import globalStyles from "../../styles/globalStyles";
import { updateMyProfile } from "../../services/user"; // ✅ same service vendor uses

export default function EditProfileScreen({ navigation }) {
  const { profile, setProfile, refreshProfile } = useContext(ProfileContext);

  //prefill with current buyer details from context (which should be from DB)
  const [profileImage, setProfileImage] = useState(profile?.profileImage || null);
  const [fullName, setFullName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  
  useEffect(() => {
    setProfileImage(profile?.profileImage || null);
    setFullName(profile?.name || "");
    setEmail(profile?.email || "");
  }, [profile]);

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
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      
      const payload = {
        name: fullName,
        email,
        profileImage: profileImage || "",
        ...(newPassword ? { password: newPassword } : {}),
      };

      const res = await updateMyProfile(payload);

      
      const u = res?.user || {};
      const next = {
        name: u.name || fullName || "",
        email: u.email || email || "",
        profileImage: u.profileImage || profileImage || null,
        role: u.role || profile?.role || "buyer",
      };

      setProfile(next);

       
      if (typeof refreshProfile === "function") {
        await refreshProfile().catch(() => {});
      }

      alert("Profile changes saved!");

       
      navigation.navigate("Buyer", { screen: "Profile" });
    } catch (e) {
      alert(e?.message || "Update failed");
    }
  };

  return (
    <View style={globalStyles.container}>
      {/*  Centered Title + Image */}
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <Text style={[globalStyles.title, { textAlign: "center", marginBottom: 15 }]}>
          Edit Profile
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

          {/*  Camera Icon Overlay */}
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

      {/* Input Fields (UI unchanged) */}
      <TextInput
        style={globalStyles.input}
        placeholder={`Full Name: ${profile?.name || ""}`}
        placeholderTextColor="rgba(0,0,0,0.3)"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={globalStyles.input}
        placeholder={`Email: ${profile?.email || ""}`}
        placeholderTextColor="rgba(0,0,0,0.3)"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="New Password"
        placeholderTextColor="rgba(0,0,0,0.3)"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Confirm Password"
        placeholderTextColor="rgba(0,0,0,0.3)"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/*  Save Changes Button */}
      <TouchableOpacity style={globalStyles.button} onPress={saveChanges}>
        <Text style={globalStyles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}
