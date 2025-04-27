import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProduct.css";
import { toast } from "react-toastify";
import { Select } from "antd";

const { Option } = Select; // Ensure Option is extracted

const API = process.env.REACT_APP_API_URL;

function AddProduct({ addProduct}) {
  const [categories, setCategories] = useState([]); 
  const [newCategory, setNewCategory] = useState(""); 
  const [isAddingCategory, setIsAddingCategory] = useState(false); 
  const [product, setProduct] = useState({
    name: "",
    image: "",
   
    SKU: `SKU-${Date.now()}`,
    supplier: "",
    quantity: 1,
    category: "",
    price: "",
    costprice:"" ,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    if (e.target.value === "add-new") {
      setIsAddingCategory(true);
      setProduct((prev) => ({ ...prev, category: "" }));
    } else {
      setIsAddingCategory(false);
      setProduct((prev) => ({ ...prev, category: e.target.value }));
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()|| typeof newCategory !== "string") {
      toast.error("Category name cannot be empty.");
      return;
    }

    // Prevent duplicate category names
    if (categories.some((cat) => cat.name.toLowerCase() === newCategory.toLowerCase())) {
      toast.error("This category already exists.");
      return;
    }

    try {
      const response = await axios.post(`${API}/api/categories`, { name: newCategory });
      setCategories([...categories, response.data]);
      setProduct((prev) => ({ ...prev, category: response.data._id })); 
      setNewCategory(""); 
      setIsAddingCategory(false);
      toast.success("✅ Category added successfully!");
    } catch (error) {
      console.error("❌ Error adding category:", error);
      toast.error(error.response?.data?.message || "Failed to add category.");
    }
  };
  const [suppliers, setSuppliers] = useState([]);

  // 🔹 Fetch suppliers from the backend
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`${API}/api/supplierManage`); // API endpoint to get all suppliers
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: ["quantity", "price", "costprice"].includes(name) ? Number(value) || 0 : value.trim(),
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please log in again.");
      window.location.href = "/login";
      return;
    }

    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await axios.post(`${API}/api/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Product added successfully!");
      console.log("🎉 Response from Backend:", response.data);

      if (addProduct) {
        addProduct(response.data);
      }

      setProduct({
        name: "",
        image: "",
                SKU: `SKU-${Date.now()}`,
        supplier: "",
        quantity: 1,
        category: "",
        price: "",
        costprice: "",
      });

    } catch (error) {
      console.error("❌ Error adding product:", error.response?.data || error);
      toast.error(`Failed to add product: ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="add-product">
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" name="name" value={product.name} onChange={handleChange} required />

        <label>Item Code (SKU):</label>
        <input type="text" name="SKU" value={product.SKU} disabled />

       
      <label>Supplier:</label>
      <Select
        showSearcha
        placeholder="Search and select supplier"
        value={suppliers.find(s => s._id === product.supplier)?.name || ""}
        onChange={(value) => {
          const selectedSupplier = suppliers.find(s => s.name === value);
          handleChange({ target: { name: "supplier", value: selectedSupplier ? selectedSupplier._id : "" } });
        }}
        style={{ width: "100%" }}
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
      >
        {suppliers.map((supplier) => (
          <Option key={supplier._id} value={supplier.name}>
            {supplier.name}
          </Option>
        ))}
      </Select>
   
        <label>Stock Size:</label>
        <input type="number" name="quantity" min="1" value={product.quantity} onChange={handleChange} required />

        {/* ✅ Category Selection */}
        <label>Category:</label>
        <select name="category" value={product.category} onChange={handleCategoryChange} required>
          <option value="" disabled>Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
          <option value="add-new">➕ Add New Category</option>
        </select>

        {/* ✅ Show input when "Add Category" is selected */}
        {isAddingCategory && (
          <div>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category"
            />
            <button type="button" onClick={handleAddCategory}>Add</button>
          </div>
        )}

        <label>Sell Price:</label>
        <input type="number" name="price"  value={product.price} onChange={handleChange} required />

        <label>Cost Price:</label>
        <input type="number" name="costprice"  value={product.costprice} onChange={handleChange} required />

        <label>Image:</label>
        <input type="file" name="image" onChange={handleFileChange} accept="image/*" required />

        
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default AddProduct;
