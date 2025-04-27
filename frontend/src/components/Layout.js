import React, { useState } from 'react';
import Sidebar from './Sidebar.js';
import Footer from './Footer.js';
import Navbar from './Navbar.js';
import { Outlet } from 'react-router-dom';
import './layout.css';

function Layout() {
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Add search state

  return (
    <>
      <div className='container'>
        <div className='main-container'>
          {/* Pass `setSearchQuery` to Navbar */}
          <Navbar setSearchQuery={setSearchQuery} />
          <Sidebar />
          {/* ✅ Pass `searchQuery` to all pages */}
          <div className='content'>
            <Outlet context={[searchQuery]} />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Layout;
