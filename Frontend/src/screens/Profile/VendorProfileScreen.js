 import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useContext } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet, ScrollView, Alert } from "react-native";
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
      Alert.alert("Error", "Logout failed");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                vendorProfile?.profileImage
                  ? { uri: vendorProfile.profileImage }
                  : require("../../../assets/defaultProfile.png")
              }
              style={styles.avatar}
            />
            <View style={styles.avatarBorder} />
          </View>
          <Text style={styles.userName}>{vendorProfile?.name || "Vendor"}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Vendor</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>👤</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{vendorProfile?.name || "Not set"}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>✉️</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {vendorProfile?.email || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>📍</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>District</Text>
              <Text style={styles.infoValue}>
                {vendorProfile?.district || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>🏪</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Shop Name</Text>
              <Text style={styles.infoValue}>
                {vendorProfile?.shopName || "Not set"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("VendorEditProfile")}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>✏️</Text>
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </View>
          <Text style={styles.buttonArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>🚪</Text>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer Spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header Styles
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  // Avatar Section
  avatarContainer: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarBorder: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: "#2E7D32",
    top: -4,
    left: -4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
    textTransform: "capitalize",
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoIcon: {
    fontSize: 22,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },

  // Action Buttons
  actionsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  buttonArrow: {
    fontSize: 28,
    color: "#9CA3AF",
    fontWeight: "300",
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
  },

  // Footer
  footer: {
    height: 40,
  },
});