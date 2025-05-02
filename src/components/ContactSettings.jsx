import React, { useState, useEffect } from 'react';

const ContactSettings = () => {
  useEffect(() => {
    document.title = "Contact Settings - Occams Portal"; // Set title for Contact Settings page
  }, []);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoResponder: true,
    defaultCategory: 'lead',
    defaultAssignee: 'admin',
    contactLabels: ['important', 'follow-up', 'new-lead'],
    newLabel: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addLabel = () => {
    if (settings.newLabel.trim() !== '' && !settings.contactLabels.includes(settings.newLabel.trim())) {
      setSettings({
        ...settings,
        contactLabels: [...settings.contactLabels, settings.newLabel.trim()],
        newLabel: ''
      });
    }
  };

  const removeLabel = (label) => {
    setSettings({
      ...settings,
      contactLabels: settings.contactLabels.filter(l => l !== label)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would save the settings to a database
    alert('Settings saved successfully!');
  };

  return (
    <div className="main_content_iner">
      <div className="container-fluid p-0">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="white_card card_height_100 mb_30">
              <div className="white_card_header">
                <div className="box_header m-0 new_report_header">
                  <div className="title_img">
                    <img src="/assets/images/Knowledge_Ceter_White.svg" className="page-title-img" alt="" />
                    <h4 className="text-white">Contact Settings</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <h5 className="mb-4">Notification Settings</h5>

                      <div className="form-group mb-3">
                        <div className="checkbox-link-container">
                          <input
                            type="checkbox"
                            id="emailNotifications"
                            name="emailNotifications"
                            checked={settings.emailNotifications}
                            onChange={handleChange}
                          />
                          <label htmlFor="emailNotifications" className="link_label">
                            Email Notifications
                          </label>
                        </div>
                        <small className="form-text text-muted">Receive email notifications when contacts are updated</small>
                      </div>

                      <div className="form-group mb-3">
                        <div className="checkbox-link-container">
                          <input
                            type="checkbox"
                            id="smsNotifications"
                            name="smsNotifications"
                            checked={settings.smsNotifications}
                            onChange={handleChange}
                          />
                          <label htmlFor="smsNotifications" className="link_label">
                            SMS Notifications
                          </label>
                        </div>
                        <small className="form-text text-muted">Receive SMS notifications for important contacts</small>
                      </div>

                      <div className="form-group mb-3">
                        <div className="checkbox-link-container">
                          <input
                            type="checkbox"
                            id="autoResponder"
                            name="autoResponder"
                            checked={settings.autoResponder}
                            onChange={handleChange}
                          />
                          <label htmlFor="autoResponder" className="link_label">
                            Auto Responder
                          </label>
                        </div>
                        <small className="form-text text-muted">Automatically send responses to new contacts</small>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h5 className="mb-4">Default Settings</h5>

                      <div className="form-group mb-3">
                        <label htmlFor="defaultCategory">Default Category</label>
                        <select
                          className="form-control"
                          id="defaultCategory"
                          name="defaultCategory"
                          value={settings.defaultCategory}
                          onChange={handleChange}
                        >
                          <option value="lead">Lead</option>
                          <option value="customer">Customer</option>
                          <option value="partner">Partner</option>
                          <option value="vendor">Vendor</option>
                        </select>
                        <small className="form-text text-muted">Default category for new contacts</small>
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="defaultAssignee">Default Assignee</label>
                        <select
                          className="form-control"
                          id="defaultAssignee"
                          name="defaultAssignee"
                          value={settings.defaultAssignee}
                          onChange={handleChange}
                        >
                          <option value="admin">Admin</option>
                          <option value="sales">Sales Team</option>
                          <option value="support">Support Team</option>
                          <option value="none">No Assignment</option>
                        </select>
                        <small className="form-text text-muted">Default assignee for new contacts</small>
                      </div>
                    </div>

                    <div className="col-md-12 mt-4">
                      <h5 className="mb-4">Contact Labels</h5>

                      <div className="form-group mb-3">
                        <div className="d-flex">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add new label"
                            name="newLabel"
                            value={settings.newLabel}
                            onChange={handleChange}
                          />
                          <button
                            type="button"
                            className="btn btn-primary ml-2"
                            onClick={addLabel}
                            style={{ marginLeft: '10px' }}
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="d-flex flex-wrap">
                          {settings.contactLabels.map((label, index) => (
                            <div key={index} className="badge bg-primary m-1 p-2 d-flex align-items-center">
                              {label}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                onClick={() => removeLabel(label)}
                                style={{ fontSize: '0.5rem', marginLeft: '5px', background: 'none', border: 'none', color: 'white' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12 mt-4">
                      <button type="submit" className="sendDoc">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSettings;
