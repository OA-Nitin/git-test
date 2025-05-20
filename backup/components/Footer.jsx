import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div id="wpfooter" role="contentinfo">
      <p id="footer-left" className="alignleft">
        <span id="footer-thankyou-aff" className="footer-copyright">
          Copyright © {currentYear} occamsadvisory. All rights reserved.
        </span>
      </p>
      <p id="footer-upgrade" className="alignright"></p>
      <div className="clear"></div>
    </div>
  );
};

export default Footer;
