import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { VendorProfileContext } from "../../context/VendorProfileContext";
import globalStyles from "../../styles/globalStyles";

export default function VendorProfileScreen({ navigation }) {
  const { vendorProfile, setVendorProfile, refreshVendorProfile } =
    useContext(VendorProfileContext);

  useFocusEffect(
    useCallback(() => {
      refreshVendorProfile().catch(() => {});
    }, [])
  );

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("vendorProfile");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("profile");
      await AsyncStorage.removeItem("user");

      setVendorProfile({
        name: "",
        email: "",
        district: "",
        shopName: "",
        profileImage: null,
        role: "",
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={[globalStyles.title, { textAlign: "center", marginBottom: 15 }]}>
          {vendorProfile?.name ? `${vendorProfile.name} Profile` : "Vendor Profile"}
        </Text>

        <Image
          source={
            vendorProfile?.profileImage
              ? { uri: vendorProfile.profileImage }
              : require("../../../assets/defaultProfile.png")
          }
          style={{ width: 120, height: 120, borderRadius: 60 }}
        />
      </View>

      {/* show fallback "-" if empty */}
      <Text style={globalStyles.input}>Name: {vendorProfile?.name || "-"}</Text>
      <Text style={globalStyles.input}>Email: {vendorProfile?.email || "-"}</Text>
      <Text style={globalStyles.input}>District: {vendorProfile?.district || "-"}</Text>
      <Text style={globalStyles.input}>Shop Name: {vendorProfile?.shopName || "-"}</Text>

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 20 }]}
        onPress={() => navigation.navigate("VendorEditProfile")}
      >
        <Text style={globalStyles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 20, backgroundColor: "red" }]}
        onPress={logout}
      >
        <Text style={globalStyles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
