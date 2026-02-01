 
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSafe = (u) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
  role: u.role,
  district: u.district || "",
  shopName: u.shopName || "",
  profileImage: u.profileImage || "",
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, district, shopName, profileImage } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      district: role === "vendor" ? (district || "") : "",
      shopName: role === "vendor" ? (shopName || "") : "",
      profileImage: profileImage || "",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    return res.status(201).json({
      message: "User registered",
      token,
      user: userSafe(user),
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    return res.json({
      message: "Login successful",
      token,
      user: userSafe(user), 
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};
