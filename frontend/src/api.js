import axios from "axios";

const API = process.env.REACT_APP_API_URL; // 📢 Pull from environment variable

export const getProducts = () => {
    return axios.get(`${API}/api/products`);
};

export const getPurchaseOrders = (token) => {
    return axios.get(`${API}/api/purchase-orders`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createPurchaseOrder = (orderData, token) => {
    return axios.post(`${API}/api/purchase-orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
