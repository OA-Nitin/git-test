import React from 'react';

const FulfilmentTab = ({ fulfilmentData, setFulfilmentData, fulfilmentLoading, fulfilmentError }) => {
  return (
    <div className="mb-4 left-section-container">
      {/* Input Section */}
      <h5 className="section-title">Input</h5>
      {/* Display loading state */}
      {fulfilmentLoading && (
        <div className="text-center my-5">
          <svg class="loader" viewBox="0 0 200 100">
            <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#007bff" />
            <stop offset="100%" stop-color="#ff6600" />
            </linearGradient>
            </defs>
            <path class="infinity-shape"
                  d="M30,50
                    C30,20 70,20 100,50
                    C130,80 170,80 170,50
                    C170,20 130,20 100,50
                    C70,80 30,80 30,50"
                />
          </svg>
          <p style={{color: '#000'}}>Processing data...</p>
        </div>
      )}

      {/* Display error state */}
      {fulfilmentError && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>API Error:</strong> {fulfilmentError}
          <button type="button" className="btn-close" onClick={() => setFulfilmentError(null)} aria-label="Close"></button>
        </div>
      )}

        {!fulfilmentLoading && (
          <>

            {/* Annual Income Section */}
            <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
              Annual Income
            </h6>
        
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">2019 Income</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.income_2019}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, income_2019: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">2020 Income</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.income_2020}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, income_2020: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">2021 Income</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.income_2021}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, income_2021: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Bank Information Section */}
            <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
              Bank Information
            </h6>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.bank_name}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, bank_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Account Holder Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.account_holder_name}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, account_holder_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.account_number}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, account_number: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Routing Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.aba_routing_no}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, aba_routing_no: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Output Section */}
            <h5 className="section-title mt-4">Output</h5>

            {/* STC Amount Section */}
            <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
              STC Amount
            </h6>
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">2020 STC Amount</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.stc_amount_2020}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, stc_amount_2020: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">2021 STC Amount</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.stc_amount_2021}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, stc_amount_2021: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Credit Amount & Fee Section */}
            <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">
              Credit Amount & Fee
            </h6>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Maximum Credit</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.maximum_credit}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, maximum_credit: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Actual Credit</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.actual_credit}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, actual_credit: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Estimated Fee</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.estimated_fee}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, estimated_fee: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Actual Fee</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fulfilmentData.actual_fee}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, actual_fee: e.target.value})}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">Years</label>
                  <select
                    className="form-select"
                    value={fulfilmentData.years}
                    onChange={(e) => setFulfilmentData({...fulfilmentData, years: e.target.value})}
                  >
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2020,2021">2020,2021</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
        
    </div>
  );
};

export default FulfilmentTab; 