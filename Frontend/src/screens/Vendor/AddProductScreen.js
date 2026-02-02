import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useContext, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native"; 
import { ProductContext } from "../../context/ProductContext";
import { createProduct } from "../../services/products";

export default function AddProductScreen({ navigation }) {
  const { refreshProducts } = useContext(ProductContext);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);

  const [category, setCategory] = useState("Fruit");
 
  useFocusEffect(
    useCallback(() => {
      setName("");
      setPrice("");
      setDescription("");
      setQuantity("");
      setImage(null);
      setCategory("Fruit");
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

  const addProduct = async () => {
    if (!name || !price || !description || !quantity || !image) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    try {
      await createProduct({
        name,
        category,
        price: Number(price),
        description,
        quantity: Number(quantity),
        type: "Fresh",
        discount: 0,
        imageUrl: image,
      });

      await refreshProducts();
      alert(`${name} added successfully`);

      
      setName("");
      setPrice("");
      setDescription("");
      setQuantity("");
      setImage(null);
      setCategory("Fruit");

      navigation.goBack();
    } catch (e) {
      alert(e.message || "Add product failed");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <MaterialIcons name="arrow-back-ios" size={26} color="#2E7D32" />
      </TouchableOpacity>

      <Text style={styles.title}>Add Product</Text>

      <TextInput style={styles.input} placeholder="Product Name" placeholderTextColor="#777" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Price (Rs.)" placeholderTextColor="#777" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" placeholderTextColor="#777" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Quantity (kg)" placeholderTextColor="#777" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

      <Text style={styles.roleLabel}>Select Category</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity style={styles.radioContainer} onPress={() => setCategory("Fruit")} activeOpacity={0.8}>
          <View style={[styles.radioCircle, category === "Fruit" && styles.radioSelected]} />
          <Text style={styles.radioText}>Fruit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.radioContainer} onPress={() => setCategory("Vegetable")} activeOpacity={0.8}>
          <View style={[styles.radioCircle, category === "Vegetable" && styles.radioSelected]} />
          <Text style={styles.radioText}>Vegetable</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.radioContainer} onPress={() => setCategory("Grains")} activeOpacity={0.8}>
          <View style={[styles.radioCircle, category === "Grains" && styles.radioSelected]} />
          <Text style={styles.radioText}>Grains</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
        </View>
      )}

      <TouchableOpacity style={[styles.button, styles.uploadButton]} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Product Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={addProduct}>
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

 
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#E6F4EA", paddingBottom: 40 },
  backBtn: { position: "absolute", top: 15, left: 10, zIndex: 10, padding: 6, backgroundColor: "#fff", borderRadius: 30, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  title: { fontSize: 28, fontWeight: "800", color: "#1f2937", marginBottom: 30, textAlign: "center", marginTop: 10 },
  input: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 16, fontSize: 16, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  roleLabel: { fontWeight: "700", marginBottom: 8, color: "#1f2937" },
  roleRow: { flexDirection: "row", justifyContent: "flex-start", gap: 14, marginBottom: 16 },
  radioContainer: { flexDirection: "row", alignItems: "center" },
  radioCircle: { height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: "#2E7D32", marginRight: 6 },
  radioSelected: { backgroundColor: "#2E7D32" },
  radioText: { fontWeight: "700", color: "#333" },
  imagePreviewContainer: { alignItems: "center", marginBottom: 20 },
  imagePreview: { width: 180, height: 180, borderRadius: 16 },
  button: { backgroundColor: "#22c55e", paddingVertical: 16, borderRadius: 20, alignItems: "center", marginBottom: 16, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6 },
  uploadButton: { backgroundColor: "#f97316" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
