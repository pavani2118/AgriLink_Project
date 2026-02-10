import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useContext, useState } from "react";
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  Alert,
  ActivityIndicator
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ProductContext } from "../../context/ProductContext";
import { createProduct } from "../../services/products";

export default function AddSurplusScreen({ navigation }) {
  const { refreshProducts } = useContext(ProductContext);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [discount, setDiscount] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ RESET FORM whenever screen is opened (focus)
  useFocusEffect(
    useCallback(() => {
      setName("");
      setPrice("");
      setDescription("");
      setQuantity("");
      setDiscount("");
      setImage(null);
    }, [])
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const mime = asset.mimeType || "image/jpeg";
      const dataUrl = `data:${mime};base64,${asset.base64}`;
      setImage(dataUrl);
    }
  };

  const addSurplusProduct = async () => {
    if (!name || !price || !description || !quantity || !discount || !image) {
      Alert.alert("Missing Information", "Please fill all fields and upload an image.");
      return;
    }

    try {
      setLoading(true);

      await createProduct({
        name,
        category: "Surplus",
        price: Number(price),
        description,
        quantity: Number(quantity),
        discount: Number(discount),
        type: "Surplus",
        imageUrl: image,
      });

      await refreshProducts();
      
      Alert.alert("Success", `${name} added successfully as a surplus product!`, [
        {
          text: "OK",
          onPress: () => {
             
            setName("");
            setPrice("");
            setDescription("");
            setQuantity("");
            setDiscount("");
            setImage(null);
            
            navigation.goBack();
          }
        }
      ]);
    } catch (e) {
      Alert.alert("Error", e.message || "Add surplus failed");
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = () => {
    if (price && discount) {
      const originalPrice = Number(price);
      const discountPercent = Number(discount);
      const discountedPrice = originalPrice - (originalPrice * discountPercent / 100);
      return discountedPrice.toFixed(2);
    }
    return "0.00";
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Surplus Product</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Surplus Badge */}
        <View style={styles.surplusBanner}>
          <Ionicons name="pricetag" size={24} color="#F97316" />
          <Text style={styles.surplusBannerText}>Special Discounted Product</Text>
        </View>

        {/* Product Image Upload */}
        <View style={styles.imageSection}>
          <TouchableOpacity 
            style={styles.imageUploadContainer}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>Upload Product Image</Text>
              </View>
            )}
            
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="pricetag-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Price and Discount Row */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Original Price (Rs.)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>Rs.</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 0 }]}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Discount (%)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="trending-down-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Discounted Price Display */}
          {price && discount && (
            <View style={styles.pricePreview}>
              <View style={styles.pricePreviewLeft}>
                <Text style={styles.pricePreviewLabel}>Final Price:</Text>
                <Text style={styles.pricePreviewValue}>Rs. {calculateDiscountedPrice()}</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{discount}% OFF</Text>
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity (kg)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="scale-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                placeholderTextColor="#9CA3AF"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter product description..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity 
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={addSurplusProduct}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="pricetag" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Surplus Product</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingBottom: 40,
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

  // Surplus Banner
  surplusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#F97316",
    gap: 10,
  },
  surplusBannerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F97316",
  },

  // Image Section
  imageSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
  },
  imageUploadContainer: {
    position: "relative",
    width: 200,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 20,
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Form Section
  formSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: 0,
  },
  textArea: {
    paddingTop: 14,
    paddingBottom: 14,
    height: 100,
  },

  // Row Inputs
  rowInputs: {
    flexDirection: "row",
  },

  // Price Preview
  pricePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF7ED",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  pricePreviewLeft: {
    flex: 1,
  },
  pricePreviewLabel: {
    fontSize: 14,
    color: "#9A3412",
    fontWeight: "500",
    marginBottom: 4,
  },
  pricePreviewValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F97316",
  },
  discountBadge: {
    backgroundColor: "#F97316",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Add Button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97316",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 32,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 20,
  },
});