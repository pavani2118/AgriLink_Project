import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useContext, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ProductContext } from "../../context/ProductContext";
import { createProduct } from "../../services/products";

export default function AddSurplusScreen({ navigation }) {
  const { refreshProducts } = useContext(ProductContext);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [discount, setDiscount] = useState("");
  const [image, setImage] = useState(null); // base64

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

  // In AddSurplusScreen.js - update the addSurplusProduct function
const addSurplusProduct = async () => {
  if (!name || !price || !description || !quantity || !discount || !image) {
    alert("Please fill all fields and upload an image.");
    return;
  }

  try {
    await createProduct({
      name,
      category: "Surplus", // ✅ ADD THIS
      price: Number(price),
      description,
      quantity: Number(quantity),
      discount: Number(discount),
      type: "Surplus",
      imageUrl: image,
    });

    await refreshProducts();
    alert(`${name} added successfully as a surplus product!`);
    navigation.goBack();
  } catch (e) {
    alert(e.message || "Add surplus failed");
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <MaterialIcons name="arrow-back-ios" size={26} color="#2E7D32" />
      </TouchableOpacity>

      <Text style={styles.title}>Add Surplus Product</Text>

      <TextInput style={styles.input} placeholder="Product Name" placeholderTextColor="#777" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Price (Rs.)" placeholderTextColor="#777" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" placeholderTextColor="#777" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Quantity (kg)" placeholderTextColor="#777" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Discount (%)" placeholderTextColor="#777" value={discount} onChangeText={setDiscount} keyboardType="numeric" />

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
        </View>
      )}

      <TouchableOpacity style={[styles.button, styles.uploadButton]} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Product Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={addSurplusProduct}>
        <Text style={styles.buttonText}>Add Surplus Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ✅ keep your styles same
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#E6F4EA", paddingBottom: 40 },
  backBtn: { position: "absolute", top: 15, left: 10, zIndex: 10, padding: 6, backgroundColor: "#fff", borderRadius: 30, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  title: { fontSize: 28, fontWeight: "800", color: "#1f2937", marginBottom: 30, textAlign: "center", marginTop: 10 },
  input: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 16, fontSize: 16, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  imagePreviewContainer: { alignItems: "center", marginBottom: 20 },
  imagePreview: { width: 180, height: 180, borderRadius: 16 },
  button: { backgroundColor: "#22c55e", paddingVertical: 16, borderRadius: 20, alignItems: "center", marginBottom: 16, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6 },
  uploadButton: { backgroundColor: "#f97316" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
