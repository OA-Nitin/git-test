import React from 'react';
import './ReportStyle.css';
import { getAssetPath } from '../../utils/assetUtils';

/**
 * PageContainer - A reusable container component for page layouts
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The title of the page
 * @param {React.ReactNode} props.children - The content to render inside the container
 * @param {string} props.titleIcon - Optional path to the icon image to display next to the title
 * @param {boolean} props.fullWidth - Whether the container should take full width
 * @param {string} props.className - Additional CSS classes to apply to the container
 * @returns {JSX.Element} - The PageContainer component
 */
const PageContainer = ({
  title,
  children,
  titleIcon = 'assets/images/Knowledge_Ceter_White.svg',
  fullWidth = false,
  className = ''
}) => {
  return (
    <div className="main_content_iner">
      <div className="container-fluid p-0">
        <div className="row justify-content-center">
          <div className={`${fullWidth ? 'col-12' : 'col-lg-12'}`}>
            <div className={`white_card card_height_100 mb_30 ${className}`}>
              <div className="white_card_header">
                <div className="box_header m-0 new_report_header">
                  <div className="title_img">
                    {titleIcon && (
                      <img
                        src={getAssetPath(titleIcon)}
                        className="page-title-img"
                        alt=""
                      />
                    )}
                    <h4 className="text-white">{title}</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
