import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import './settings.css';

const Settings = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Fetch Logged-in User Data
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ No token found! Please log in.");
        return;
      }

      const response = await axios.get("http://localhost:5003/api/users/getme", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      toast.error("Failed to load user data.");
    }
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // ✅ Handle User Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ No token found! Please log in.");
        return;
      }
  
      // ✅ Log before sending request
      console.log("🛠️ Sending update data:", { name: user.name, email: user.email });
  
      await axios.put(
        `http://localhost:5003/api/users/updateme`, // ✅ Ensure correct backend route
        { name: user.name, email: user.email }, // ✅ Send only updated fields
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      toast.success("✅ Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <form onSubmit={handleUpdate}>
        <label>Name:</label>
        <input type="text" name="name" value={user.name} onChange={handleChange} required />

        <label>Email:</label>
        <input type="email" name="email" value={user.email} onChange={handleChange} required />

        <button type="submit" disabled={loading}>{loading ? "Updating..." : "Update"}</button>
      </form>
    </div>
  );
};

export default Settings;
