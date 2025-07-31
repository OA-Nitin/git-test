import React from 'react';

const InvoiceHeader = () => {
  return (
    <div>
    <div className="invoice-header">
        <div className="row">
            <div className="col-md-3">
                <h4>INVOICE</h4>
            </div>
            <div className="col-md-9 text-end">
                <img src="https://occamsadvisory.com/wp-content/uploads/2023/09/Occams_Logo_SVG.svg" alt="" />
            </div>
        </div>

        <div className="row mt-3">
            <div className="col-md-3">
                <h6 className="merchant_name">Occams Advisory Inc </h6>
                <p className="merchant_business_name">Occams Advisory Inc </p>
                <p className="invoice-header-address merchant_address">
                    2170 Main Street Ste 203<br/>
                    Sarasota, FL 34237
                </p>
              
                
            </div>
            <div className="col-md-4">
                <p className="company-information">
                    <a className="merchant_email" href="mailto:finance@occamsadvisory.com">finance@occamsadvisory.com</a>
                </p>
                <p className="company-information">
                    <a className="merchant_phone" href="tel:2125311111">+1 (212)531-1111</a>
                </p>
                <p className="company-information">
                    <a href="javascript:void(0)">www.occamsadvisory.com</a>
                </p>
            </div>
        </div>
    </div>
    </div>
  );
};

export default InvoiceHeader;
