import React from "react";
import { BlurView } from "expo-blur";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../../../assets/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Blur + Dark Overlay */}
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      />

      <SafeAreaView style={styles.container}>
        {/* Logo at Top Center */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/agrilinklogopng.png")}
            style={styles.logo}
          />
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          <Text style={styles.tagline}>Connecting Farmers and Buyers Seamlessly</Text>

          <Text style={styles.heading}>
            Fresh & Local products.{"\n"}
            <Text style={styles.subHeading}>Direct Vendor Communication.</Text>{"\n"}
            <Text style={styles.subHeading}>Simple & Secure Purchasing.</Text>{"\n"}
            <Text style={styles.zeroWaste}>Zero Waste.</Text>
          </Text>

          <Text style={styles.description}>
            Discover fresh agricultural products directly from trusted vendors.Chat, explore & purchase with ease-all in one platform.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("BuyerSearchPreview", { preview: true })}
          >
            <Text style={styles.primaryButtonText}>Get Started {"\u27A4"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },

  /* Logo */
  logoContainer: {
    alignItems: "center",
    marginTop: 40, // space from top
  },
  logo: {
    width: 180, // slightly bigger
    height: 180,
    resizeMode: "contain",
  },

  /* Bottom content */
  bottomContent: {
    alignItems: "flex-start",
    marginBottom: 40,
    paddingLeft: 8,
  },
  tagline: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 12,
  },
  subHeading: {
    fontWeight: "400",
    color: "#FFFFFF",
  },
  zeroWaste: {
    color: "#4CAF50", // brighter leaf green
    fontWeight: "700",
    fontStyle: "italic",
  },
  description: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },

  /* Buttons */
  primaryButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30, // pill-shaped
    width: width * 0.8, // 80% of screen width
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800", // bold
    letterSpacing: 1,
    textTransform: "capitalize",
  },
});
