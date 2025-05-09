import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./table.css";

import { toast } from "react-toastify";
import Swal from "sweetalert2";

function Products() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Controls the modal
  const [filters, setFilters] = useState({
    category: "",
    name: "",
    minPrice: "",
  
    minQuantity: "",
   
    sortBy: "",
    sortOrder: "asc",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // Number of products per page
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

useEffect(() => {
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/api/suppliers`);
      setSuppliers(response.data); // Assuming API returns { suppliers: [...] }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };
  const fetchCategories = async () => {
    try{
      const response = await axios.get(`${API}/api/categories`);
      setCategories(response.data); // Assuming API returns { categories: [...] }
    }catch(error){
      console.error("Error fetching categories:", error);
    }
    };
  fetchCategories();
  fetchSuppliers();
}, []);




  // ✅ Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/api/products`, {
        params: {
          page: currentPage,
         limit:limit,
        category: filters.category,
        },}

      );
      console.log("Fetched Products: ",response.data.products);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("❌ [Error fetching products:", error);
    }
    
  }, [currentPage,filters.category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  // ✅ Handle Sorting and Filtering
 const filteredAndSortedProducts = Array.isArray(products) ? products
 .filter((product) => {
   return (
    (filters.category ? product.category.name === filters.category : true)&&
     (filters.name ? product.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
     (filters.minPrice ? product.price >= parseFloat(filters.minPrice) : true) &&
    
     (filters.minQuantity ? product.quantity >= parseInt(filters.minQuantity) : true) 
    
   );
 })
 .sort((a, b) => {
   if (!filters.sortBy) return 0;
   const valueA = a[filters.sortBy];
   const valueB = b[filters.sortBy];

   if (typeof valueA === "string") {
     return filters.sortOrder === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
   }
   return filters.sortOrder === "asc" ? valueA - valueB : valueB - valueA;
 }) : [];

// ✅ Generate PDF Report
const generatePDF = () => {
  const doc = new jsPDF();

  // 🔹 Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const generatedBy = user ? `${user.name} (${user.email})` : "Unknown User";

  // 🔹 Validate product data
  if (!filteredAndSortedProducts || filteredAndSortedProducts.length === 0) {
    toast.error("No products available for PDF generation!");
    return;
  }

  // 🔹 Calculate totals
  const totalProducts = filteredAndSortedProducts.length;
  const totalPrice = filteredAndSortedProducts.reduce((sum, product) => sum + product.price, 0);
  const totalQuantity = filteredAndSortedProducts.reduce((sum, product) => sum + product.quantity, 0);

  // 🔹 Title
  doc.setFont("helvetica", "bold");
  doc.text("Products Report", 14, 15);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated by: ${generatedBy}`, 14, 25);
  doc.text(`Total Products: ${totalProducts}`, 14, 35);
  doc.text(`Total Price: Rs. ${totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 14, 45);

  // 🔹 Define table headers
  const headers = [["Name", "SKU", "Supplier", "Quantity", "Category", "Price (INR)"]];

  // 🔹 Product data for the table
  const data = filteredAndSortedProducts.map((product) => [
    product.name,
    product.SKU,
    product.supplier?.name || "N/A", // ✅ Fix: Handle object & undefined
    product.quantity,
    product.category?.name || "N/A", // ✅ Fix: Handle object & undefined
    product.price.toFixed(2),
  ]);

  // 🔹 Add table to the PDF
  doc.autoTable({
    startY: 50,
    head: headers,
    body: data,
    theme: "striped",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] }, // Green header
    didDrawPage: (data) => {
      const tableHeight = data.cursor.y; // ✅ Correct way to get table end position

      // 🔹 Add total row at the bottom
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255); // White text
      doc.setFillColor(60, 60, 60); // Dark Gray background

      doc.rect(14, tableHeight + 5, 180, 8, "F"); // Draw filled rectangle

      doc.text("TOTAL", 16, tableHeight + 10);
      doc.text(`${totalQuantity}`, 135, tableHeight + 10);
      doc.text(`Rs. ${totalPrice.toFixed(2)}`, 170, tableHeight + 10);
    },
  });

  // 🔹 Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `products_report_${timestamp}.pdf`;

  // 🔹 Save and Download PDF
  doc.save(fileName);
};



const user = JSON.parse(localStorage.getItem("user")); 
const isadmin = user?.role === "admin"; 
// ✅ Update Product
const updateProduct = async () => {
  if (!editProduct) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("❌ Unauthorized: No token found!");
      return;
    }

    let updatedProduct = { ...editProduct };

    // ✅ Upload the image to Cloudinary if it's a new File
    if (editProduct.image instanceof File) {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", editProduct.image);
      cloudinaryFormData.append("upload_preset", "ml_default"); // Your preset

      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/dcphwpxs3/image/upload", // Your Cloudinary account
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();
      if (cloudinaryData.secure_url) {
        updatedProduct.image = cloudinaryData.secure_url; // ✅ Set the new image URL
      }
    }

    // ✅ Send updated product data to the backend
         await axios.put(
      `${API}/api/products/${editProduct._id}`,
      updatedProduct,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.success("✅ Product updated successfully!");

    // ✅ Ensure UI updates immediately with the new image
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === editProduct._id
          ? { ...product, ...updatedProduct } // ✅ Ensure new image is included
          : product
      )
    );

    setIsModalOpen(false); // ✅ Close modal after updating
    setEditProduct(null);
  } catch (error) {
    console.error("❌ Error updating product:", error.response?.data || error);
    toast.error("❌ Failed to update product!");
  }
};



