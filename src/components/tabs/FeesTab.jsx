import React from 'react';

const FeesTab = ({ feesInfo, setFeesInfo, feesInfoLoading, feesInfoError, DateInput }) => {
  return (
    <div className="mb-4 left-section-container">
        {/* Display loading state */}
        {feesInfoLoading && (
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
        {feesInfoError && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>API Error:</strong> {feesInfoError}
            <button type="button" className="btn-close" onClick={() => setFeesInfoError(null)} aria-label="Close"></button>
          </div>
        )}

        <h5 className="section-title">941 Details</h5>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Error Discovered Date</label>
              <DateInput
                value={feesInfo.error_discovered_date}
                onChange={(value) => setFeesInfo({...feesInfo, error_discovered_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2020 941 Wages</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2020 941 Wages"
                value={feesInfo.q2_2020_941_wages}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_941_wages: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2020 941 Wages</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2020 941 Wages"
                value={feesInfo.q3_2020_941_wages}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_941_wages: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2020 941 Wages</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2020 941 Wages"
                value={feesInfo.q4_2020_941_wages}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_941_wages: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2021 941 Wages</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2021 941 Wages"
                value={feesInfo.q1_2021_941_wages}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_941_wages: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2021 941 Wages</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2021 941 Wages"
                value={feesInfo.q2_2021_941_wages}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_941_wages: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2021 941 Wages</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2021 941 Wages"
                value={feesInfo.q3_2021_941_wages}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_941_wages: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2021 941 Wages</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2021 941 Wages"
                value={feesInfo.q4_2021_941_wages}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_941_wages: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h5 className="section-title mt-4">TOTAL ERC AMOUNT AND FEES</h5>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Internal Sales Agent</label>
              <input
                type="text"
                className="form-control"
                placeholder="Internal Sales Agent"
                value={feesInfo.internal_sales_agent}
                onChange={(e) => setFeesInfo({...feesInfo, internal_sales_agent: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Internal Sales Support</label>
              <input
                type="text"
                className="form-control"
                placeholder="Internal Sales Support"
                value={feesInfo.internal_sales_support}
                onChange={(e) => setFeesInfo({...feesInfo, internal_sales_support: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Affiliate Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Affiliate Name"
                value={feesInfo.affiliate_name}
                onChange={(e) => setFeesInfo({...feesInfo, affiliate_name: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Affiliate Percentage</label>
              <input
                type="text"
                className="form-control"
                placeholder="Affiliate Percentage"
                value={feesInfo.affiliate_percentage}
                onChange={(e) => setFeesInfo({...feesInfo, affiliate_percentage: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">ERC Claim Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="ERC Claim Filed"
                value={feesInfo.erc_claim_filed}
                onChange={(e) => setFeesInfo({...feesInfo, erc_claim_filed: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">ERC Amount Received</label>
              <input
                type="text"
                className="form-control"
                placeholder="ERC Amount Received"
                value={feesInfo.erc_amount_received}
                onChange={(e) => setFeesInfo({...feesInfo, erc_amount_received: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total ERC Fee</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total ERC Fee"
                value={feesInfo.total_erc_fees}
                onChange={(e) => setFeesInfo({...feesInfo, total_erc_fees: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Legal Fees</label>
              <input
                type="text"
                className="form-control"
                placeholder="Legal Fees"
                value={feesInfo.legal_fees}
                onChange={(e) => setFeesInfo({...feesInfo, legal_fees: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total ERC Fees Paid</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total ERC Fees Paid"
                value={feesInfo.total_erc_fees_paid}
                onChange={(e) => setFeesInfo({...feesInfo, total_erc_fees_paid: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total ERC Fees Pending</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total ERC Fees Pending"
                value={feesInfo.total_erc_fees_pending}
                onChange={(e) => setFeesInfo({...feesInfo, total_erc_fees_pending: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total Occams Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total Occams Share"
                value={feesInfo.total_occams_share}
                onChange={(e) => setFeesInfo({...feesInfo, total_occams_share: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total Aff/Ref Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total Aff/Ref Share"
                value={feesInfo.total_aff_ref_share}
                onChange={(e) => setFeesInfo({...feesInfo, total_aff_ref_share: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Retain Occams Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Retain Occams Share"
                value={feesInfo.retain_occams_share}
                onChange={(e) => setFeesInfo({...feesInfo, retain_occams_share: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Retain Aff/Ref Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Retain Aff/Ref Share"
                value={feesInfo.retain_aff_ref_share}
                onChange={(e) => setFeesInfo({...feesInfo, retain_aff_ref_share: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Bal Retain Occams Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Bal Retain Occams Share"
                value={feesInfo.bal_retain_occams_share}
                onChange={(e) => setFeesInfo({...feesInfo, bal_retain_occams_share: e.target.value})}

              />
            </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">BAL Retain Aff_Ref Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="BAL Retain Aff_Ref Share"
                value={feesInfo.bal_retain_aff_ref_share}
                onChange={(e) => setFeesInfo({...feesInfo, bal_retain_aff_ref_share: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total Occams Share Paid</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total Occams Share Paid"
                value={feesInfo.total_occams_share_paid}
                onChange={(e) => setFeesInfo({...feesInfo, total_occams_share_paid: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total Aff/Ref Share Paid</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total Aff/Ref Share Paid"
                value={feesInfo.total_aff_ref_share_paid}
                onChange={(e) => setFeesInfo({...feesInfo, total_aff_ref_share_paid: e.target.value})}

              />
            </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total Occams Share Pending</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total Occams Share Pending"
                value={feesInfo.total_occams_share_pendin}
                onChange={(e) => setFeesInfo({...feesInfo, total_occams_share_pendin: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Total Aff/Ref Share Pending</label>
              <input
                type="text"
                className="form-control"
                placeholder="Total Aff/Ref Share Pending"
                value={feesInfo.total_aff_ref_share_pend}
                onChange={(e) => setFeesInfo({...feesInfo, total_aff_ref_share_pend: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h5 className="section-title mt-4">Total Max ERC Amount 2020</h5>
        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2020 Max ERC Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2020 Max ERC Amount"
                value={feesInfo.q1_2020_max_erc_amount}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2020_max_erc_amount: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2020 Max ERC Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2020 Max ERC Amount"
                value={feesInfo.q2_2020_max_erc_amount}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_max_erc_amount: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2020 Max ERC Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2020 Max ERC Amount"
                value={feesInfo.q3_2020_max_erc_amount}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_max_erc_amount: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2020 Max ERC Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2020 Max ERC Amount"
                value={feesInfo.q4_2020_max_erc_amount}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_max_erc_amount: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h5 className="section-title mt-4">Total Max ERC Amount 2021</h5>
        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2021 Max ERC Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2021 Max ERC Amount"
                value={feesInfo.q1_2021_max_erc_amount}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_max_erc_amount: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2021 Max ERC Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2021 Max ERC Amount"
                value={feesInfo.q2_2021_max_erc_amount}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_max_erc_amount: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2021 Max ERC Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2021 Max ERC Amount"
                value={feesInfo.q3_2021_max_erc_amount}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_max_erc_amount: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2021 Max ERC Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2021 Max ERC Amount"
                value={feesInfo.q4_2021_max_erc_amount}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_max_erc_amount: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h5 className="section-title mt-4">ERC Filed Quarter wise 2020</h5>
        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="q1-2020-filed-status"
                  checked={feesInfo.q1_2020_filed_status}
                  onChange={(e) => setFeesInfo({...feesInfo, q1_2020_filed_status: e.target.checked})}

                />
                <label className="form-check-label" htmlFor="q1-2020-filed-status">
                  Q1 2020 Filed Status
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2020 Filing Date</label>
              <DateInput
                value={feesInfo.q1_2020_filed_date}
                onChange={(value) => setFeesInfo({...feesInfo, q1_2020_filed_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2020 Amount Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2020 Amount Filed"
                value={feesInfo.q1_2020_amount_filed}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2020_amount_filed: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2020 Benefits</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2020 Benefits"
                value={feesInfo.q1_2020_benefits}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2020_benefits: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2020 Eligibility Basis</label>
              <select
                className="form-select"
                value={feesInfo.q1_2020_eligibility_basis}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2020_eligibility_basis: e.target.value})}

              >
                <option value="N/A">N/A</option>
                <option value="FPSO">FPSO</option>
                <option value="SDGR">SDGR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="q2-2020-filed-status"
                  checked={feesInfo.q2_2020_filed_status}
                  onChange={(e) => setFeesInfo({...feesInfo, q2_2020_filed_status: e.target.checked})}

                />
                <label className="form-check-label" htmlFor="q2-2020-filed-status">
                  Q2 2020 Filed Status
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2020 Filing Date</label>
              <DateInput
                value={feesInfo.q2_2020_filed_date}
                onChange={(value) => setFeesInfo({...feesInfo, q2_2020_filed_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2020 Amount Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2020 Amount Filed"
                value={feesInfo.q2_2020_amount_filed}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_amount_filed: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2020 Benefits</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2020 Benefits"
                value={feesInfo.q2_2020_benefits}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_benefits: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2020 Eligibility Basis</label>
              <select
                className="form-select"
                value={feesInfo.q2_2020_eligibility_basis}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_eligibility_basis: e.target.value})}

              >
                <option value="N/A">N/A</option>
                <option value="FPSO">FPSO</option>
                <option value="SDGR">SDGR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="q3-2020-filed-status"
                  checked={feesInfo.q3_2020_filed_status}
                  onChange={(e) => setFeesInfo({...feesInfo, q3_2020_filed_status: e.target.checked})}

                />
                <label className="form-check-label" htmlFor="q3-2020-filed-status">
                  Q3 2020 Filed Status
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2020 Filing Date</label>
              <DateInput
                value={feesInfo.q3_2020_filed_date}
                onChange={(value) => setFeesInfo({...feesInfo, q3_2020_filed_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2020 Amount Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2020 Amount Filed"
                value={feesInfo.q3_2020_amount_filed}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_amount_filed: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2020 Benefits</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2020 Benefits"
                value={feesInfo.q3_2020_benefits}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_benefits: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2020 Eligibility Basis</label>
              <select
                className="form-select"
                value={feesInfo.q3_2020_eligibility_basis}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_eligibility_basis: e.target.value})}

              >
                <option value="N/A">N/A</option>
                <option value="FPSO">FPSO</option>
                <option value="SDGR">SDGR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="q4-2020-filed-status"
                  checked={feesInfo.q4_2020_filed_status}
                  onChange={(e) => setFeesInfo({...feesInfo, q4_2020_filed_status: e.target.checked})}

                />
                <label className="form-check-label" htmlFor="q4-2020-filed-status">
                  Q4 2020 Filed Status
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2020 Filing Date</label>
              <DateInput
                value={feesInfo.q4_2020_filed_date}
                onChange={(value) => setFeesInfo({...feesInfo, q4_2020_filed_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2020 Amount Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2020 Amount Filed"
                value={feesInfo.q4_2020_amount_filed}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_amount_filed: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2020 Benefits</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2020 Benefits"
                value={feesInfo.q4_2020_benefits}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_benefits: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2020 Eligibility Basis</label>
              <select
                className="form-select"
                value={feesInfo.q4_2020_eligibility_basis}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_eligibility_basis: e.target.value})}

              >
                <option value="N/A">N/A</option>
                <option value="FPSO">FPSO</option>
                <option value="SDGR">SDGR</option>
              </select>
            </div>
          </div>
        </div>

        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="q1-2021-filed-status"
                  checked={feesInfo.q1_2021_filed_status}
                  onChange={(e) => setFeesInfo({...feesInfo, q1_2021_filed_status: e.target.checked})}

                />
                <label className="form-check-label" htmlFor="q1-2021-filed-status">
                  Q1 2021 Filed Status
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2021 Filing Date</label>
              <DateInput
                value={feesInfo.q1_2021_filed_date}
                onChange={(value) => setFeesInfo({...feesInfo, q1_2021_filed_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2021 Amount Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2021 Amount Filed"
                value={feesInfo.q1_2021_amount_filed}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_amount_filed: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2021 Benefits</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2021 Benefits"
                value={feesInfo.q1_2021_benefits}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_benefits: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q1 2021 Eligibility Basis</label>
              <select
                className="form-select"
                value={feesInfo.q1_2021_eligibility_basis}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_eligibility_basis: e.target.value})}

              >
                <option value="N/A">N/A</option>
                <option value="FPSO">FPSO</option>
                <option value="SDGR">SDGR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="q2-2021-filed-status"
                  checked={feesInfo.q2_2021_filed_status}
                  onChange={(e) => setFeesInfo({...feesInfo, q2_2021_filed_status: e.target.checked})}

                />
                <label className="form-check-label" htmlFor="q2-2021-filed-status">
                  Q2 2021 Filed Status
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2021 Filing Date</label>
              <DateInput
                value={feesInfo.q2_2021_filed_date}
                onChange={(value) => setFeesInfo({...feesInfo, q2_2021_filed_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2021 Amount Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2021 Amount Filed"
                value={feesInfo.q2_2021_amount_filed}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_amount_filed: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2021 Benefits</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2021 Benefits"
                value={feesInfo.q2_2021_benefits}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_benefits: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q2 2021 Eligibility Basis</label>
              <select
                className="form-select"
                value={feesInfo.q2_2021_eligibility_basis}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_eligibility_basis: e.target.value})}

              >
                <option value="N/A">N/A</option>
                <option value="FPSO">FPSO</option>
                <option value="SDGR">SDGR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="q3-2021-filed-status"
                  checked={feesInfo.q3_2021_filed_status}
                  onChange={(e) => setFeesInfo({...feesInfo, q3_2021_filed_status: e.target.checked})}

                />
                <label className="form-check-label" htmlFor="q3-2021-filed-status">
                  Q3 2021 Filed Status
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2021 Filing Date</label>
              <DateInput
                value={feesInfo.q3_2021_filed_date}
                onChange={(value) => setFeesInfo({...feesInfo, q3_2021_filed_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2021 Amount Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2021 Amount Filed"
                value={feesInfo.q3_2021_amount_filed}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_amount_filed: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2021 Benefits</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2021 Benefits"
                value={feesInfo.q3_2021_benefits}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_benefits: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q3 2021 Eligibility Basis</label>
              <select
                className="form-select"
                value={feesInfo.q3_2021_eligibility_basis}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_eligibility_basis: e.target.value})}

              >
                <option value="N/A">N/A</option>
                <option value="FPSO">FPSO</option>
                <option value="SDGR">SDGR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <div className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="q4-2021-filed-status"
                  checked={feesInfo.q4_2021_filed_status}
                  onChange={(e) => setFeesInfo({...feesInfo, q4_2021_filed_status: e.target.checked})}

                />
                <label className="form-check-label" htmlFor="q4-2021-filed-status">
                  Q4 2021 Filed Status
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2021 Filing Date</label>
              <DateInput
                value={feesInfo.q4_2021_filed_date}
                onChange={(value) => setFeesInfo({...feesInfo, q4_2021_filed_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2021 Amount Filed</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2021 Amount Filed"
                value={feesInfo.q4_2021_amount_filed}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_amount_filed: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2021 Benefits</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2021 Benefits"
                value={feesInfo.q4_2021_benefits}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_benefits: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Q4 2021 Eligibility Basis</label>
              <select
                className="form-select"
                value={feesInfo.q4_2021_eligibility_basis}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_eligibility_basis: e.target.value})}

              >
                <option value="N/A">N/A</option>
                <option value="FPSO">FPSO</option>
                <option value="SDGR">SDGR</option>
              </select>
            </div>
          </div>
        </div>

        <h5 className="section-title mt-4">ERC Letter, Check & Amount</h5>
        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2020</h6>

        <div className="row mb-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q1 2020 Loop</label>
              <DateInput
                value={feesInfo.q1_2020_loop}
                onChange={(value) => setFeesInfo({...feesInfo, q1_2020_loop: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q1-2020-letter"
                checked={feesInfo.q1_2020_letter}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2020_letter: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q1-2020-letter">
                Q1 2020 Letter
              </label>
            </div>
          </div>
          <div className='col-md-3'>
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q1-2020-check"
                checked={feesInfo.q1_2020_check}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2020_check: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q1-2020-check">
                Q1 2020 Check
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q1 2020 Chq Amt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2020 Chq Amt"
                value={feesInfo.q1_2020_chq_amt}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2020_chq_amt: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q2 2020 Loop</label>
              <DateInput
                value={feesInfo.q2_2020_loop}
                onChange={(value) => setFeesInfo({...feesInfo, q2_2020_loop: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q2-2020-letter"
                checked={feesInfo.q2_2020_letter}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_letter: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q2-2020-letter">
                Q2 2020 Letter
              </label>
            </div>
          </div>
          <div className='col-md-3'>
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q2-2020-check"
                checked={feesInfo.q2_2020_check}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_check: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q2-2020-check">
                Q2 2020 Check
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q2 2020 Chq Amt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2020 Chq Amt"
                value={feesInfo.q2_2020_chq_amt}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2020_chq_amt: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q3 2020 Loop</label>
              <DateInput
                value={feesInfo.q3_2020_loop}
                onChange={(value) => setFeesInfo({...feesInfo, q3_2020_loop: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q3-2020-letter"
                checked={feesInfo.q3_2020_letter}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_letter: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q3-2020-letter">
                Q3 2020 Letter
              </label>
            </div>
          </div>
          <div className='col-md-3'>
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q3-2020-check"
                checked={feesInfo.q3_2020_check}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_check: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q3-2020-check">
                Q3 2020 Check
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q3 2020 Chq Amt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2020 Chq Amt"
                value={feesInfo.q3_2020_chq_amt}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2020_chq_amt: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q4 2020 Loop</label>
              <DateInput
                value={feesInfo.q4_2020_loop}
                onChange={(value) => setFeesInfo({...feesInfo, q4_2020_loop: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q4-2020-letter"
                checked={feesInfo.q4_2020_letter}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_letter: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q4-2020-letter">
                Q4 2020 Letter
              </label>
            </div>
          </div>
          <div className='col-md-3'>
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q4-2020-check"
                checked={feesInfo.q4_2020_check}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_check: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q4-2020-check">
                Q4 2020 Check
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q4 2020 Chq Amt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2020 Chq Amt"
                value={feesInfo.q4_2020_chq_amt}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2020_chq_amt: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">2021</h6>

        <div className="row mb-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q1 2021 Loop</label>
              <DateInput
                value={feesInfo.q1_2021_loop}
                onChange={(value) => setFeesInfo({...feesInfo, q1_2021_loop: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q1-2021-letter"
                checked={feesInfo.q1_2021_letter}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_letter: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q1-2021-letter">
                Q1 2021 Letter
              </label>
            </div>
          </div>
          <div className='col-md-3'>
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q1-2021-check"
                checked={feesInfo.q1_2021_check}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_check: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q1-2021-check">
                Q1 2021 Check
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q1 2021 Chq Amt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q1 2021 Chq Amt"
                value={feesInfo.q1_2021_chq_amt}
                onChange={(e) => setFeesInfo({...feesInfo, q1_2021_chq_amt: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q2 2021 Loop</label>
              <DateInput
                value={feesInfo.q2_2021_loop}
                onChange={(value) => setFeesInfo({...feesInfo, q2_2021_loop: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q2-2021-letter"
                checked={feesInfo.q2_2021_letter}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_letter: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q2-2021-letter">
                Q2 2021 Letter
              </label>
            </div>
          </div>
          <div className='col-md-3'>
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q2-2021-check"
                checked={feesInfo.q2_2021_check}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_check: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q2-2021-check">
                Q2 2021 Check
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q2 2021 Chq Amt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q2 2021 Chq Amt"
                value={feesInfo.q2_2021_chq_amt}
                onChange={(e) => setFeesInfo({...feesInfo, q2_2021_chq_amt: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q3 2021 Loop</label>
              <DateInput
                value={feesInfo.q3_2021_loop}
                onChange={(value) => setFeesInfo({...feesInfo, q3_2021_loop: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q3-2021-letter"
                checked={feesInfo.q3_2021_letter}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_letter: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q3-2021-letter">
                Q3 2021 Letter
              </label>
            </div>
          </div>
          <div className='col-md-3'>
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q3-2021-check"
                checked={feesInfo.q3_2021_check}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_check: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q3-2021-check">
                Q3 2021 Check
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q3 2021 Chq Amt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q3 2021 Chq Amt"
                value={feesInfo.q3_2021_chq_amt}
                onChange={(e) => setFeesInfo({...feesInfo, q3_2021_chq_amt: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q4 2021 Loop</label>
              <DateInput
                value={feesInfo.q4_2021_loop}
                onChange={(value) => setFeesInfo({...feesInfo, q4_2021_loop: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q4-2021-letter"
                checked={feesInfo.q4_2021_letter}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_letter: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q4-2021-letter">
                Q4 2021 Letter
              </label>
            </div>
          </div>
          <div className='col-md-3'>
            <div className="form-check custom-checkbox">
              <input
                className="form-check-input"
                type="checkbox"
                id="q4-2021-check"
                checked={feesInfo.q4_2021_check}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_check: e.target.checked})}

              />
              <label className="form-check-label" htmlFor="q4-2021-check">
                Q4 2021 Check
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Q4 2021 Chq Amt</label>
              <input
                type="text"
                className="form-control"
                placeholder="Q4 2021 Chq Amt"
                value={feesInfo.q4_2021_chq_amt}
                onChange={(e) => setFeesInfo({...feesInfo, q4_2021_chq_amt: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h5 className="section-title mt-4">Success Fee Invoice Details</h5>

        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">I - Invoice Details</h6>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoice number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoice number"
                value={feesInfo.i_invoice_no}
                onChange={(e) => setFeesInfo({...feesInfo, i_invoice_no: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoice Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoice Amount"
                value={feesInfo.i_invoice_amount}
                onChange={(e) => setFeesInfo({...feesInfo, i_invoice_amount: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoiced Qtrs</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoiced Qtrs"
                value={feesInfo.i_invoiced_qtrs}
                onChange={(e) => setFeesInfo({...feesInfo, i_invoiced_qtrs: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoice Sent Date</label>
              <DateInput
                value={feesInfo.i_invoice_sent_date}
                onChange={(value) => setFeesInfo({...feesInfo, i_invoice_sent_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoice Payment Type</label>
              <select
                className="form-select"
                value={feesInfo.i_invoice_payment_type}
                onChange={(e) => setFeesInfo({...feesInfo, i_invoice_payment_type: e.target.value})}

              >
                <option value="">Select payment type</option>
                <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
                <option value="occams_initiated_ach">Occams Initiated - ACH</option>
                <option value="occams_initiated_wire">Client Initiated - Wire</option>
                <option value="client_initiated_ach">Client Initiated - ACH</option>
                <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
                <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoice Payment Date</label>
              <DateInput
                value={feesInfo.i_invoice_payment_date}
                onChange={(value) => setFeesInfo({...feesInfo, i_invoice_payment_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoice Pay Cleared</label>
              <DateInput
                value={feesInfo.i_invoice_pay_cleared}
                onChange={(value) => setFeesInfo({...feesInfo, i_invoice_pay_cleared: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoice Pay Returned</label>
              <DateInput
                value={feesInfo.i_invoice_pay_returned}
                onChange={(value) => setFeesInfo({...feesInfo, i_invoice_pay_returned: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">I Invoice Return Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="Return Reason"
                value={feesInfo.i_invoice_return_reason}
                onChange={(e) => setFeesInfo({...feesInfo, i_invoice_return_reason: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">I Invoice Occams Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Occams Share"
                value={feesInfo.i_invoice_occams_share}
                onChange={(e) => setFeesInfo({...feesInfo, i_invoice_occams_share: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">I Invoice Aff/Ref Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Aff/Ref Share"
                value={feesInfo.i_invoice_aff_ref_share}
                onChange={(e) => setFeesInfo({...feesInfo, i_invoice_aff_ref_share: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">II - Invoice Details</h6>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoice number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoice number"
                value={feesInfo.ii_invoice_no}
                onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_no: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoice Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoice Amount"
                value={feesInfo.ii_invoice_amount}
                onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_amount: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoiced Qtrs</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoiced Qtrs"
                value={feesInfo.ii_invoiced_qtrs}
                onChange={(e) => setFeesInfo({...feesInfo, ii_invoiced_qtrs: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoice Sent Date</label>
              <DateInput
                value={feesInfo.ii_invoice_sent_date}
                onChange={(value) => setFeesInfo({...feesInfo, ii_invoice_sent_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoice Payment Type</label>
              <select
                className="form-select"
                value={feesInfo.ii_invoice_payment_type}
                onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_payment_type: e.target.value})}

              >
                <option value="">Select payment type</option>
                <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
                <option value="occams_initiated_ach">Occams Initiated - ACH</option>
                <option value="occams_initiated_wire">Client Initiated - Wire</option>
                <option value="client_initiated_ach">Client Initiated - ACH</option>
                <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
                <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoice Payment Date</label>
              <DateInput
                value={feesInfo.ii_invoice_payment_date}
                onChange={(value) => setFeesInfo({...feesInfo, ii_invoice_payment_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoice Pay Cleared</label>
              <DateInput
                value={feesInfo.ii_invoice_pay_cleared}
                onChange={(value) => setFeesInfo({...feesInfo, ii_invoice_pay_cleared: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoice Pay Returned</label>
              <DateInput
                value={feesInfo.ii_invoice_pay_returned}
                onChange={(value) => setFeesInfo({...feesInfo, ii_invoice_pay_returned: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">II Invoice Return Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="Return Reason"
                value={feesInfo.ii_invoice_return_reason}
                onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_return_reason: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">II Invoice Occams Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Occams Share"
                value={feesInfo.ii_invoice_occams_share}
                onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_occams_share: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">II Invoice Aff/Ref Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Aff/Ref Share"
                value={feesInfo.ii_invoice_aff_ref_share}
                onChange={(e) => setFeesInfo({...feesInfo, ii_invoice_aff_ref_share: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">III - Invoice Details</h6>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoice number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoice number"
                value={feesInfo.iii_invoice_no}
                onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_no: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoice Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoice Amount"
                value={feesInfo.iii_invoice_amount}
                onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_amount: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoiced Qtrs</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoiced Qtrs"
                value={feesInfo.iii_invoiced_qtrs}
                onChange={(e) => setFeesInfo({...feesInfo, iii_invoiced_qtrs: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoice Sent Date</label>
              <DateInput
                value={feesInfo.iii_invoice_sent_date}
                onChange={(value) => setFeesInfo({...feesInfo, iii_invoice_sent_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoice Payment Type</label>
              <select
                className="form-select"
                value={feesInfo.iii_invoice_payment_type}
                onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_payment_type: e.target.value})}

              >
                <option value="">Select payment type</option>
                <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
                <option value="occams_initiated_ach">Occams Initiated - ACH</option>
                <option value="occams_initiated_wire">Client Initiated - Wire</option>
                <option value="client_initiated_ach">Client Initiated - ACH</option>
                <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
                <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoice Payment Date</label>
              <DateInput
                value={feesInfo.iii_invoice_payment_date}
                onChange={(value) => setFeesInfo({...feesInfo, iii_invoice_payment_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoice Pay Cleared</label>
              <DateInput
                value={feesInfo.iii_invoice_pay_cleared}
                onChange={(value) => setFeesInfo({...feesInfo, iii_invoice_pay_cleared: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoice Pay Returned</label>
              <DateInput
                value={feesInfo.iii_invoice_pay_returned}
                onChange={(value) => setFeesInfo({...feesInfo, iii_invoice_pay_returned: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">III Invoice Return Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="Return Reason"
                value={feesInfo.iii_invoice_return_reason}
                onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_return_reason: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">III Invoice Occams Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Occams Share"
                value={feesInfo.iii_invoice_occams_share}
                onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_occams_share: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">III Invoice Aff/Ref Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Aff/Ref Share"
                value={feesInfo.iii_invoice_aff_ref_share}
                onChange={(e) => setFeesInfo({...feesInfo, iii_invoice_aff_ref_share: e.target.value})}

              />
            </div>
          </div>
        </div>

        <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">IV - Invoice Details</h6>
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoice number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoice number"
                value={feesInfo.iv_invoice_no}
                onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_no: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoice Amount</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoice Amount"
                value={feesInfo.iv_invoice_amount}
                onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_amount: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoiced Qtrs</label>
              <input
                type="text"
                className="form-control"
                placeholder="Invoiced Qtrs"
                value={feesInfo.iv_invoiced_qtrs}
                onChange={(e) => setFeesInfo({...feesInfo, iv_invoiced_qtrs: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoice Sent Date</label>
              <DateInput
                value={feesInfo.iv_invoice_sent_date}
                onChange={(value) => setFeesInfo({...feesInfo, iv_invoice_sent_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoice Payment Type</label>
              <select
                className="form-select"
                value={feesInfo.iv_invoice_payment_type}
                onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_payment_type: e.target.value})}

              >
                <option value="">Select payment type</option>
                <option value="occams_initiated_eCheck">Occams Initiated - eCheck</option>
                <option value="occams_initiated_ach">Occams Initiated - ACH</option>
                <option value="occams_initiated_wire">Client Initiated - Wire</option>
                <option value="client_initiated_ach">Client Initiated - ACH</option>
                <option value="client_initiated_check_mailed">Client Initiated - Check Mailed</option>
                <option value="credit_card_or_debit_card">Credit Card or Debit Card</option>
              </select>
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoice Payment Date</label>
              <DateInput
                value={feesInfo.iv_invoice_payment_date}
                onChange={(value) => setFeesInfo({...feesInfo, iv_invoice_payment_date: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoice Pay Cleared</label>
              <DateInput
                value={feesInfo.iv_invoice_pay_cleared}
                onChange={(value) => setFeesInfo({...feesInfo, iv_invoice_pay_cleared: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoice Pay Returned</label>
              <DateInput
                value={feesInfo.iv_invoice_pay_returned}
                onChange={(value) => setFeesInfo({...feesInfo, iv_invoice_pay_returned: value})}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">IV Invoice Return Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="Return Reason"
                value={feesInfo.iv_invoice_return_reason}
                onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_return_reason: e.target.value})}

              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">IV Invoice Occams Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Occams Share"
                value={feesInfo.iv_invoice_occams_share}
                onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_occams_share: e.target.value})}

              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">IV Invoice Aff/Ref Share</label>
              <input
                type="text"
                className="form-control"
                placeholder="Aff/Ref Share"
                value={feesInfo.iv_invoice_aff_ref_share}
                onChange={(e) => setFeesInfo({...feesInfo, iv_invoice_aff_ref_share: e.target.value})}

              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default FeesTab; 