import React, { useState, useEffect } from 'react';

const CreateUser = () => {
  useEffect(() => {
    document.title = "Create User - Occams Portal"; // Set title for Create User page
  }, []);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userEmail: '',
    userLogin: '',
    userPassword: '',
    userRole: '',
    createWithPasswordLink: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Here you would typically make an API call to create the user
    // For now, we'll just simulate it with a timeout
    setTimeout(() => {
      setMessage('User created successfully!');
      setIsLoading(false);
    }, 1500);
  };

  const checkEmailAvailability = () => {
    // Simulate checking email availability
    alert('Checking email availability...');
  };

  const checkUsernameAvailability = () => {
    // Simulate checking username availability
    alert('Checking username availability...');
  };

  const generatePassword = () => {
    // Generate a random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({
      ...formData,
      userPassword: password
    });
  };

  return (

    <div id="user-creation-form-container">
      <div className="main_content_iner">
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="white_card card_height_100 mb_30">
                <div className="white_card_header">
                  <div className="box_header m-0 new_report_header">
                    <div className="title_img">
                      <img src="/assets/images/Knowledge_Ceter_White.svg" className="page-title-img" alt="" />
                      <h4 className="text-white">Create User</h4>
                    </div>
                  </div>
                </div>
                <div className="white_card_body">
                  <form onSubmit={handleSubmit} id="user-creation-form">
                    <div className="row">
                      <div className="floating col-sm-4">
                        <label>First Name*</label>
                        <input
                          id="firstName"
                          className="floating__input form-control wmd_editor wmm"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="floating col-sm-4">
                        <label>Last Name*</label>
                        <input
                          className="floating__input form-control wmd_editor wmm"
                          name="lastName"
                          type="text"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="floating col-sm-4">
                        <label className="d-flex justify-content-between">
                          Email*
                          <a
                            id="check-email-available"
                            className="check_email"
                            onClick={checkEmailAvailability}
                          >
                            Check Email Availability
                          </a>
                        </label>
                        <input
                          type="email"
                          className="floating__input form-control wmd_editor wmm"
                          name="userEmail"
                          id="userEmail"
                          value={formData.userEmail}
                          onChange={handleChange}
                          required
                        />
                        <span id="email-availability" className="blanker"></span>
                      </div>

                      <div className="floating col-sm-4">
                        <label className="d-flex justify-content-between">
                          Username*
                          <a
                            id="check-username-available"
                            className="check_email"
                            onClick={checkUsernameAvailability}
                          >
                            Check Username Availability
                          </a>
                        </label>
                        <input
                          type="text"
                          className="floating__input form-control wmd_editor wmm"
                          name="userLogin"
                          id="userLogin"
                          value={formData.userLogin}
                          onChange={handleChange}
                          required
                        />
                        <span id="username-availability" className="blanker"></span>
                      </div>

                      <div className="floating col-sm-4">
                        <label className="d-flex justify-content-between">
                          Set Password*
                          <a
                            id="create-password"
                            className="check_email"
                            onClick={generatePassword}
                          >
                            Generate Password
                          </a>
                        </label>
                        <input
                          type="text"
                          minLength="4"
                          maxLength="30"
                          className="floating__input form-control wmd_editor wmm"
                          name="userPassword"
                          id="userPassword"
                          value={formData.userPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="floating col-sm-4 select_role">
                        <label>Role*</label>
                        <select
                          name="userRole"
                          id="userRole"
                          className="form-select"
                          value={formData.userRole}
                          onChange={handleChange}
                          required
                        >
                          <option value="" disabled>Please Select Role</option>
                          <option value="echeck_admin">Echeck Admin</option>
                          <option value="echeck_client">Echeck Client</option>
                          <option value="echeck_staff">Echeck Staff</option>
                          <option value="iris_affiliate_users">Iris Affiliate Users</option>
                          <option value="iris_sales_agent">Iris Sales Agent</option>
                          <option value="iris_sales_agent_rep">Iris Sales Agent Rep</option>
                          <option value="lead">Lead</option>
                          <option value="master_sales">Master Sales</option>
                        </select>
                      </div>
                      <div className="floating col-sm-12">
                        {/* create user with password generation link */}
                        <div className="checkbox-link-container">
                          <input
                            type="checkbox"
                            id="createWithPasswordLink"
                            name="createWithPasswordLink"
                            checked={formData.createWithPasswordLink}
                            onChange={handleChange}
                          />
                          <label htmlFor="createWithPasswordLink" className="link_label">
                            Create User with Password Link
                          </label>
                        </div>
                        <button type="submit" id="create-user-button" className="sendDoc" disabled={isLoading}>
                          {isLoading ? 'Creating...' : 'Create User'}
                        </button>
                      </div>
                    </div>
                  </form>
                  {isLoading && (
                    <div id="waiter">
                      <img src="/assets/images/waiter.gif" alt="Loading..." />
                    </div>
                  )}
                  {message && <div id="creation-message" className="alert alert-success mt-3">{message}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
