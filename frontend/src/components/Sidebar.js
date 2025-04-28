import React from "react";
import "../pages/style.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation to get the current path
import { toast } from "react-toastify";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route location
  const user = JSON.parse(localStorage.getItem("user"));
  const API = process.env.REACT_APP_API_URL;

  // Logout function
  const handleLogout = async () => {
    try {
      // Send POST request to logout
      const response = await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // Include credentials (cookies/tokens)
      });

      if (response.ok) {
        // Remove token and user from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.success("Logged out successfully!");
        navigate("/"); // Redirect to login or home page
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-elements">
        <Link to="/home" className={location.pathname === "/home" ? "active" : ""}>
          <div>Home</div>
        </Link>

        <Link to="/products" className={location.pathname === "/products" ? "active" : ""}>
          <div>Products</div>
        </Link>

        {user?.role === "admin" ? (
          <Link to="/admin-order" className={location.pathname === "/admin-order" ? "active" : ""}>
            <div>Order</div>
          </Link>
        ) : (
          <Link to="/purchase-order" className={location.pathname === "/purchase-order" ? "active" : ""}>
            <div>Order</div>
          </Link>
        )}

        <Link to="/sellProducts" className={location.pathname === "/sellProducts" ? "active" : ""}>
          <div>Sell Products</div>
        </Link>

        {user?.role === "admin" ? (
          <Link to="/user-list" className={location.pathname === "/user-list" ? "active" : ""}>
            <div>Users</div>
          </Link>
        ) : (
          <Link to="/bills" className={location.pathname === "/bills" ? "active" : ""}>
            <div>Transaction</div>
          </Link>
        )}

        <Link to="/settings" className={location.pathname === "/settings" ? "active" : ""}>
          <div>Settings</div>
        </Link>

        {user?.role === "admin" ? (
          <Link to="/addProduct" className={location.pathname === "/addProduct" ? "active" : ""}>
            <div>Add Product</div>
          </Link>
        ) : null}

        {user?.role === "admin" ? (
          <Link to="/supplierManage" className={location.pathname === "/supplierManage" ? "active" : ""}>
            <div>Suppliers</div>
          </Link>
        ) : null}

        {/* Logout Button */}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;
