import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import Home from './pages/Home.js';
import Login from './pages/auth/Login.js'
import Register from './pages/auth/Register.js';
import ProtectedRoutes from './protectedRoutes.js';
import UserList from './pages/UserList.js';
import AddProduct from './pages/AddProduct.js';
import Layout from './components/Layout.js';
import Products from './pages/Products.js';
import Settings from './pages/Settings.js';
import AdminOrder from './pages/AdminOrder.js';
import PurchaseOrder from './pages/PurchaseOrder.js';
import SellProducts from './pages/SellProducts.js';
import BillHistory from './pages/BillHistory.js';
import UserTransactions from "./pages/UserTransactions.js";
import BillPreview from './pages/BillPreview.js';
import SupplierManagement from './pages/SupplierManagement.js';
function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} /> 

      <Routes>
        {/* Public Routes */}
        <Route path="*" element={<h2>404 Page Not Found</h2>} />
        <Route path="/" element={<Login />} />

        {/* ✅ Restrict Register Page to Admin Only */}
        <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ✅ Protected Routes Wrapped with Layout */}
          <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/sellProducts" element={<SellProducts />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/purchase-order" element={<PurchaseOrder />} />
          <Route path="/suppliers" element={<AdminOrder />} />
          <Route path="/bills" element={<BillHistory/>} /> 
          <Route path="/suppliers" element={<SupplierManagement/>} />

       
                  
                  
          {/* ✅ Admin-Only Routes */}
          <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
            <Route path="/addProduct" element={<AddProduct />} />
            <Route path="/user-list" element={<UserList />} />
            <Route path="/user-transactions/:generatedBy" element={<UserTransactions />} />
            <Route path="/bill/:id" element={<BillPreview />} />

            <Route path="/admin-order" element={<AdminOrder />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
