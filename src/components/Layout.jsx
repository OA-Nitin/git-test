import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { getAssetPath } from '../utils/assetUtils';

const Layout = ({ children }) => {
  // Retrieve user data from localStorage
  const [userData] = useState(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('Layout - parsed user data:', parsedData);

        // Extract user data from the nested structure based on the exact JSON format
        if (parsedData.data && parsedData.data.user) {
          console.log('Layout - found user data in data.user:', parsedData.data.user);
          return parsedData.data.user;
        }

        return parsedData;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return {};
      }
    }
    return {};
  });



  const handleLogout = () => {
    localStorage.clear(); // Clear localStorage

    // Get the base path from our utility function
    const basePath = import.meta.env.BASE_URL || '/';

    // Use window.location for a full page reload with the correct base path
    window.location.href = basePath;
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
