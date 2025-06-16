import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/header-dropdown.css';
import '../assets/css/header-logout-button.css';
import { getAssetPath } from '../utils/assetUtils';

const Header = ({ user, onLogout }) => {
  //console.log('Header - user data:', user);
  return (
    <div id="wpadminbar" className="nojq header_iner">
      <div className="quicklinks" id="wp-toolbar" role="navigation" aria-label="Toolbar">
        {/* <ul id="wp-admin-bar-root-default" className="ab-top-menu">
          <li className="">
            <Link to="/send-lead" className="send_doc">
              <span><img src={getAssetPath('assets/images/send_lead.svg')} alt="Send Lead" /></span>
              Send Lead
            </Link>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Link to="/create-sales-user" className="send_doc">
              <span><img src={getAssetPath('assets/images/send_lead.svg')} alt="Create Sales User" /></span>
              Create Sales User
            </Link>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Link to="/affiliate-form" className="send_doc">
              <span><img src={getAssetPath('assets/images/send_lead.svg')} alt="Affiliate Form" /></span>
              Affiliate Form
            </Link>
          </li>
        </ul> */}
        <div id="wpadminbar" className="d-flex justify-content-end">
          <ul id="wp-admin-bar-top-secondary" className="ab-top-secondary ab-top-menu d-flex align-items-center">
            {/* User Profile Dropdown */}
            <li
              id="wp-admin-bar-my-account"
              className="menupop with-avatar profile_info"
            >
              <a
                className="ab-item"
                aria-haspopup="true"
                href="#"
              >
                Welcome, <span className="display-name">{user?.display_name || user?.username || 'User'}</span>
              </a>
              <div className="ab-sub-wrapper profile_info_iner">
                <ul id="wp-admin-bar-user-actions" className="ab-submenu profile_info_details">
                  <li id="wp-admin-bar-myProfile">
                    <Link
                      className="ab-item"
                      to="/my-profile"
                    >
                      Account Settings
                    </Link>
                  </li>
                  <li id="wp-admin-bar-logout">
                    <button
                      className="ab-item"
                      onClick={onLogout}
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            </li>

            {/* Logout Button with Icon */}
            <li className="d-flex align-items-center ms-3">
              <button
                className="logout-button-icon-only"
                onClick={onLogout}
                title="Logout"
              >
                <img src={getAssetPath('assets/images/logout-icon.svg')} alt="Logout" width="16" height="16" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
