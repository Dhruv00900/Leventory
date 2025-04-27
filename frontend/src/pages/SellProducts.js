import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './sellProducts.css';

const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);
const validateName = (name) => /^[A-Za-z\s]+$/.test(name);

const user = JSON.parse(localStorage.getItem('user'));
const generatedBy = user?.name || "Unknown User";

const SellProducts = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([{ productName: '', quantity: '', price: 0 }]);
  const [searchTerms, setSearchTerms] = useState(['']);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(null);
  const billRef = useRef();
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API}/api/products`);
        if (Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else throw new Error('Invalid products format');
      } catch (err) {
        setError('Failed to load products: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addItem = () => {
    setItems([...items, { productName: '', quantity: '', price: 0 }]);
    setSearchTerms([...searchTerms, '']);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    const updatedSearch = [...searchTerms];
    updatedItems.splice(index, 1);
    updatedSearch.splice(index, 1);
    setItems(updatedItems);
    setSearchTerms(updatedSearch);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
  
    if (field === 'productName') {
      const selected = products.find(p => p.name === value);
      updatedItems[index] = {
        ...updatedItems[index],
        productName: value,
        price: selected?.price || 0,
        maxStock: selected?.quantity || 0,
        quantity: ''  // Reset quantity when product is changed
      };
    } else if (field === 'quantity') {
      // If the value is an empty string (backspace pressed), set quantity to empty
      if (value === '') {
        updatedItems[index].quantity = '';
      } else {
        const qty = Math.max(1, parseInt(value) || 0);
        const max = updatedItems[index].maxStock || 0;
        updatedItems[index].quantity = qty > max ? max : qty;
      }
    } else {
      updatedItems[index][field] = value;
    }
  
    setItems(updatedItems);
  };
  

  const handleSearchChange = (index, value) => {
    const updatedSearch = [...searchTerms];
    updatedSearch[index] = value;
    setSearchTerms(updatedSearch);
  };

  const getFilteredProducts = (index) => {
    const term = searchTerms[index]?.toLowerCase() || '';
    return products.filter(p => p.name.toLowerCase().includes(term));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBill(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to perform this action.');
      return;
    }

    if (!validateName(customerName)) {
      setError('Customer name must only contain letters and spaces.');
      return;
    }

    if (!validatePhone(customerPhone)) {
      setError('Phone number must be 10 digits starting with 6-9.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].quantity > items[i].maxStock) {
        setError(`You cannot order more than ${items[i].maxStock} of "${items[i].productName}".`);
        return;
      }
    }

    const formattedItems = items
      .map(item => {
        const product = products.find(p => p.name === item.productName);
        return product ? {
          productId: product._id,
          quantity: parseInt(item.quantity),
        } : null;
      })
      .filter(item => item && item.quantity > 0 && !isNaN(item.quantity));

    if (formattedItems.length === 0) {
      setError('No valid items selected to sell.');
      return;
    }

    try {
      const response = await axios.post(
        `${API}/api/sell`,
        {
          customerName,
          customerPhone,
          items: formattedItems,
          generatedBy
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      setBill(response.data.bill);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handlePrint = () => {
    const printContents = billRef.current.innerHTML;
    const original = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const billContent = billRef.current;

    html2canvas(billContent).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 10, 10, 180, 160);
      doc.save('bill.pdf');
    });
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="sell-products">
      <h2>Sell Products</h2>
      <form onSubmit={handleSubmit}>
        <label>Customer Name:</label>
        <input
          value={customerName}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^[A-Za-z\s]+$/.test(val)) setCustomerName(val);
          }}
          required
          placeholder="Only alphabets"
        />

        <label>Customer Phone:</label>
        <input
          value={customerPhone}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^\d{0,10}$/.test(val)) setCustomerPhone(val);
          }}
          required
          placeholder="10-digit phone"
          style={{ borderColor: customerPhone && !validatePhone(customerPhone) ? 'red' : undefined }}
        />
        {customerPhone && !validatePhone(customerPhone) && <p style={{ color: 'red' }}>Invalid number!</p>}

        <h3>Items</h3>
        {items.map((item, index) => (
          <div key={index}>
            <input
              placeholder="Search product..."
              value={searchTerms[index]}
              onChange={(e) => handleSearchChange(index, e.target.value)}
            />
            <select
              value={item.productName}
              onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {getFilteredProducts(index).map((p) => (
                <option key={p._id} value={p.name} disabled={p.quantity === 0}>
                  {p.name} (Rs.{p.price}) - {p.quantity === 0 ? 'Out of Stock' : `${p.quantity} available`}
                </option>
              ))}
            </select>

            <input type="number" value={item.price} readOnly />

            <input
              type="number"
              min="1"
              max={item.maxStock}
              value={item.quantity}
              placeholder='Qty'
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              required
            />
            {item.maxStock && item.quantity > item.maxStock && (
              <p style={{ color: 'red' }}>Only {item.maxStock} in stock</p>
            )}

            {items.length > 1 && <button type="button" onClick={() => removeItem(index)}>Remove</button>}
          </div>
        ))}
        <button type="button" onClick={addItem}>Add Another Item</button><br /><br />
        <button type="submit">Generate Bill</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {bill && (
        <div ref={billRef} className="bill-container">
          <div style={{
            width: "350px", margin: "40px auto", background: "#fff", padding: "40px 20px",
            fontFamily: "monospace", fontSize: "14px", border: "1px solid #ccc",
            borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.15)"
          }}>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <h3>Inventory System</h3>
              <p>Algari Trading - Rajkot, Gujarat</p>
              <p>Tel: 0281-22773000</p>
              <strong>Invoice</strong>
            </div>
            <div>
              <p><strong>Customer:</strong> {customerName}</p>
              <p><strong>Phone:</strong> {customerPhone}</p>
              <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Generated By:</strong> {generatedBy}</p>
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
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>Rs.{item.price}</td>
                    <td>Rs.{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
            <p style={{ textAlign: "right" }}><strong>Grand Total: Rs.{calculateTotal()}</strong></p>
            <hr />
            <p style={{ textAlign: "center" }}>Thank you for your purchase!</p>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={handlePrint}>Print</button>
            <button onClick={handleDownloadPDF}>Download PDF</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellProducts;