const handleDelete = async (productId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("❌ Unauthorized: No token found!");
      return;
    }

    // Confirm before deleting
    const confirmDelete = await Swal.fire({
      title: "Are you sure you want to delete this product?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (!confirmDelete.isConfirmed) return; // ✅ Check for confirmation

    await axios.delete(`${API}/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("✅ Product deleted successfully!");

    // Remove the deleted product from state
    setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
  } catch (error) {
    console.error("❌ Error deleting product:", error.response?.data || error);
    toast.error("❌ Failed to delete product!");
  }
};


  

  // ✅ Open the modal when editing a product
  const handleEdit = (product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  // ✅ Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
  };

  return (
    <div>
      <h1>Product List</h1> {/* 🔹 Filter & Sort Controls */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
         <select onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
      <option value="">All Categories</option>
      {categories.map((cat) => (
        <option key={cat._id} value={cat.name}>
          {cat.name}
        </option>
      ))}
    </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
   
        <input
          type="number"
          placeholder="Min Quantity"
          value={filters.minQuantity}
          onChange={(e) => setFilters({ ...filters, minQuantity: e.target.value })}
        />
      

        <select
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="quantity">Quantity</option>
        </select>

        <select
          onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>


      {/* ✅ Edit Product Popup (Modal) */}
      {isModalOpen && editProduct && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Edit Product</h2>
      
      <input
        type="text"
        value={editProduct.name}
        placeholder="Product Name"
        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
      />
      <input
        type="text"
        value={editProduct.SKU}
        placeholder="SKU"
        onChange={(e) => setEditProduct({ ...editProduct, SKU: e.target.value })}
      />
      
      {/* Supplier Dropdown */}
      <select
        value={editProduct.supplier}
       
        onChange={(e) => setEditProduct({ ...editProduct, supplier: e.target.value })}
      >
        <option value="">Select Supplier</option>
        {suppliers.map((supplier) => (
          <option key={supplier._id} value={supplier._id}>
            {supplier.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={editProduct.quantity}
        placeholder="quantity"
        onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
      />

      {/* Category Dropdown */}
      <select
        value={editProduct.category}
        onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
      >
        <option value="">Select a Category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={editProduct.price}
        placeholder="Sell Price"
        onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
      />
      <input type="number"
        value={editProduct.costprice} 
        placeholder="Cost Price"
        onChange={(e) => setEditProduct({...editProduct, costprice: e.target.value })}
      />

  {/* Image Upload Section */}
<div>
  <label>Product Image:</label>
  {editProduct.image && (
    <img 
      src={typeof editProduct.image === "string" ? editProduct.image : URL.createObjectURL(editProduct.image)} 
      alt="Product" 
      style={{ width: "100px", height: "100px", marginBottom: "10px" }} 
    />
  )}
  <input 
    type="file" 
    accept="image/*" 
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setEditProduct({ ...editProduct, image: file });
      }
    }} 
  />
</div>

      <div className="modal-buttons">
        <button onClick={updateProduct} className="update-btn">Save</button>
        <button onClick={closeModal} className="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
)}


      {/* 🔹 Product Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Supplier</th>
            <th>Quantity</th>
            <th>Category</th>
            <th>SellPrice</th> 
            {isadmin&&(<th>CostPrice</th>)}
           
           {isadmin&&(<th>Actions</th>)}
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedProducts.map((product) => (
            <tr key={product._id}>
             
                     <td>
          <img 
            src={product.image || "https://via.placeholder.com/50"} 
            alt={product.name} 
            width="50" 
            height="50" 
            style={{ objectFit: "cover", borderRadius: "5px" }} 
          />
        </td>
              <td>{product.name}</td>
              <td>{product.SKU}</td>
              <td>{product.supplier?.name || "N/A"}</td>
              <td>{product.quantity}</td>
              <td>{product.category?.name || "N/A"}</td>
              <td>Rs.{product.price}</td>
              
              {isadmin&&( <td>Rs.{product.costprice}</td>)}
           
              {isadmin &&(<><td>
                <button className="btn-edit" onClick={() => handleEdit(product)}>✏️</button>
                <button className="btn-delete"
                  onClick={() => handleDelete(product._id)}
                  style={{ background: "red", color: "white" }}
                >
                  🗑 
                </button> </td></>)}
             
            </tr>
          ))}
        </tbody>
      </table>
   

    {/* Pagination Controls */}
      <div>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
      <button className="register-button" onClick={generatePDF} style={{ marginBottom: "10px" }}>
  Download PDF
</button>



      {/* ✅ Modal Styling */}
      <style>
        {`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index:100;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          text-align: center;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-content input {
          width: 100%;
          padding: 10px;
          margin: 5px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

      
.modal-buttons {
  display: flex; /* Align buttons horizontally */
  justify-content: center; /* Center the buttons */
  gap: 10px; /* Add space between buttons */
  margin-top: 10px;
}

.modal-buttons button {
  padding: 10px 15px; /* Add padding for proper spacing */
  min-width: 100px; /* Set a minimum width to prevent text overflow */
  text-align: center; /* Ensure text is centered */
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden; /* Hide any overflow content */
 border: 1px solid black;
  cursor: pointer;
  border-radius: 5px;
}

.cancel-btn {
  background: black;
  color: white;
}

.update-btn {
  background: white;
  color: black;
 border: 1px solid black;
}
        `}
      </style>
    </div>
  );
}

export default Products;
