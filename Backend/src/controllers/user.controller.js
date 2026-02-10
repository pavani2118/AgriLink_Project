 
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const me = req.userId; 

    const user = await User.findById(me).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        district: user.district || "",
        shopName: user.shopName || "",
        profileImage: user.profileImage || null,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

// PUT /api/users/me
exports.updateMe = async (req, res) => {
  try {
    const me = req.userId; 

    const { name, email, district, shopName, profileImage, password } = req.body;

    const user = await User.findById(me);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof name === "string" && name.trim()) user.name = name.trim();
    if (typeof email === "string" && email.trim()) user.email = email.trim();

    if (typeof district === "string") user.district = district.trim();
    if (typeof shopName === "string") user.shopName = shopName.trim();

    if (typeof profileImage === "string") user.profileImage = profileImage;

    if (password && String(password).trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(String(password).trim(), salt);
    }

    await user.save();

    return res.json({
      message: "Profile updated",
      user: {
        id: user._id.toString(),
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        district: user.district || "",
        shopName: user.shopName || "",
        profileImage: user.profileImage || null,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};
