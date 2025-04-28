import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const SupplierManagement = ({ currentUser }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ name: "", contact: "", email: "", address: "" });
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const API = process.env.REACT_APP_API_URL;

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API}/api/supplierManage`);
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() ? "" : "Name is required";
      case "email":
        return value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) ? "Invalid email" : "";
      case "contact":
        return value && !/^\d{10}$/.test(value) ? "Contact must be 10 digits" : "";
      case "address":
        return value.trim() ? "" : "Address is required";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: error });
  };

  const isFormValid = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      if (editingId) {
        await axios.put(`${API}/api/suppliers/${editingId}`, formData);
        Swal.fire("Success", "Supplier updated successfully", "success");
      } else {
        await axios.post(`${API}/api/suppliers`, formData);
        Swal.fire("Success", "Supplier added successfully", "success");
      }
      setFormData({ name: "", contact: "", email: "", address: "" });
      setFormErrors({});
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
    }
  };

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setEditingId(supplier._id);
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this supplier!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API}/api/suppliers/${id}`);
        Swal.fire("Deleted!", "Supplier has been deleted.", "success");
        fetchSuppliers();
      } catch (err) {
        Swal.fire("Error", "Failed to delete supplier", "error");
      }
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supplier Management</h2>

      <form onSubmit={handleAddOrUpdate} className="grid gap-4 mb-6">
        {["name", "contact", "email", "address"].map((field) => (
          <div key={field}>
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={
                field === "name"
                  ? "Supplier Name"
                  : field === "contact"
                  ? "Contact Number"
                  : field.charAt(0).toUpperCase() + field.slice(1)
              }
              required={field === "name" || field === "address"}
              className={`p-2 border rounded w-full ${
                formErrors[field] ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors[field] && (
              <p className="text-red-500 text-sm mt-1">{formErrors[field]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {editingId ? "Update Supplier" : "Add Supplier"}
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Contact</th>
            <th className="p-2">Address</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier._id} className="border-t">
              <td className="p-2">{supplier.name}</td>
              <td className="p-2">{supplier.email}</td>
              <td className="p-2">{supplier.contact}</td>
              <td className="p-2">{supplier.address}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier._id)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierManagement;
