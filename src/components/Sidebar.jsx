// src/components/Sidebar.js
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/sidebar.css';
import { menuData } from './menuData';
import { getAssetPath } from '../utils/assetUtils';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const menuRef = useRef(null);

  // 4. Render
  return (
    <div id="adminmenumain" className="sidebar ps ps--active-y">
      <div id="adminmenuwrap">
        <div className="logo d-flex justify-content-between">
          <Link className="large_logo" to="/dashboard">
            <img src={getAssetPath('assets/images/logo-blue-360.svg')} alt="Occams Logo" />
          </Link>
        </div>
        <ul id="adminmenu" className="metismenu" ref={menuRef}>
          {menuData.map(item => {
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
                    href="#!"
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
