import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./PurchaseOrder.css";

const PurchaseOrder = () => {
  const [userOrders, setUserOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [order, setOrder] = useState({
    productName: "",
    quantity: "",
    shippingAddress: "",
    sellerName: "",
    orderDate: new Date().toISOString().split("T")[0],
  });
  const [products, setProducts] = useState([]); // Ensure it's an array
  const [isNewProduct, setIsNewProduct] = useState(false); // Toggle for new or existing product
  const API = process.env.REACT_APP_API_URL;

  // Fetch user orders
  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API}/api/purchase-orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserOrders(res.data);
    } catch (err) {
      toast.error("Failed to load orders");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productsData = res.data.products || res.data.data;
      if (Array.isArray(productsData)) {
        // Validate if each product has a 'name' field
        const validProducts = productsData.filter(product => product.name);
        setProducts(validProducts); // Only set products if valid
      } else {
        toast.error("Products data is not in the correct format.");
        setProducts([]); // Reset to empty array on invalid data format
      }
    } catch (err) {
      toast.error("Failed to fetch products");
      setProducts([]); // Reset to empty array on error
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Handle order form input changes
  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  // Handle product selection (for existing products)
  const handleProductSelect = (e) => {
    setOrder({ ...order, productName: e.target.value });
  };

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Form validation for quantity and shipping address
    if (!order.productName || !order.quantity || !order.shippingAddress) {
      toast.error("All fields are required.");
      return;
    }

    try {
      await axios.post(`${API}/api/purchase-orders`, order, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order created!");
      setOrder({
        productName: "",
        quantity: "",
        shippingAddress: "",
        sellerName: "",
        orderDate: new Date().toISOString().split("T")[0],
      });
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order");
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `${API}/api/purchase-orders/cancel/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success("Order cancelled successfully");
      fetchOrders(); // Reload orders after cancellation
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  // Toggle between new product and existing product selection
  const handleNewProductToggle = () => {
    setIsNewProduct(!isNewProduct);
    setOrder({
      ...order,
      productName: "", // Reset productName when switching modes
    });
  };

  return (
    <div className="purchase-order">
      <h2>My Purchase Orders</h2>
      <button onClick={() => setShowModal(true)}>+ Create Order</button>

      {/* Orders Table */}
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Ordered On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userOrders.map((order) => (
            <tr key={order._id}>
              <td>{order.productName}</td>
              <td>{order.quantity}</td>
              <td>
                <span className={`status ${order.status}`}>{order.status}</span>
              </td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>
                {order.status === "pending" && (
                  <button onClick={() => handleCancelOrder(order._id)}>
                    Cancel Order
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Create Purchase Order</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>
                  Select Product
                  <select
                    name="productName"
                    value={order.productName}
                    onChange={handleProductSelect}
                    disabled={isNewProduct}
                  >
                    <option value="">Select Product</option>
                    {products.length > 0 && products.map((product) => (
                      <option key={product._id} value={product.name}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={handleNewProductToggle}>
                  {isNewProduct ? "Select Existing Product" : "Add New Product"}
                </button>
              </div>

              {/* New Product Name Input */}
              {isNewProduct && (
                <div>
                  <input
                    type="text"
                    name="productName"
                    value={order.productName}
                    onChange={handleChange}
                    placeholder="New Product Name"
                    required
                  />
                </div>
              )}

              {/* Quantity Input */}
              <input
                type="number"
                name="quantity"
                value={order.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                required
              />

              {/* Shipping Address Input */}
              <input
                type="text"
                name="shippingAddress"
                value={order.shippingAddress}
                onChange={handleChange}
                placeholder="Shipping Address"
                required
              />

              {/* Seller Name Input */}
              <input
                type="text"
                name="sellerName"
                value={order.sellerName}
                onChange={handleChange}
                placeholder="Seller Name (Optional)"
              />

              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
