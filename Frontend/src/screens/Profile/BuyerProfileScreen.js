import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useContext } from "react";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ProfileContext } from "../../context/ProfileContext";
import globalStyles from "../../styles/globalStyles";

export default function BuyerProfileScreen({ navigation }) {
  const { profile, setProfile, refreshProfile } = useContext(ProfileContext);

  
  useFocusEffect(
    useCallback(() => {
      if (typeof refreshProfile === "function") refreshProfile();
    }, [])
  );

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("profile");

      setProfile({
        name: "",
        email: "",
        profileImage: null,
        role: "",
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Logout failed");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={globalStyles.title}>
          {profile?.name ? `${profile.name}'s Profile` : "My Profile"}
        </Text>

        <Image
          source={
            profile?.profileImage
              ? { uri: profile.profileImage }
              : require("../../../assets/defaultProfile.png")
          }
          style={{ width: 120, height: 120, borderRadius: 60 }}
        />
      </View>

      <Text style={globalStyles.input}>Name: {profile?.name || "-"}</Text>
      <Text style={globalStyles.input}>Email: {profile?.email || "-"}</Text>
      <Text style={globalStyles.input}>Role: {profile?.role || "buyer"}</Text>

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 20 }]}
        onPress={() => navigation.navigate("EditProfile")}
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
