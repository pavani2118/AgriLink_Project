  
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    console.log("🔐 AUTH HEADER:", header ? "present" : "missing");

    if (!token) {
      console.log("❌ AUTH: No token");
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // works with many token shapes
    const id = decoded?.id || decoded?.userId || decoded?._id;

    console.log("🔓 AUTH DECODED:", decoded);
    console.log("✅ AUTH USER ID:", id);

    if (!id) {
      console.log("❌ AUTH: Token missing id/userId/_id");
      return res.status(401).json({ message: "Invalid token payload (no user id)" });
    }

     
    req.userId = id;
    req.user = { id };

    next();
  } catch (e) {
    console.log("❌ AUTH ERROR:", e.message);
    return res.status(401).json({ message: "Invalid token", error: e.message });
  }
};
