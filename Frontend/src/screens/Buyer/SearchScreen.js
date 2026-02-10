 import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { 
  FlatList, 
  Image, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  RefreshControl,
  StatusBar,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllProducts } from "../../services/products";

const categories = ["All", "Vegetable", "Fruit", "Grains", "Surplus"];

const normalizeProducts = (list = []) =>
  list.map((p) => ({
    ...p,
    id: String(p?.id || p?._id || ""),
    image: p?.image || p?.imageUrl || "",
  })).filter((p) => p.id);

export default function SearchScreen({ navigation, route }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortByPriceAsc, setSortByPriceAsc] = useState(false);
  const [products, setProducts] = useState([]);
  const [userName, setUserName] = useState("");

  const isPreview = route?.params?.preview === true;

  const loadUserAndProducts = async () => {
    const userStr = await AsyncStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user?.name || "");
    }

    const res = await getAllProducts();
    setProducts(normalizeProducts(res?.products || []));
  };

  useEffect(() => {
    loadUserAndProducts().catch((e) => console.log(e.message));
  }, []);

  const onRefresh = useCallback(() => {
    return loadUserAndProducts().catch(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((item) => {
      const categoryLabel = item.type === "Surplus" ? "Surplus" : item.category || "All";
      const matchCategory = activeCategory === "All" || categoryLabel === activeCategory;
      const matchSearch = q.length === 0 || (item.name || "").toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, query, activeCategory]);

  const sortedProducts = useMemo(() => {
    if (!sortByPriceAsc) return filteredProducts;
    return [...filteredProducts].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  }, [filteredProducts, sortByPriceAsc]);

  const handlePressItem = (item) => {
    if (isPreview) {
      navigation.navigate("Login");
      return;
    }
    navigation.navigate("ItemDetails", { product: item });
  };

  // Calculate discount percentage
  const getDiscountPercentage = (oldPrice, newPrice) => {
    if (!oldPrice || !newPrice) return 0;
    const discount = ((Number(oldPrice) - Number(newPrice)) / Number(oldPrice)) * 100;
    return Math.round(discount);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.header}>
              {userName ? `${userName}'s Marketplace` : "AgriLink Marketplace"}
            </Text>
          </View>
          {isPreview && (
            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={16} color="#FFF" />
              <Text style={styles.signupButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vegetables, fruits, grains..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <TouchableOpacity
            onPress={() => setSortByPriceAsc((s) => !s)}
            style={[styles.filterBtn, sortByPriceAsc && styles.filterBtnActive]}
            accessibilityLabel="Sort by price"
            activeOpacity={0.7}
          >
            <Ionicons 
              name={sortByPriceAsc ? "funnel" : "funnel-outline"} 
              size={20} 
              color={sortByPriceAsc ? "#FFF" : "#2E7D32"} 
            />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: cat }) => (
              <TouchableOpacity
                onPress={() => {
                  setActiveCategory(cat);
                  loadUserAndProducts().catch(() => {});
                }}
                style={[
                  styles.categoryChip,
                  activeCategory === cat && styles.categoryChipActive
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoryList}
          />
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          const hasDiscount = item.oldPrice && Number(item.oldPrice) > Number(item.price);
          const discountPercent = hasDiscount ? getDiscountPercentage(item.oldPrice, item.price) : 0;

          return (
            <TouchableOpacity 
              style={styles.productCard} 
              onPress={() => handlePressItem(item)}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                {!!item.image && (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                )}
                {!item.image && (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={40} color="#D1D5DB" />
                  </View>
                )}
                
                {/* Discount Badge */}
                {hasDiscount && discountPercent > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                
                <View style={styles.productFooter}>
                  <View style={styles.quantityBadge}>
                    <Ionicons name="cube-outline" size={12} color="#059669" />
                    <Text style={styles.productQuantity}>{item.quantity}kg</Text>
                  </View>
                  
                  {/* Enhanced Price Display */}
                  <View style={styles.priceContainer}>
                    {hasDiscount ? (
                      <>
                        <View style={styles.priceRow}>
                          <View style={styles.oldPriceContainer}>
                            <Text style={styles.oldPrice}>Rs. {item.oldPrice}</Text>
                            <View style={styles.strikethrough} />
                          </View>
                        </View>
                        <Text style={styles.productPrice}>Rs. {item.price}</Text>
                      </>
                    ) : (
                      <Text style={styles.productPrice}>Rs. {item.price}</Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl 
            refreshing={false} 
            onRefresh={onRefresh}
            colors={["#2E7D32"]}
            tintColor="#2E7D32"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F0FDF4" 
  },

  // Header Styles
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  header: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#1B5E20",
    letterSpacing: 0.3,
  },
  signupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: { 
    color: "#FFF", 
    fontSize: 13, 
    fontWeight: "700" 
  },

  // Search Styles
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    paddingVertical: 12,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },

  // Category Styles
  categoryContainer: {
    paddingHorizontal: 16,
  },
  categoryList: {
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
  },
  categoryChipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13,
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Product Grid Styles
  productList: {
    padding: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  
  // Discount Badge (on image)
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  
  // Enhanced Price Container
  priceContainer: {
    alignItems: "flex-end",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  oldPriceContainer: {
    position: "relative",
    justifyContent: "center",
  },
  oldPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    paddingHorizontal: 2,
  },
  strikethrough: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "#EF4444",
    transform: [{ rotate: "-8deg" }],
  },
  productPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2E7D32",
    letterSpacing: 0.2,
  },
  
  quantityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  productQuantity: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
});