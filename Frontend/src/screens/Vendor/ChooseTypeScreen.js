import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChooseTypeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Select Product Type</Text>
          <Text style={styles.subtitle}>Choose what kind of product you want to add</Text>
        </View>

        {/* Fresh Product Card */}
        <TouchableOpacity
          style={[styles.cardButton, styles.freshButton]}
          onPress={() => navigation.navigate("AddProduct")}
          activeOpacity={0.85}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="leaf-outline" size={48} color="#FFFFFF" />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Fresh Product</Text>
            <Text style={styles.cardDescription}>
              Regular inventory items with standard pricing
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Surplus Product Card */}
        <TouchableOpacity
          style={[styles.cardButton, styles.surplusButton]}
          onPress={() => navigation.navigate("AddSurplus")}
          activeOpacity={0.85}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="pricetag-outline" size={48} color="#FFFFFF" />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Surplus Product</Text>
            <Text style={styles.cardDescription}>
              Excess inventory with special discounted pricing
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            You can add multiple products of each type
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },

  // Content Styles
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  // Title Section
  titleContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },

  // Card Button Styles
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },

  freshButton: {
    backgroundColor: "#22c55e",
  },

  surplusButton: {
    backgroundColor: "#F97316",
  },

  // Icon Container
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  // Card Content
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },

  // Arrow Container
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});