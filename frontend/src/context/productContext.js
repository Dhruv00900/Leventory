import React, { createContext, useState, useEffect } from "react";

// Create Context
export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]); // Store product list
  const API = process.env.REACT_APP_API_URL;
  // ✅ Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API}/api/products`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch products");

      setProducts(data.products || []);
    } catch (error) {
      console.error("❌ Error fetching products:", error.message);
    }
  };

  // ✅ Function to add a new product
  const addProduct = async (newProduct) => {
    try {
      const token = localStorage.getItem("token"); // Get token for auth
      if (!token) throw new Error("Unauthorized: No token found");

      const response = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include Auth Token
        },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error adding product");

      // ✅ Update state only if the product is successfully added
      if (data.product) {
        setProducts((prevProducts) => [...prevProducts, data.product]);
        console.log("✅ Product added successfully:", data.product);
      }
    } catch (error) {
      console.error("❌ Error adding product:", error.message);
    }
  };
  const generateBill = async (billDetails) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
  
      const response = await fetch(`${API}/api/bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(billDetails),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
  
      // Update products state with updated products
      setProducts(data.updatedProducts);
      return data.bill;
    } catch (error) {
      console.error("❌ Error generating bill:", error.message);
      throw error;
    }
  };
  

  return (
    <ProductContext.Provider value={{ products, addProduct,generateBill }}>
      {children}
    </ProductContext.Provider>
  );
};
