// src/components/Sidebar.js
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/sidebar.css';
import { menuData as defaultMenuData } from './menuData';
import opsMenuData from './opsmenuData';
import financeMenuData from './financemenuData';
import { getAssetPath } from '../utils/assetUtils';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const menuRef = useRef(null);
  const [sidebarMenu, setSidebarMenu] = useState(defaultMenuData);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);

    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        console.log('Parsed user data:', parsedData);

        // Access the roles from the correct nested path based on the JSON structure
        let userRoles = [];

        if (parsedData.data &&
            parsedData.data.user &&
            Array.isArray(parsedData.data.user.roles)) {
          userRoles = parsedData.data.user.roles;
          console.log('Found roles in data.user.roles:', userRoles);
        }

        // Set menu data based on user role
        if (userRoles.includes('master_ops')) {
          console.log('Loading ops menu for master_ops role');
          setSidebarMenu(opsMenuData);
        } else if (userRoles.includes('echeck_client')) {
          console.log('Loading finance menu for echeck_client role');
          setSidebarMenu(financeMenuData);
        } else {
          console.log('No matching role found, loading default menu');
          setSidebarMenu(defaultMenuData);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setSidebarMenu(defaultMenuData);
      }
    } else {
      console.log('No user data found in localStorage');
    }
  }, []);

  // Effect to initialize MetisMenu after menu data changes
  useEffect(() => {
    console.log('Menu data changed, initializing MetisMenu...');

    // Wait for the DOM to update with the new menu data
    const timer = setTimeout(() => {
      if (window.$ && window.$.fn && window.$.fn.metisMenu) {
        try {
          console.log('Sidebar: Initializing MetisMenu after menu data change');

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
          window.$('#adminmenu li a').each(function() {
            const link = window.$(this).attr('href');
            if (link && currentPath.includes(link) && link !== '/') {
              window.$(this).addClass('active');
              window.$(this).parents('li').addClass('mm-active');
              window.$(this).parents('ul.mm-collapse').addClass('mm-show');
            }
          });
        } catch (error) {
          console.error('Error initializing MetisMenu from Sidebar component:', error);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [sidebarMenu, currentPath]); // Re-run when menu data or current path changes

  // No longer forcing Projects menu to be always expanded
  // Now it behaves the same as Reports menu

  // Render
  return (
    <div id="adminmenumain" className="sidebar ps ps--active-y">
      <div id="adminmenuwrap">
        <div className="logo d-flex justify-content-between">
          <Link className="large_logo" to="/dashboard">
            <img src={getAssetPath('assets/images/logo-blue-360.svg')} alt="Occams Logo" />
          </Link>
        </div>
        <ul id="adminmenu" className="metismenu" ref={menuRef}>
          {sidebarMenu.map(item => {
            const isActiveTop = item.path
              ? currentPath === item.path || currentPath === item.path + '/'
              : item.children?.some(c => currentPath.startsWith(c.path));

            return (
              <li
                key={item.key}
                id={`menu-item-${item.key}`}
                className={[
                  'wp-first-item menu-top',
                  item.children ? 'wp-has-submenu' : `toplevel_page_${item.key}`,
                  isActiveTop ? 'mm-active' : ''
                ].join(' ')}
              >
                {item.children ? (
                  <a
                    href="javascript:void(0)"
                    onClick={(e) => e.preventDefault()}
                    className={[
                      'wp-has-submenu menu-top',
                      isActiveTop ? 'wp-has-current-submenu' : 'wp-not-current-submenu'
                    ].join(' ')}
                    aria-haspopup="true"
                  >
                    <div className="wp-menu-arrow"><div/></div>
                    <div className={`wp-menu-image dashicons-before ${item.icon}`} aria-hidden="true"/>
                    <div className="wp-menu-name">{item.name}</div>
                    <span className="menu-arrow">&rsaquo;</span>
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    className={[
                      'wp-first-item menu-top',
                      isActiveTop ? 'wp-has-current-submenu' : 'wp-not-current-submenu'
                    ].join(' ')}
                    aria-expanded="false"
                  >
                    <div className="wp-menu-arrow"><div/></div>
                    <div className={`wp-menu-image dashicons-before ${item.icon}`} aria-hidden="true"/>
                    <div className="wp-menu-name">{item.name}</div>
                  </Link>
                )}

                {item.children && (
                  <ul className="mm-collapse">
                    <li className="wp-submenu-head" aria-hidden="true">{item.name}</li>
                    {item.children.map(child => {
                      const isChildActive = currentPath === child.path;
                      return (
                        <li key={child.key} className={isChildActive ? 'current wp-first-item' : 'wp-first-item'}>
                          <Link to={child.path} className={isChildActive ? 'current' : ''}>
                            {child.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
