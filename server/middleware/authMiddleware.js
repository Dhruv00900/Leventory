import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Authentication Middleware
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Check if the Authorization header exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Received Token:", token); 
  try {
    // Verify the token and decode its payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");

    // Fetch the full user from DB based on the decoded userId
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    

    req.user = user; // Attach user object to req
    console.log(req.user); 
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(400).json({ message: "Invalid token" });
  }
};

// Admin Middleware
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
