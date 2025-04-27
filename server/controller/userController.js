import User from "../models/User.js";

// ✅ Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
  }
};




// ✅ Toggle User Access (Admin Only)
export const toggleUserAccess = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isEnabled = req.body.isEnabled; // Toggle login access
    await user.save();

    res.json({ success: true, message: "User access updated successfully", user });
  } catch (error) {
    console.error("❌ Error updating user access:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateMe = async (req, res) => {
  try {
    console.log("🛠️ Received update request:", req.body);

    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required!" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.email = email;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteUser = async (req,res) => {
try {
   const {id} = req.params;
   const user =await User.findByIdAndDelete(id);
   if(!user) return res.status(404).json({message: "User not found"});
   res.status(200).json({message: "User deleted successfully"});
   } 

catch(error){
  console.error("Error deleting user:", error);
  res.status(500).json({message:"error in deleting user from server"});
}
};