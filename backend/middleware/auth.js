import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Fixed token extraction: split(' ')[1] not split('')[1]
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ success: false, message: "Token missing" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decode.id, email: decode.email };
    next();
  } catch (error) {
    // ✅ Using 'error' consistently
    const message =
      error.name === "TokenExpiredError" ? "Token expired" : "Invalid Token";
    res.status(403).json({ success: false, message });
  }
};

export default authMiddleware;
