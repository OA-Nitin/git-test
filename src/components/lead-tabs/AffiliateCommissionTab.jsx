import React from 'react';

const AffiliateCommissionTab = ({
  tier1CommissionBasis,
  tier1ReferrerType,
  tier1ReferrerFixed,
  referrer_percentage,
  tier1InvoiceAmount,
  tier2CommissionBasis,
  tier2CommissionType,
  tier2ReferrerFixed,
  tier2ErcChgReceived,
  tier2InvoiceAmount,
  tier3CommissionBasis,
  tier3CommissionType,
  tier3ReferrerFixed,
  tier3ErcChgReceived,
  tier3InvoiceAmount,
  currentTier,
  slab1AppliedOn,
  slab1CommissionType,
  slab1CommissionValue,
  slab2AppliedOn,
  slab2CommissionType,
  slab2CommissionValue,
  slab3AppliedOn,
  slab3CommissionType,
  slab3CommissionValue,
  masterCommissionType,
  masterCommissionValue,
  handleTier1CommissionBasisChange,
  handleTier1ReferrerTypeChange,
  handleTier1ReferrerFixedChange,
  handlereferrer_percentageChange,
  handleTier1InvoiceAmountChange,
  handleTier2CommissionBasisChange,
  handleTier2CommissionTypeChange,
  handleTier2ReferrerFixedChange,
  handleTier2ErcChgReceivedChange,
  handleTier2InvoiceAmountChange,
  handleTier3CommissionBasisChange,
  handleTier3CommissionTypeChange,
  handleTier3ReferrerFixedChange,
  handleTier3ErcChgReceivedChange,
  handleTier3InvoiceAmountChange,
  handleCurrentTierChange,
  handleSlab1AppliedOnChange,
  handleSlab1CommissionTypeChange,
  handleSlab1CommissionValueChange,
  handleSlab2AppliedOnChange,
  handleSlab2CommissionTypeChange,
  handleSlab2CommissionValueChange,
  handleSlab3AppliedOnChange,
  handleSlab3CommissionTypeChange,
  handleSlab3CommissionValueChange,
  handleMasterCommissionTypeChange,
  handleMasterCommissionValueChange
}) => {
  return (
    <div className="mb-4 left-section-container">
      <h5 className="section-title">Tier 1 Affiliate Commission</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Affiliate Commission Basis</label>
            <select
              className="form-select"
              name="affiliate_commision_basis"
              value={tier1CommissionBasis?.value || ''}
              onChange={(e) => handleTier1CommissionBasisChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Affiliate Commission Basis</option>
              <option value="erc-chq-received">ERC Chq Received</option>
              <option value="erc-invoice-amount">ERC Invoice Amount</option>
              <option value="lower-of-both">Lower of Both</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Affiliate Commission Type</label>
            <select
              className="form-select"
              name="affiliate_commision_type"
              value={tier1ReferrerType?.value || ''}
              onChange={(e) => handleTier1ReferrerTypeChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Referrer Fixed</label>
            <input
              type="text"
              className="form-control"
              name="referrer_fixed"
              value={tier1ReferrerFixed || ''}
              onChange={handleTier1ReferrerFixedChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Referrer Percentage</label>
            <input
              type="text"
              className="form-control"
              name="referrer_percentage"
              value={referrer_percentage || ''}
              onChange={handlereferrer_percentageChange}
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Invoice Amount</label>
            <input
              type="text"
              className="form-control"
              name="referrer_percentage2"
              value={tier1InvoiceAmount || ''}
              onChange={handleTier1InvoiceAmountChange}
            />
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Tier 2 Affiliate Commission</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Commission Basis</label>
            <select
              className="form-select"
              name="tier2_commission_basis"
              value={tier2CommissionBasis?.value || ''}
              onChange={(e) => handleTier2CommissionBasisChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Basis</option>
              <option value="erc-chq-received">ERC Chq Received</option>
              <option value="erc-invoice-amount">ERC Invoice Amount</option>
              <option value="lower-of-both">Lower of Both</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Commission Type</label>
            <select
              className="form-select"
              name="tier2_commission_type"
              value={tier2CommissionType?.value || ''}
              onChange={(e) => handleTier2CommissionTypeChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Referrer Fixed</label>
            <input
              type="text"
              className="form-control"
              name="tier2_referrer_fixed"
              value={tier2ReferrerFixed || ''}
              onChange={handleTier2ReferrerFixedChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">ERC Chq Received</label>
            <input
              type="text"
              className="form-control"
              name="tier2_erc_chq_received"
              value={tier2ErcChgReceived || ''}
              onChange={handleTier2ErcChgReceivedChange}
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Invoice Amount</label>
            <input
              type="text"
              className="form-control"
              name="tier2_invoice_amount"
              value={tier2InvoiceAmount || ''}
              onChange={handleTier2InvoiceAmountChange}
            />
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Tier 3 Affiliate Commission</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Commission Basis</label>
            <select
              className="form-select"
              name="tier3_commission_basis"
              value={tier3CommissionBasis?.value || ''}
              onChange={(e) => handleTier3CommissionBasisChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Basis</option>
              <option value="erc-chq-received">ERC Chq Received</option>
              <option value="erc-invoice-amount">ERC Invoice Amount</option>
              <option value="lower-of-both">Lower of Both</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Commission Type</label>
            <select
              className="form-select"
              name="tier3_commission_type"
              value={tier3CommissionType?.value || ''}
              onChange={(e) => handleTier3CommissionTypeChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Referrer Fixed</label>
            <input
              type="text"
              className="form-control"
              name="tier3_referrer_fixed"
              value={tier3ReferrerFixed || ''}
              onChange={handleTier3ReferrerFixedChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">ERC Chq Received</label>
            <input
              type="text"
              className="form-control"
              name="tier3_erc_chq_received"
              value={tier3ErcChgReceived || ''}
              onChange={handleTier3ErcChgReceivedChange}
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Invoice Amount</label>
            <input
              type="text"
              className="form-control"
              name="tier3_invoice_amount"
              value={tier3InvoiceAmount || ''}
              onChange={handleTier3InvoiceAmountChange}
            />
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Current Tier</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Current Tier</label>
            <select
              className="form-select"
              name="current_tier"
              value={currentTier?.value || ''}
              onChange={(e) => handleCurrentTierChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Current Tier</option>
              <option value="tier1">Tier 1</option>
              <option value="tier2">Tier 2</option>
              <option value="tier3">Tier 3</option>
            </select>
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Affiliate Slab Commission</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 1 Applied On</label>
            <input
              type="text"
              className="form-control"
              name="slab1_applied_on"
              value={slab1AppliedOn || ''}
              onChange={handleSlab1AppliedOnChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 1 Commission Type</label>
            <select
              className="form-select"
              name="slab1_commission_type"
              value={slab1CommissionType?.value || ''}
              onChange={(e) => handleSlab1CommissionTypeChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 1 Commission Value</label>
            <input
              type="text"
              className="form-control"
              name="slab1_commission_value"
              value={slab1CommissionValue || ''}
              onChange={handleSlab1CommissionValueChange}
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 2 Applied On</label>
            <input
              type="text"
              className="form-control"
              name="slab2_applied_on"
              value={slab2AppliedOn || ''}
              onChange={handleSlab2AppliedOnChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 2 Commission Type</label>
            <select
              className="form-select"
              name="slab2_commission_type"
              value={slab2CommissionType?.value || ''}
              onChange={(e) => handleSlab2CommissionTypeChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 2 Commission Value</label>
            <input
              type="text"
              className="form-control"
              name="slab2_commission_value"
              value={slab2CommissionValue || ''}
              onChange={handleSlab2CommissionValueChange}
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 3 Applied On</label>
            <input
              type="text"
              className="form-control"
              name="slab3_applied_on"
              value={slab3AppliedOn || ''}
              onChange={handleSlab3AppliedOnChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 3 Commission Type</label>
            <select
              className="form-select"
              name="slab3_commission_type"
              value={slab3CommissionType?.value || ''}
              onChange={(e) => handleSlab3CommissionTypeChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Slab 3 Commission Value</label>
            <input
              type="text"
              className="form-control"
              name="slab3_commission_value"
              value={slab3CommissionValue || ''}
              onChange={handleSlab3CommissionValueChange}
            />
          </div>
        </div>
      </div>

      <h5 className="section-title mt-4">Master Affiliate Commission</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Master Commission Type</label>
            <select
              className="form-select"
              name="master_commission_type"
              value={masterCommissionType?.value || ''}
              onChange={(e) => handleMasterCommissionTypeChange({
                value: e.target.value,
                label: e.target.options[e.target.selectedIndex].text
              })}
            >
              <option value="">Select Commission Type</option>
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Master Commission Value</label>
            <input
              type="text"
              className="form-control"
              name="master_commission_value"
              value={masterCommissionValue || ''}
              onChange={handleMasterCommissionValueChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateCommissionTab; 