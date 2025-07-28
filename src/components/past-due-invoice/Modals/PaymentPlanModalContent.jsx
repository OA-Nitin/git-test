const PaymentPlanModalContent = ({ modalData }) => (
  <div className="">
    <h5 className="section-title">Create Payment Plan</h5>
    <div className="form-group">
      <label>Number of Installments</label>
      <select className="form-select">
        <option value="2">2 Installments</option>
        <option value="3">3 Installments</option>
        <option value="4">4 Installments</option>
        <option value="6">6 Installments</option>
      </select>
    </div>
    <div className="form-group mt-3">
      <label>Payment Frequency</label>
      <select className="form-select">
        <option value="weekly">Weekly</option>
        <option value="biweekly">Bi-weekly</option>
        <option value="monthly">Monthly</option>
      </select>
    </div>
  </div>
);

export default PaymentPlanModalContent;
