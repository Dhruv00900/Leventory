import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import img from "../components/logo512.png";

function Navbar({ setSearchQuery }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // ✅ Initialize useNavigate

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  return (
    <div className="navbar-container">
      <h1>Inventory</h1>
      <div className="search-bar">
        <input
          type="text"
          name="search"
          placeholder="Search here"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="nav-user" onClick={() => navigate("/settings")} style={{ cursor: "pointer" }}>
        <img src={img} alt="User" />
        {user ? <p>{user.name}</p> : <p>Guest</p>}
      </div>
    </div>
  );
}

export default Navbar;
