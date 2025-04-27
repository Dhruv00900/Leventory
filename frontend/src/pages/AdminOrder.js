import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AdminOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newOrder, setNewOrder] = useState({ productName: "", quantity: "", price: "", shippingAddress: "" });
  const [selectedSuppliers, setSelectedSuppliers] = useState({}); // Store selected supplier for each order
  const [suppliers, setSuppliers] = useState([]); // List of suppliers

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthenticated = !!token;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You must be logged in as an admin.");
      navigate("/login");
    } else {
      fetchOrders();
      fetchSuppliers();
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("http://localhost:5003/api/purchase-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders");
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get("http://localhost:5003/api/supplierManage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(data); // Assuming your backend provides suppliers list
    } catch (err) {
      toast.error("Failed to fetch suppliers");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5003/api/purchase-orders/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Order ${status}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleSendToSupplier = (order) => {
    const supplierId = selectedSuppliers[order._id];
    const supplier = suppliers.find(s => s._id === supplierId);
  
    if (!supplier) {
      return toast.error("Please select a supplier.");
    }
  
    // Ensure the phone number exists
    if (!supplier.contact || supplier.contact.trim() === "") {
      return toast.error("Supplier does not have a valid phone number.");
    }
  
    // Clean the phone number by removing spaces or non-numeric characters (except the '+' sign)
    let phoneNumber = supplier.contact.replace(/[^0-9+]/g, "").trim();
  
    console.log("Cleaned Phone Number: ", phoneNumber); // Debug log
  
    // If the number starts with +91, no change needed
    if (!phoneNumber.startsWith("+91")) {
      // Prepend +91 if the number doesn't already start with it
      phoneNumber = "+91" + phoneNumber.replace(/^(\+?\d{0,2})?(\d{10})$/, "$2");
      console.log("Modified Phone Number: ", phoneNumber); // Debug log
    }
  
    // Validate the phone number length (must be exactly 13 digits: +91 + 10 digits)
    if (phoneNumber.length !== 13 || !/^\+91\d{10}$/.test(phoneNumber)) {
      console.error("Invalid Phone Number Format", phoneNumber); // Debug log
      return toast.error("Invalid phone number format. Ensure it's a valid Indian number starting with +91.");
    }
  
    // Properly encode the message content
    const message = encodeURIComponent(
      `Hello ${supplier.name},\n\nNew Order:\nProduct: ${order.productName}\nQuantity: ${order.quantity}\nShipping Address: ${order.shippingAddress}\nPlease process this order.`
    );
  
    // Generate the WhatsApp URL with the phone number starting with +91
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, "_blank");
  
    handleStatusChange(order._id, "sent_to_seller");
  };
  
  

  const handleCreateOrder = async () => {
    const { productName, quantity, price, shippingAddress } = newOrder;
    if (!productName || !quantity || !price || !shippingAddress) {
      return toast.error("All fields are required");
    }

    try {
      const res = await axios.post("http://localhost:5003/api/purchase-orders", newOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order created successfully");
      setOrders((prev) => [...prev, res.data]);
      setNewOrder({ productName: "", quantity: "", price: "", shippingAddress: "" });
    } catch {
      toast.error("Failed to create order");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin - Manage Purchase Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <>
          {orders.length === 0 ? (
            <p>No purchase orders available.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
                <p><strong>Product:</strong> {order.productName || "N/A"}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Shipping:</strong> {order.shippingAddress}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Created By:</strong> {order.createdBy?.name || "Admin"}</p>

                {order.status === "pending" && (
                  <div>
                    <button onClick={() => handleStatusChange(order._id, "approved")} style={{ marginRight: "10px" }}>
                      Approve
                    </button>
                    <button onClick={() => handleStatusChange(order._id, "rejected")} style={{ marginRight: "10px" }}>
                      Reject
                    </button>

                    {/* Supplier Selection and Send to Supplier */}
                    <div style={{ marginTop: "10px" }}>
                      <select
                        value={selectedSuppliers[order._id] || ""}
                        onChange={(e) => setSelectedSuppliers(prev => ({ ...prev, [order._id]: e.target.value }))}
                        style={{ marginRight: "10px" }}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleSendToSupplier(order)}
                        style={{ backgroundColor: "#007bff", color: "white" }}
                      >
                        Send via WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <h3>Create New Purchase Order</h3>
          <input
            type="text"
            placeholder="Product Name"
            value={newOrder.productName}
            onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newOrder.quantity}
            onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newOrder.price}
            onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="Shipping Address"
            value={newOrder.shippingAddress}
            onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })}
          />
          <button onClick={handleCreateOrder} style={{ marginTop: "10px" }}>
            Create Order
          </button>
        </>
      )}
    </div>
  );
};

export default AdminOrder;
