import React, { useState, useEffect } from "react";
import "../pages/style.css";
import "../components/Layout.js";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import "./home.css";
import moment from "moment";

const Home = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [timePeriod, setTimePeriod] = useState("daily");
  const [profit, setProfit] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [range, setRange] = useState("today");
  const [inventoryValue, setInventoryValue] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5003/api/dashboard/top-products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTopProducts(response.data);
      } catch (err) {
        setError("Failed to fetch top products");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  useEffect(() => {
    fetch("http://localhost:5003/api/products")
      .then((res) => res.json())
      .then((responseData) => {
        const allProducts = responseData.products || [];
        setTotalProducts(allProducts.length);

        const lowStock = allProducts
          .filter((product) => product?.quantity !== undefined && Number(product.quantity) < 10)
          .map((product) => ({
            name: product.name || "Unknown",
            quantity: product.quantity || 0,
          }));

        setLowStockData(lowStock);
      })
      .catch((error) => console.error("Error fetching products:", error));

    const token = localStorage.getItem("token");

    fetch("http://localhost:5003/api/dashboard/daily-sales-count", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedData = data.map((item) => ({
            date: moment(item._id).format("YYYY-MM-DD"),
            totalSales: item.count || 0,
          }));
          setSalesData(formattedData);
          setFilteredSalesData(formattedData);
        } else {
          setSalesData([]);
          console.error("Sales data is not an array:", data);
        }
      })
      .catch((error) => console.error("Error fetching sales:", error));
  }, []);

  const filterSalesData = (period) => {
    let filteredData = [];
    if (period === "daily") {
      filteredData = salesData;
    } else if (period === "monthly") {
      filteredData = Object.values(
        salesData.reduce((acc, item) => {
          const month = moment(item.date).format("YYYY-MM");
          if (!acc[month]) acc[month] = { date: month, totalSales: 0 };
          acc[month].totalSales += item.totalSales;
          return acc;
        }, {})
      );
    } else if (period === "yearly") {
      filteredData = Object.values(
        salesData.reduce((acc, item) => {
          const year = moment(item.date).format("YYYY");
          if (!acc[year]) acc[year] = { date: year, totalSales: 0 };
          acc[year].totalSales += item.totalSales;
          return acc;
        }, {})
      );
    }
    setFilteredSalesData(filteredData);
  };

  const handleTimePeriodChange = (event) => {
    const selectedPeriod = event.target.value;
    setTimePeriod(selectedPeriod);
    filterSalesData(selectedPeriod);
  };

  const fetchProfit = async () => {
    const token = localStorage.getItem("token");
    const { data } = await axios.get("http://localhost:5003/api/dashboard/profit-summary", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    setProfit(data);
    console.log("Profit data:", data); 
  };

  const fetchInventoryValue = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:5003/api/dashboard/inventory-value", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setInventoryValue(response.data.totalValue || 0);
    } catch (err) {
      console.error("Error fetching inventory value:", err);
    }
  };

  useEffect(() => {
    fetchProfit();
    fetchInventoryValue();
  }, [range]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-summary">
        <div className="card">
          <h3>Total Products</h3>
          <p style={{ fontSize: "2rem" }}>{totalProducts}</p>
        </div>
        <div className="card">
          <h3>Profit</h3>
          <p style={{ fontSize: "2rem" }}>₹ {profit.profit}</p>
        </div>
        <div className="card">
          <h3>Inventory Value</h3>
          <p style={{ fontSize: "2rem" }}>₹ {inventoryValue}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>Low Stock Products</h3>
          {lowStockData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lowStockData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="red" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No low stock products.</p>
          )}
        </div>

        <div className="chart">
          <div className="time-period-selector">
            <label htmlFor="timePeriod">Select Time Period: </label>
            <select id="timePeriod" value={timePeriod} onChange={handleTimePeriodChange}>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <h3>Sales Overview</h3>
          {filteredSalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredSalesData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalSales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No sales data available.</p>
          )}
        </div>
      </div>

      <div className="top-products">
        <h2 className="section-title">Top Selling Products</h2>
        <div className="product-cards">
          {topProducts.map((product) => (
            <div className="product-card" key={product._id._id}>
              <img
                src={product._id.image || "https://via.placeholder.com/50"}
                alt={product._id.name}
                width="50"
                height="50"
                style={{ objectFit: "cover", borderRadius: "5px" }}
                className="product-image"
              />
              <h3 className="product-name">{product._id.name}</h3>
              <p className="product-sold">Sold: {product.totalSold}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="chart">
        <h3>📆 Daily Sales Count</h3>
        {salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="totalSales" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No sales data available.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
