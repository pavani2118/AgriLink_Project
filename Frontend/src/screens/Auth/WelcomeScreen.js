import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/background.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <View style={styles.overlay} />

        <SafeAreaView style={styles.container}>
          {/* Animated Logo Section */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../../assets/agrilinklogo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>AgriLink</Text>
          </Animated.View>

          {/* Animated Bottom Content */}
          <Animated.View
            style={[
              styles.bottomContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.tagline}>
              Connecting Farmers & Buyers Seamlessly
            </Text>

            <Text style={styles.heading}>
              Fresh & Local{"\n"}
              <Text style={styles.headingSecondary}>Products.</Text>
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>Direct Vendor Communication</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>Simple & Secure Purchasing</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitDotHighlight} />
                <Text style={styles.benefitTextHighlight}>Zero Waste Initiative</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Discover fresh agricultural products directly from trusted
              vendors. Chat, explore & purchase with ease—all in one platform.
            </Text>

            {/* Get Started Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                navigation.navigate("BuyerSearchPreview", { preview: true })
              }
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </>
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
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 50,
  },

  // Logo Section
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(129, 199, 132, 0.3)",
    shadowColor: "#81C784",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Bottom Content
  bottomContent: {
    alignItems: "center",
  },

  tagline: {
    color: "#81C784",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: "center",
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 24,
    lineHeight: 50,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headingSecondary: {
    color: "#81C784",
  },

  // Benefits List
  benefitsList: {
    marginBottom: 24,
    gap: 14,
    alignItems: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginRight: 12,
  },
  benefitDotHighlight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#81C784",
    marginRight: 12,
  },
  benefitText: {
    color: "#E8E8E8",
    fontSize: 16,
    fontWeight: "500",
  },
  benefitTextHighlight: {
    color: "#81C784",
    fontSize: 16,
    fontWeight: "600",
  },

  description: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 36,
    textAlign: "center",
    paddingHorizontal: 10,
  },

  // Primary Button
  primaryButton: {
    width: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
});