import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import "./table.css";
import { toast } from "react-toastify";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery] = useOutletContext() || "";
  const navigate = useNavigate();

  // Sorting & Filtering States
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRole, setSelectedRole] = useState("");
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sortField, sortOrder, selectedRole, searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ No token found! Please log in.");
        return;
      }

      const response = await axios.get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast.error("Failed to load user data.");
    }
  };

  const toggleUserAccess = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ No token found! Please log in.");
        return;
      }

      const updatedStatus = !currentStatus;

      await axios.put(
        `${API}/api/users/${userId}/toggle-access`,
        { isEnabled: updatedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isEnabled: updatedStatus } : user
        )
      );
    } catch (error) {
      console.error("❌ Error updating user access:", error);
      toast.error("Failed to update user access.");
    }
  };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ No token found! Please log in.");
        return;
      }

      await axios.delete(`${API}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast.success("✅ User deleted successfully.");
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortField) {
      filtered.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    setFilteredUsers(filtered);
  };

  return (
    <>
      <button className="register-button" onClick={() => navigate("/register")}>
        Register
      </button>

      <div className="table-users">
        <div className="header">
          <h2>Users</h2>

          <div className="filters">
            <select onChange={(e) => setSortField(e.target.value)} value={sortField}>
              <option value="">Sort By</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>

            <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <select onChange={(e) => setSelectedRole(e.target.value)} value={selectedRole}>
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <table cellSpacing="0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Login Access</th>
              <th>Transaction</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
          {filteredUsers.length > 0 ? (
  filteredUsers.map((user) => (
    <tr key={user._id}>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>
        <label className="switch">
          <input
            type="checkbox"
            checked={user.isEnabled}
            onChange={() => toggleUserAccess(user._id, user.isEnabled)}
          />
          <span className="slider"></span>
        </label>
      </td>
      <td>
      <td>
  <button onClick={() => navigate(`/user-transactions/${user.name}`)}>
    View
  </button>
</td>
                  </td>
                  <td>
                    <button onClick={() => deleteUser(user._id)} className="delete-btn">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserList;
