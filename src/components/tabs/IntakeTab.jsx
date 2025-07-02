import React from 'react';

const IntakeTab = ({ intakeInfo, setIntakeInfo, companyFolderLink, documentFolderLink, intakeInfoLoading, intakeInfoError, DateInput }) => {
  return (
    <div className="mb-4 left-section-container">
      <h5 className="section-title mt-4">ERC Basic Details</h5>

      {intakeInfoLoading ? (
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
      ) : intakeInfoError ? (
        <div className="alert alert-warning" role="alert">
          {intakeInfoError}
          <button
            className="btn btn-sm btn-primary ms-3"
            onClick={fetchIntakeInfo}
          >
            Retry
          </button>
        </div>
      ) : (
        <>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">W2 Employee Count</label>
            <input
              type="text"
              className="form-control"
              placeholder="W2 Employee Count"
              value={intakeInfo.w2_employees_count}
              onChange={(e) => setIntakeInfo({...intakeInfo, w2_employees_count: e.target.value})}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Initial Retain Fee Amount</label>
            <input
              type="text"
              className="form-control"
              placeholder="Initial Retain Fee Amount"
              value={intakeInfo.initial_retain_fee_amount}
              onChange={(e) => setIntakeInfo({...intakeInfo, initial_retain_fee_amount: e.target.value})}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">W2 EE Difference Count</label>
            <input
              type="text"
              className="form-control"
              placeholder="W2 EE Difference Count"
              value={intakeInfo.w2_ee_difference_count}
              onChange={(e) => setIntakeInfo({...intakeInfo, w2_ee_difference_count: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Balance Retainer Fee</label>
            <input
              type="text"
              className="form-control"
              placeholder="Balance Retainer Fee"
              value={intakeInfo.balance_retainer_fee}
              onChange={(e) => setIntakeInfo({...intakeInfo, balance_retainer_fee: e.target.value})}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Total Max ERC Amount</label>
            <input
              type="text"
              className="form-control"
              placeholder="Total Max ERC Amount"
              value={intakeInfo.total_max_erc_amount}
              onChange={(e) => setIntakeInfo({...intakeInfo, total_max_erc_amount: e.target.value})}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Total Estimated Fees</label>
            <input
              type="text"
              className="form-control"
              placeholder="Total Estimated Fees"
              value={intakeInfo.total_estimated_fees}
              onChange={(e) => setIntakeInfo({...intakeInfo, total_estimated_fees: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Affiliate Referral Fees</label>
            <input
              type="text"
              className="form-control"
              placeholder="Affiliate Referral Fees"
              value={intakeInfo.affiliate_referral_fees}
              onChange={(e) => setIntakeInfo({...intakeInfo, affiliate_referral_fees: e.target.value})}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <div className="form-check custom-checkbox">
              <input
                type="checkbox"
                className="form-check-input"
                id="sdgrCheck"
                checked={intakeInfo.sdgr === 'Yes' || intakeInfo.sdgr === true}
                onChange={(e) => setIntakeInfo({...intakeInfo, sdgr: e.target.checked ? 'Yes' : 'No'})}

              />
              <label className="form-check-label" htmlFor="sdgrCheck">SDGR</label>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Average Employee Count in 2019</label>
            <select
              className="form-select"
              value={intakeInfo.avg_emp_count_2019}
              onChange={(e) => setIntakeInfo({...intakeInfo, avg_emp_count_2019: e.target.value})}

            >
              <option value="0">N/A</option>
              <option value="1">Less Than 100</option>
              <option value="2">Between 100-500</option>
              <option value="3">More Than 500</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Fee Type</label>
            <select
              className="form-select"
              value={intakeInfo.fee_type}
              onChange={(e) => setIntakeInfo({...intakeInfo, fee_type: e.target.value})}

            >
              <option value="N/A">N/A</option>
              <option value="Retainer Fee @$90 Per EE + Success Fee @15%">Retainer Fee @$90 Per EE + Success Fee @15%</option>
              <option value="Retainer Fee $10k + Upon Completion Fees @12%">Retainer Fee $10k + Upon Completion Fees @12%</option>
              <option value="Document Fee @$299 + Success Fee @18%">Document Fee @$299 + Success Fee @18%</option>
              <option value="Retainer Fee @$90 Per EE + Success Fee @12.5%">Retainer Fee @$90 Per EE + Success Fee @12.5%</option>
              <option value="Retainer Fee @$90 Per EE + Success Fee @12%">Retainer Fee @$90 Per EE + Success Fee @12%</option>
              <option value="Retainer Fee @$90 Per EE + Success Fee @10%">Retainer Fee @$90 Per EE + Success Fee @10%</option>
              <option value="Retainer Fee @$90 Per EE + Success Fee @13%">Retainer Fee @$90 Per EE + Success Fee @13%</option>
              <option value="Retainer Fee @$90 Per EE + Success Fee @20%">Retainer Fee @$90 Per EE + Success Fee @20%</option>
              <option value="Retainer Fee @$90 Per EE + Success Fee @9.75%">Retainer Fee @$90 Per EE + Success Fee @9.75%</option>
              <option value="Retainer Fee $10k + Upon Completion Fees @10%">Retainer Fee $10k + Upon Completion Fees @10%</option>
              <option value="Document Fee @$0 + Success Fee @12.5%">Document Fee @$0 + Success Fee @12.5%</option>
              <option value="Document Fee @$0 + Success Fee @14.5%">Document Fee @$0 + Success Fee @14.5%</option>
              <option value="Document Fee @$0 + Success Fee @15%">Document Fee @$0 + Success Fee @15%</option>
              <option value="Document Fee @$450 OT + Success Fee @12.5%">Document Fee @$450 OT + Success Fee @12.5%</option>
              <option value="Document Fee @$49 OT + Success Fee @15%">Document Fee @$49 OT + Success Fee @15%</option>
              <option value="Document Fee @$49 OT + Success Fee @17.5%">Document Fee @$49 OT + Success Fee @17.5%</option>
              <option value="Document Fee @$99 + Success Fee @18%">Document Fee @$99 + Success Fee @18%</option>
              <option value="Document Fee @$99 OT + Success Fee @15%">Document Fee @$99 OT + Success Fee @15%</option>
              <option value="Document Fee @$99 OT + Success Fee @15.75%">Document Fee @$99 OT + Success Fee @15.75%</option>
              <option value="Document Fee @$99 OT + Success Fee @20%">Document Fee @$99 OT + Success Fee @20%</option>
              <option value="Document Fee @$990 OT + Success Fee @15.75%">Document Fee @$990 OT + Success Fee @15.75%</option>
              <option value="Enrollment 5 EE or less $450 Flat Fee">Enrollment 5 EE or less $450 Flat Fee</option>
              <option value="Enrollment @$90 Per EE + Success Fee @10%">Enrollment @$90 Per EE + Success Fee @10%</option>
              <option value="Enrollment @$90 Per EE + Success Fee @12.5%">Enrollment @$90 Per EE + Success Fee @12.5%</option>
              <option value="Retainer @$90 Per EE - Service Fees @15%">Retainer @$90 Per EE - Service Fees @15%</option>
              <option value="Retainer @$90 Per EE+Upon Completion Fee @10%">Retainer @$90 Per EE+Upon Completion Fee @10%</option>
              <option value="Retainer @$90 Per EE+Upon Completion Fee @12%">Retainer @$90 Per EE+Upon Completion Fee @12%</option>
              <option value="Retainer Fee @ $90 Per EE+Success Fee @ 17.5%">Retainer Fee @ $90 Per EE+Success Fee @ 17.5%</option>
              <option value="Retainer @$0 Per EE + Service Fees @15%">Retainer @$0 Per EE + Service Fees @15%</option>
              <option value="Retainer Fee @$90 Per EE + Success Fee @6.25%">Retainer Fee @$90 Per EE + Success Fee @6.25%</option>
              <option value="Retainer Fee $100 + Success Fee @15%">Retainer Fee $100 + Success Fee @15%</option>
              <option value="Retainer Fee @$99 + Success Fee @10%">Retainer Fee @$99 + Success Fee @10%</option>
              <option value="Retainer Fee @$0 + Success Fee @18%">Retainer Fee @$0 + Success Fee @18%</option>
              <option value="Retainer Fee @$0 + Success Fee @10%">Retainer Fee @$0 + Success Fee @10%</option>
              <option value="Custom Fee - $37500 - $45000">Custom Fee - $37500 - $45000</option>
              <option value="Retainer Fee @$3000 + Success Fee @15%">Retainer Fee @$3000 + Success Fee @15%</option>
              <option value="Retainer Fee @$2000 + Success Fee @20%">Retainer Fee @$2000 + Success Fee @20%</option>
              <option value="Retainer Fee @$30 Per EE + Success Fee @15%">Retainer Fee @$30 Per EE + Success Fee @15%</option>
              <option value="Retainer Fee @$0 Per EE + Success Fee @12%">Retainer Fee @$0 Per EE + Success Fee @12%</option>
              <option value="Retainer Fee @$2500 + Success Fee @20%">Retainer Fee @$2500 + Success Fee @20%</option>
              <option value="Retainer Fee @$3000 + Success Fee @22%">Retainer Fee @$3000 + Success Fee @22%</option>
              <option value="Retainer Fee @$12500 + Success Fee @15%">Retainer Fee @$12500 + Success Fee @15%</option>
              <option value="$90 Per EE Min $2000 + Success Fee @20%">$90 Per EE Min $2000 + Success Fee @20%</option>
              <option value="Retainer Fee @$0 + Success Fee @20%">Retainer Fee @$0 + Success Fee @20%</option>
              <option value="Document Fee @$299 + Success Fee @20%">Document Fee @$299 + Success Fee @20%</option>
              <option value="Completion Fee @10%">Completion Fee @10%</option>
              <option value="Success Fee @10%">Success Fee @10%</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Custom Fee</label>
            <input
              type="text"
              className="form-control"
              placeholder="Custom Fee"
              value={intakeInfo.custom_fee}
              onChange={(e) => setIntakeInfo({...intakeInfo, custom_fee: e.target.value})}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Company Folder Link
            {companyFolderLink  && ( () => {
              const safeLinkss = companyFolderLink.startsWith('http://') || companyFolderLink.startsWith('https://') ? companyFolderLink : `https://${companyFolderLink}`;
              return (<a
                href={safeLinkss}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                </svg>
              </a>);
            })()}
            </label>
              <input
              type="text"
              className="form-control"
              placeholder="Company Folder Link"
              value={companyFolderLink}
              onChange={(e) => setCompanyFolderLink(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Document Folder Link
              {documentFolderLink  && ( () => {
              const safeLinkq = documentFolderLink.startsWith('http://') || documentFolderLink.startsWith('https://') ? documentFolderLink : `https://${documentFolderLink}`;
              return (<a
                href={safeLinkq}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                  <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                </svg>
              </a>);
            })()}
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Document Folder Link"
              value={documentFolderLink}
              onChange={(e) => setDocumentFolderLink(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Eligible Quarters</label>
            <input
              type="text"
              className="form-control"
              placeholder="Eligible Quarters"
              value={intakeInfo.eligible_quarters}
              onChange={(e) => setIntakeInfo({...intakeInfo, eligible_quarters: e.target.value})}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Welcome Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Welcome Email"
              value={intakeInfo.welcome_email}
              onChange={(e) => setIntakeInfo({...intakeInfo, welcome_email: e.target.value})}

            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Invoice# Initial Retainer</label>
            <input
              type="text"
              className="form-control"
              placeholder="Invoice# Initial Retainer"
              value={intakeInfo.retainer_invoice_no}
              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_invoice_no: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Retainer Payment Date</label>
            <DateInput
              value={intakeInfo.retainer_payment_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, retainer_payment_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Retainer Payment Cleared</label>
            <input
              type="text"
              className="form-control"
              placeholder="Retainer Payment Cleared"
              value={intakeInfo.retainer_payment_cleared}
              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_payment_cleared: e.target.value})}

            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Retainer Payment Returned</label>
            <DateInput
              value={intakeInfo.retainer_payment_returned}
              onChange={(value) => setIntakeInfo({...intakeInfo, retainer_payment_returned: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Ret Payment Return Reason</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ret Payment Return Reason"
              value={intakeInfo.retpayment_return_reason}
              onChange={(e) => setIntakeInfo({...intakeInfo, retpayment_return_reason: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Retainer Refund Date</label>
            <DateInput
              value={intakeInfo.retainer_refund_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, retainer_refund_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Retainer Refund Amount</label>
            <input
              type="text"
              className="form-control"
              placeholder="Retainer Refund Amount"
              value={intakeInfo.retainer_refund_amount}
              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_refund_amount: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Retainer Payment Amount</label>
            <input
              type="text"
              className="form-control"
              placeholder="Retainer Payment Amount"
              value={intakeInfo.retainer_payment_amount}
              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_payment_amount: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Retainer Payment Type</label>
            <select
              className="form-select"
              value={intakeInfo.retainer_payment_type}
              onChange={(e) => setIntakeInfo({...intakeInfo, retainer_payment_type: e.target.value})}

            >
              <option value="">Select Type</option>
              <option value="1">ACH</option>
              <option value="2">CC/DB Card</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Bal Retainer Invoice#</label>
            <input
              type="text"
              className="form-control"
              placeholder="Bal Retainer Invoice#"
              value={intakeInfo.bal_retainer_invoice_no}
              onChange={(e) => setIntakeInfo({...intakeInfo, bal_retainer_invoice_no: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Bal Retainer Sent Date</label>
            <DateInput
              value={intakeInfo.bal_retainer_sent_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, bal_retainer_sent_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Bal Retainer Pay Date</label>
            <DateInput
              value={intakeInfo.bal_retainer_pay_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, bal_retainer_pay_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Bal Retainer Clear Date</label>
            <DateInput
              value={intakeInfo.bal_retainer_clear_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, bal_retainer_clear_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Bal Retainer Return Date</label>
            <DateInput
              value={intakeInfo.bal_retainer_return_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, bal_retainer_return_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Bal Retainer Return Reason</label>
            <input
              type="text"
              className="form-control"
              placeholder="Bal Retainer Return Reason"
              value={intakeInfo.bal_retainer_return_reaso}
              onChange={(e) => setIntakeInfo({...intakeInfo, bal_retainer_return_reaso: e.target.value})}

            />
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Payment Terms</h5>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Interest Percentage(%)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Interest Percentage(%)"
              value={intakeInfo.interest_percentage}
              onChange={(e) => setIntakeInfo({...intakeInfo, interest_percentage: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Net No.</label>
            <input
              type="text"
              className="form-control"
              placeholder="Net No"
              value={intakeInfo.net_no}
              onChange={(e) => setIntakeInfo({...intakeInfo, net_no: e.target.value})}

            />
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">ERC Documents</h5>

      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Business Docs</h6>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">COI AOI</label>
            <select
              className="form-select"
              value={intakeInfo.coi_aoi}
              onChange={(e) => setIntakeInfo({...intakeInfo, coi_aoi: e.target.value})}

            >
              <option value="3">N/A</option>
              <option value="1">YES</option>
              <option value="2">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Voided Check</label>
            <select
              className="form-select"
              value={intakeInfo.voided_check}
              onChange={(e) => setIntakeInfo({...intakeInfo, voided_check: e.target.value})}

            >
              <option value="3">N/A</option>
              <option value="1">YES</option>
              <option value="2">NO</option>
            </select>
          </div>
        </div>
      </div>

      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Business Financial Docs</h6>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2019 Tax Return</label>
            <select
              className="form-select"
              value={intakeInfo['2019_tax_return']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2019_tax_return': e.target.value})}

            >
              <option value="3">N/A</option>
              <option value="1">YES</option>
              <option value="2">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2020 Tax Return</label>
            <select
              className="form-select"
              value={intakeInfo['2020_tax_return']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_tax_return': e.target.value})}

            >
              <option value="3">N/A</option>
              <option value="1">YES</option>
              <option value="2">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2021 Financials</label>
            <select
              className="form-select"
              value={intakeInfo['2021_financials']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2021_financials': e.target.value})}

            >
              <option value="3">N/A</option>
              <option value="1">YES</option>
              <option value="2">NO</option>
            </select>
          </div>
        </div>
      </div>

      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">941's - 2020</h6>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2020 Q1</label>
            <select
              className="form-select"
              value={intakeInfo['2020_q1_941']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_q1_941': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2020 Q2</label>
            <select
              className="form-select"
              value={intakeInfo['2020_q2_941']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_q2_941': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2020 Q3</label>
            <select
              className="form-select"
              value={intakeInfo['2020_q3_941']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_q3_941': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2020 Q4</label>
            <select
              className="form-select"
              value={intakeInfo['2020_q4_941']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_q4_941': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
      </div>

      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">941's - 2021</h6>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2021 Q1</label>
            <select
              className="form-select"
              value={intakeInfo['2021_q1_941']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2021_q1_941': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2021 Q2</label>
            <select
              className="form-select"
              value={intakeInfo['2021_q2_941']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2021_q2_941': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">2021 Q3</label>
            <select
              className="form-select"
              value={intakeInfo['2021_q3_941']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2021_q3_941': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
      </div>

      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Payroll Register - 2020</h6>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Payroll Register 2020 Q1</label>
            <select
              className="form-select"
              value={intakeInfo['2020_q1_payroll']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_q1_payroll': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Payroll Register 2020 Q2</label>
            <select
              className="form-select"
              value={intakeInfo['2020_q2_payroll']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_q2_payroll': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Payroll Register 2020 Q3</label>
            <select
              className="form-select"
              value={intakeInfo['2020_q3_payroll']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_q3_payroll': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Payroll Register 2020 Q4</label>
            <select
              className="form-select"
              value={intakeInfo['2020_q4_payroll']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2020_q4_payroll': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
      </div>

      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">Payroll Register - 2021</h6>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Payroll Register 2021 Q1</label>
            <select
              className="form-select"
              value={intakeInfo['2021_q1_payroll']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2021_q1_payroll': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Payroll Register 2021 Q2</label>
            <select
              className="form-select"
              value={intakeInfo['2021_q2_payroll']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2021_q2_payroll': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Payroll Register 2021 Q3</label>
            <select
              className="form-select"
              value={intakeInfo['2021_q3_payroll']}
              onChange={(e) => setIntakeInfo({...intakeInfo, '2021_q3_payroll': e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">F911 Status</label>
            <select
              className="form-select"
              value={intakeInfo.f911_status}
              onChange={(e) => setIntakeInfo({...intakeInfo, f911_status: e.target.value})}

            >
              <option value="">N/A</option>
              <option value="F911 Sent">F911 Sent</option>
              <option value="F911 Signed">F911 Signed</option>
              <option value="F911 Faxed to TAS">F911 Faxed to TAS</option>
              <option value="In Progress with TAS">In Progress with TAS</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed/Unresolved">Closed/Unresolved</option>
            </select>
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">PPP Details</h5>

      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">PPP 2020 Information</h6>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2020 Applied</label>
            <select
              className="form-select"
              value={intakeInfo.ppp_1_applied}
              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_1_applied: e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2020 Start Date</label>
            <DateInput
              value={intakeInfo.ppp_1_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, ppp_1_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2020 Forgiveness Applied</label>
            <select
              className="form-select"
              value={intakeInfo.ppp_1_forgiveness_applied}
              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_1_forgiveness_applied: e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2020 End Date</label>
            <DateInput
              value={intakeInfo.ppp_1_forgive_app_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, ppp_1_forgive_app_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2020 Amount</label>
            <input
              type="text"
              className="form-control"
              placeholder="PPP 2020 Amount"
              value={intakeInfo.ppp_1_amount}
              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_1_amount: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2020 Wages Allocated</label>
            <input
              type="text"
              className="form-control"
              placeholder="PPP 2020 Wages Allocated"
              value={intakeInfo.ppp_1_wages_allocated}
              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_1_wages_allocated: e.target.value})}

            />
          </div>
        </div>
      </div>

      <h6 className="section-subtitle d-flex align-items-center border-bottom pb-2 mb-3">PPP 2021 Information</h6>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2021 Applied</label>
            <select
              className="form-select"
              value={intakeInfo.ppp_2_applied}
              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2_applied: e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2021 Start Date</label>
            <DateInput
              value={intakeInfo.ppp_2_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, ppp_2_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2021 Forgiveness Applied</label>
            <select
              className="form-select"
              value={intakeInfo.ppp_2_forgiveness_applied}
              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2_forgiveness_applied: e.target.value})}

            >
              <option value="1">N/A</option>
              <option value="2">YES</option>
              <option value="3">NO</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2021 End Date</label>
            <DateInput
              value={intakeInfo.ppp_2_forgive_app_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, ppp_2_forgive_app_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2021 Amount</label>
            <input
              type="text"
              className="form-control"
              placeholder="PPP 2021 Amount"
              value={intakeInfo.ppp_2_amount}
              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2_amount: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">PPP 2021 Wages Allocated</label>
            <input
              type="text"
              className="form-control"
              placeholder="PPP 2021 Wages Allocated"
              value={intakeInfo.ppp_2_wages_allocated}
              onChange={(e) => setIntakeInfo({...intakeInfo, ppp_2_wages_allocated: e.target.value})}

            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-12">
          <div className="form-group">
            <label className="form-label">Additional Comments</label>
            <textarea
              className="form-control"
              rows="3" style={{ resize: 'vertical', minHeight: '70px' }}
              placeholder="Additional Comments"
              value={intakeInfo.additional_comments}
              onChange={(e) => setIntakeInfo({...intakeInfo, additional_comments: e.target.value})}

            ></textarea>
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">FPSO Details</h5>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Attorney Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Attorney Name"
              value={intakeInfo.attorney_name}
              onChange={(e) => setIntakeInfo({...intakeInfo, attorney_name: e.target.value})}

            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Call Date</label>
            <DateInput
              value={intakeInfo.call_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, call_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Call Time</label>
            <input
              type="text"
              className="form-control"
              placeholder="Call Time"
              value={intakeInfo.call_time}
              onChange={(e) => setIntakeInfo({...intakeInfo, call_time: e.target.value})}

            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Memo Received Date</label>
            <DateInput
              value={intakeInfo.memo_received_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, memo_received_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label className="form-label">Memo Cut Off Date</label>
            <DateInput
              value={intakeInfo.memo_cut_off_date}
              onChange={(value) => setIntakeInfo({...intakeInfo, memo_cut_off_date: value})}
              placeholder="MM/DD/YYYY"
            />
          </div>
        </div>
      </div>
        </>
      )}
    </div>

  );
};

export default IntakeTab; 