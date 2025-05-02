import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  // Retrieve user data from localStorage
  const [userData] = useState(() => {
    const storedData = localStorage.getItem("user");
    return storedData ? JSON.parse(storedData) : {};
  });



  const handleLogout = () => {
    localStorage.clear(); // Clear localStorage
    // Show a message instead of redirecting
    window.location.href = '/'; // Use window.location for a full page reload
  };

  return (
    <div id="wpwrap">
      <Sidebar />
      <div id="wpcontent" className="main_content dashboard_part large_header_bg">
        <input type="hidden" id="notification_count" value="5" />
        <Header user={userData} onLogout={handleLogout} />

        <div id="wpbody" role="main">
          <div id="wpbody-content">
            {children}
            <div className="clear"></div>
          </div>
          <div className="clear"></div>
        </div>
        <div className="clear"></div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
