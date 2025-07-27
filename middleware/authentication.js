const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Base JWT verification
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }
  const token = authHeader.split(" ")[1];
  const payload = jwt.verify(token, JWT_SECRET);
  console.log(payload);
  return payload;
};

// 🛡️ Admin middleware
 const adminAuth = (req, res, next) => {
  try {
    const payload = verifyToken(req);
    if (payload.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: err.message || "Unauthorized" });
  }
};

// 🧑‍💼 Vendor middleware
 const expertAuth = (req, res, next) => {
  try {
    const payload = verifyToken(req);
    if (payload.role !== "EXPERT") {
      return res.status(403).json({ success: false, message: "Vendors only" });
    }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: err.message || "Unauthorized" });
  }
};

// 👤 User middleware
 const userAuth = (req, res, next) => {
  try {
    const payload = verifyToken(req);
    console.log(payload);

    if (payload.role !== "USER") {
      return res.status(403).json({ success: false, message: "Users only" });
    }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: err.message || "Unauthorized" });
  }
};

module.exports = {
  adminAuth,
  expertAuth,
  userAuth,
  verifyToken,
}