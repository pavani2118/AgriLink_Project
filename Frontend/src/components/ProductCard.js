// src/components/ProductCard.js
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: product.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.vendor}>Sold by {product.vendor}</Text>
        <View style={styles.rowBetween}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1kg</Text>
          </View>
          <Text style={styles.price}>Rs. {product.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#D0F0C0",
    borderRadius: 16,
    marginBottom: 16,
    padding: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  info: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  vendor: {
    fontSize: 14,
    color: "#6b7280",
    marginVertical: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16a34a",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#d2530a",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
