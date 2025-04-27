import React from "react";
import "../pages/style.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation to get the current path
import { toast } from "react-toastify";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route location
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5003/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully!");
      navigate("/");
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

        {user?.role === "admin" ?(
          <Link to="/admin-order" className={location.pathname === "/admin-order" ? "active" : ""}>
          <div>Order</div>
     </Link>
        ):(
        <Link to="/purchase-order" className={location.pathname === "/purchase-order" ? "active" : ""}>
          <div>Order</div>
     </Link>)}

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
    <div>suppliers</div>
  </Link>
) : null}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;
