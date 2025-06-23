import React, { useState, useEffect } from 'react';
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
        //console.log('Layout - parsed user data:', parsedData);

        // Extract user data from the nested structure based on the exact JSON format
        if (parsedData.data && parsedData.data.user) {
          //console.log('Layout - found user data in data.user:', parsedData.data.user);
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

  // Initialize menu after component mounts
  useEffect(() => {
    // Function to initialize MetisMenu
    const initializeMenu = () => {
      if (window.$ && window.$.fn && window.$.fn.metisMenu) {
        try {
          //console.log('Layout: Initializing MetisMenu from React component');

          // First, dispose any existing instance
          if (window.$('#adminmenu').data('metisMenu')) {
            window.$('#adminmenu').metisMenu('dispose');
          }

          // Initialize metisMenu
          window.$('#adminmenu').metisMenu({
            toggle: true,
            preventDefault: false,
            triggerElement: 'a',
            parentTrigger: 'li',
            subMenu: 'ul'
          });

          // Add active class to current menu items
          const currentPath = window.location.pathname;
          window.$('#adminmenu li a').each(function() {
            const link = window.$(this).attr('href');
            if (link && currentPath.includes(link) && link !== '/') {
              window.$(this).addClass('active');
              window.$(this).parents('li').addClass('mm-active');
              window.$(this).parents('ul.mm-collapse').addClass('mm-show');
            }
          });
        } catch (error) {
          console.error('Error initializing MetisMenu from Layout component:', error);
        }
      } else {
        console.warn('jQuery or metisMenu not available yet, retrying...');
        // Retry after a short delay
        setTimeout(initializeMenu, 500);
      }
    };

    // Call initialization with a delay to ensure DOM is ready
    const timer = setTimeout(initializeMenu, 500);

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount


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
