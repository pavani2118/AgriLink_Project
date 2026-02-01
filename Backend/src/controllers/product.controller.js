 
const Product = require("../models/Product");
const User = require("../models/User");

const isBase64Image = (s) => typeof s === "string" && s.startsWith("data:image/");

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, description, quantity, type, discount, imageUrl } = req.body;

    console.log("=== CREATE PRODUCT ===");
    console.log("Request userId:", req.userId);
    console.log("Request body:", { name, category, price, quantity, type });

    if (!name || price === undefined || quantity === undefined || !imageUrl) {
      return res.status(400).json({ message: "name, price, quantity, imageUrl are required" });
    }

    if (!isBase64Image(imageUrl)) {
      return res.status(400).json({ message: "imageUrl must be a base64 data URL (data:image/...)" });
    }

    const user = await User.findById(req.userId).select("name role");
    console.log("Found user:", user);

    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.role !== "vendor") {
      return res.status(403).json({ message: "Only vendors can add products" });
    }

    const product = await Product.create({
      name: String(name).trim(),
      category: category ? String(category).trim() : "General",
      price: Number(price),
      description: description ? String(description) : "",
      quantity: Number(quantity),
      type: type ? String(type) : "",
      discount: discount ? Number(discount) : 0,
      imageUrl,
      vendorName: user.name,
      vendor: user._id,
    });

    console.log("Product created:", {
      id: product._id,
      name: product.name,
      vendor: product.vendor.toString()
    });

    return res.status(201).json({ message: "Product created", product: product.toSafeJSON() });
  } catch (e) {
    console.error("Create product error:", e);
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ products: products.map((p) => p.toSafeJSON()) });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    console.log("=== GET MY PRODUCTS ===");
    console.log("Request userId:", req.userId);
    
    const products = await Product.find({ vendor: req.userId }).sort({ createdAt: -1 });
    
    console.log("Found products count:", products.length);
    console.log("Products:", products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      vendor: p.vendor.toString()
    })));

    return res.json({ products: products.map((p) => p.toSafeJSON()) });
  } catch (e) {
    console.error("Get my products error:", e);
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.deleteMyProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.vendor.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await product.deleteOne();
    return res.json({ message: "Product deleted" });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};