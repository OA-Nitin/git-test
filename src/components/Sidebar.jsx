// src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/sidebar.css';
import { menuData } from './menuData';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 1. Build initial expanded state (only for items with children)
  const [expandedMenus, setExpandedMenus] = useState(() => {
    return menuData.reduce((acc, item) => {
      if (item.children) acc[item.key] = false;
      return acc;
    }, {});
  });

  // 2. Auto-expand menus if currentPath matches any child path
  useEffect(() => {
    const newExpanded = { ...expandedMenus };
    menuData.forEach(item => {
      if (item.children) {
        newExpanded[item.key] = item.children.some(child => currentPath.startsWith(child.path));
      }
    });
    setExpandedMenus(newExpanded);
  }, [currentPath]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Toggle expand/collapse
  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 4. Render
  return (
    <div id="adminmenumain" className="sidebar ps ps--active-y">
      <div id="adminmenuwrap">
        <div className="logo d-flex justify-content-between">
          <Link className="large_logo" to="/dashboard">
            <img src="/assets/images/logo-blue-360.svg" alt="Occams Logo" />
          </Link>
        </div>
        <ul id="adminmenu" className="metismenu">
          {menuData.map(item => {
            const isActiveTop = item.path
              ? currentPath === item.path || currentPath === item.path + '/'
              : item.children?.some(c => currentPath.startsWith(c.path));

            return (
              <li
                key={item.key}
                className={[
                  'wp-first-item menu-top',
                  item.children ? 'wp-has-submenu' : `toplevel_page_${item.key}`,
                  isActiveTop ? 'mm-active' : ''
                ].join(' ')}
              >
                {item.children ? (
                  <a
                    href="#!"
                    onClick={e => { e.preventDefault(); toggleMenu(item.key); }}
                    className={[
                      'wp-has-submenu menu-top',
                      isActiveTop ? 'wp-has-current-submenu' : 'wp-not-current-submenu'
                    ].join(' ')}
                    aria-haspopup="true"
                    aria-expanded={expandedMenus[item.key]}
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
                  <ul className={`wp-submenu wp-submenu-wrap ${expandedMenus[item.key] ? 'mm-show' : 'mm-collapse'}`}>
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
