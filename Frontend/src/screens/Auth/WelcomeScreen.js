import React from "react";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
  source={require("../../../assets/background.jpg")}
  style={styles.background}
  resizeMode="cover"
>
  {/* Overlay */}
  <View style={styles.overlay} />

  {/* Main Content */}
  <SafeAreaView style={styles.container}>
    {/* Logo */}
    <View style={styles.logoContainer}>
      <Image
        source={require("../../../assets/agrilinklogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>AgriLink</Text>
    </View>

    {/* Bottom Content */}
    <View style={styles.bottomContent}>
      <Text style={styles.tagline}>Connecting Farmers and Buyers Seamlesly</Text>
     
      <Text style={styles.heading}>
        Fresh & Local products.{"\n"}<Text>Direct Vendor Communication.</Text> {"\n"}<Text>Simple & Secure Purchasing.</Text>{"\n"}<Text style={{ color: "#2E7D32" }}>zero waste.</Text>
      </Text>
      <Text style={styles.description}>
        Discover fresh agricultural products directly from trusted vendors.Chat, explore & purchase with ease-all in one platform.
      </Text>

      <TouchableOpacity
  style={styles.primaryButton}
  onPress={() =>
    navigation.navigate("BuyerSearchPreview", { preview: true })
  }
>
  <Text style={styles.primaryButtonText}>Get Started →</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* Logo */
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 8,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  /* Bottom content */
  bottomContent: {
    alignItems: "flex-start",
  },
  tagline: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 8,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },

  primaryButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
