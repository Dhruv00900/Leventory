//import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";



export const register = async (req, res) => {
    try {
    
      const { name, email, password} = req.body;
        console.log(name,email,password);
      
     /**   const adminUser = req.user; // Ensure only admins can register users
   if (adminUser.role !== "admin") {
        return res.status(403).json({ message: "Only admins can register users" });
      }**/
         
      //check if admin already exists
     /* if (role === "admin") {
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
          return res.status(400).json({ message: "Admin already exists! You can only register as a user." });
        }
      }
*/
      // Validate input
      if (!email || !password || !name) {
        
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash password
    
    //const hashedPassword = await bcrypt.hash(password);
     // console.log('Password hashed successfully'); Debug log
              
      // Create new user
     /* const newUser = new User({
        name,
        email,
        password
        //role: role || user'  Default role if none provided
      });
      console.log('New user object created:', newUser); // Debug log
  
      // Save to database
      const savedUser = await newUser.save();
      console.log('User saved successfully:', savedUser); // Debug log*/
      const savedUser = await User.create({name,email,password});
  
      res.status(201).json({ 
        message: "User registered successfully",
        userId: savedUser._id // Optionally return the user ID
      });
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      res.status(500).json({ 
        message: "Error registering user", 
        error: error.message 
      });
    }
  };

  export const login = async (req, res) => {
    try {
      const { email, password: rawPassword } = req.body;
      const password = rawPassword.trim();
  
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
  
      // Check if user exists in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials (User not found)" });
      }
  
      // Check if the account is disabled
      if (!user.isEnabled) {
        return res.status(403).json({ message: "Your account is disabled. Contact admin." });
      }
  
      // Check if the password matches
      if (password !== user.password) {
        return res.status(400).json({ message: "Invalid credentials (Wrong password)" });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1h" }
      );
  
      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  };
  
export const getUsers = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verified.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  if (!req.cookies?.token) {
    return res.status(400).json({ message: "No active session" });
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production only
    sameSite: "None",
  });

  return res.status(200).json({ message: "Logout successful" });
};


  
