import axios from "axios";
export const getProducts = () => {
    return axios.get("http://localhost:5003/api/products");
};

export const getPurchaseOrders = (token) => {
    return axios.get("http://localhost:5003/api/purchase-orders", {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createPurchaseOrder = (orderData, token) => {
    return axios.post("http://localhost:5003/api/purchase-orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
