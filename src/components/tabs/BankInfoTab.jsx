import React from 'react';

const BankInfoTab = ({ bankInfo, setBankInfo, bankInfoLoading, bankInfoError, fetchBankInfo }) => {
  return (
    <div className="mb-4 left-section-container">
      <h5 className="section-title mt-4">Bank Information</h5>
      {bankInfoLoading ? (
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
      ) : bankInfoError ? (
        <div className="alert alert-warning" role="alert">
          {bankInfoError}
          <button
            className="btn btn-sm btn-primary ms-3"
            onClick={fetchBankInfo}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bank Name"
                  value={bankInfo.bank_name}
                  onChange={(e) => setBankInfo({ ...bankInfo, bank_name: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Bank Mailing Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bank Mailing Address"
                  value={bankInfo.bank_mailing_address}
                  onChange={(e) => setBankInfo({ ...bankInfo, bank_mailing_address: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="City"
                  value={bankInfo.city}
                  onChange={(e) => setBankInfo({ ...bankInfo, city: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="State"
                  value={bankInfo.state}
                  onChange={(e) => setBankInfo({ ...bankInfo, state: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Zip</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Zip"
                  value={bankInfo.zip}
                  onChange={(e) => setBankInfo({ ...bankInfo, zip: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Country"
                  value={bankInfo.country}
                  onChange={(e) => setBankInfo({ ...bankInfo, country: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Bank Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bank Phone"
                  value={bankInfo.bank_phone}
                  onChange={(e) => setBankInfo({ ...bankInfo, bank_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Account Holder Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Account Holder Name"
                  value={bankInfo.account_holder_name}
                  onChange={(e) => setBankInfo({ ...bankInfo, account_holder_name: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  className="form-select"
                  value={bankInfo.account_type}
                  onChange={(e) => setBankInfo({ ...bankInfo, account_type: e.target.value })}
                >
                  <option value="1">N/A</option>
                  <option value="2">Savings</option>
                  <option value="3">Checking</option>
                  <option value="4">Other</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Other</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Other"
                  value={bankInfo.other}
                  onChange={(e) => setBankInfo({ ...bankInfo, other: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">ABA Routing No</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ABA Routing No"
                  value={bankInfo.aba_routing_no}
                  onChange={(e) => setBankInfo({ ...bankInfo, aba_routing_no: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Account Number"
                  value={bankInfo.account_number}
                  onChange={(e) => setBankInfo({ ...bankInfo, account_number: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">SWIFT</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="SWIFT"
                  value={bankInfo.swift}
                  onChange={(e) => setBankInfo({ ...bankInfo, swift: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">IBAN</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="IBAN"
                  value={bankInfo.iban}
                  onChange={(e) => setBankInfo({ ...bankInfo, iban: e.target.value })}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BankInfoTab; 