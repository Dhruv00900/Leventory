import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BillHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error('❌ No token found! Please log in.');
          return;
        }

        const res = await axios.get("http://localhost:5003/api/bills/me/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBills(res.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch bill history', error);
        setError('❌ Error fetching bill history');
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const filteredAndSortedBills = bills
    .filter(bill =>
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortBy === "total") {
        return sortOrder === "asc"
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSortedBills.length / itemsPerPage);
  const paginatedBills = filteredAndSortedBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bill History</h2>

      {/* Search and Sort Controls */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Search by customer name..."
          className="border p-2 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className="flex items-center gap-2">
          <label>Sort by:</label>
          <select
            className="border p-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="total">Total Amount</option>
          </select>
          <button
            className="border p-2"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {paginatedBills.length === 0 ? (
        <p>No bills available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Customer</th>
                <th className="border px-4 py-2">Date & Time </th>
                <th className="border px-4 py-2">Total</th>
                <th className="border px-4 py-2">Items</th>
                <th className='border px-4 py-2'></th>
              </tr>
            </thead>
            <tbody>
              {paginatedBills.map((bill) => (
                <tr key={bill._id}>
                  <td className="border px-4 py-2">{bill.customerName}</td>
                  <td className="border px-4 py-2">{new Date(bill.date).toLocaleString()}</td>
                  <td className="border px-4 py-2">₹{bill.totalAmount}</td>
                  <td className="border px-4 py-2">
                    <ul className="list-none">
                      {bill.products.map((item, index) => (
                        <li key={index}>
                          {item.name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewBill(bill)}
                      className="border px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      View Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="border px-3 py-1 rounded"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`border px-3 py-1 rounded ${currentPage === i + 1 ? "bg-gray-300 font-bold" : ""}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="border px-3 py-1 rounded"
            >
              Next
            </button>
          </div>

          {/* Modal View for Selected Bill */}
          {selectedBill && (
            <div className="full-bill-modal-overlay fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="full-bill-modal-content bg-white p-6 rounded shadow-lg w-full max-w-2xl">
                <div style={{ fontFamily: "monospace", fontSize: "14px" }}>
                  <div style={{ textAlign: "center", marginBottom: "10px" }}>
                    <h3>Inventory System</h3>
                    <p>Algari Trading - Rajkot, Gujarat</p>
                    <p>Tel: 0281-22773000</p>
                    <strong>Invoice</strong>
                  </div>
                  <div>
                    <p><strong>Customer:</strong> {selectedBill.customerName}</p>
                    <p><strong>Date:</strong> {new Date(selectedBill.date).toLocaleString()}</p>
                    <p><strong>Generated By:</strong> {selectedBill.generatedBy}</p>
                  </div>
                  <hr />
                  <table style={{ width: "100%", textAlign: "left" }}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.products.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>Rs.{item.price}</td>
                          <td>Rs.{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <hr />
                  <p style={{ textAlign: "right" }}>
                    <strong>Grand Total: Rs.{selectedBill.totalAmount}</strong>
                  </p>
                  <hr />
                  <p style={{ textAlign: "center" }}>Thank you for your purchase!</p>

                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button className="border px-4 py-1 mr-2" onClick={() => window.print()}>Print</button>
                    <button className="border px-4 py-1" onClick={() => setSelectedBill(null)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillHistory;
