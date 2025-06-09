import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import "./createContact.css";
import { forwardRef } from "react";
//Date picker custom
//import { createDatepicker } from '../utils/datePick';
//import '../assets/css/datePick.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

axios.defaults.baseURL = "https://portal.occamsadvisory.com/portal/wp-json";
//axios.defaults.baseURL = "https://portal.occamsadvisory.com/portal/wp-json";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

//axios.defaults.withCredentials = true;

const titleOptions = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Miss", label: "Miss" },
];

const phoneTypeOptions = [
  { value: "home", label: "Home" },
  { value: "office", label: "Office" },
  { value: "fax", label: "Fax" },
  { value: "mobile", label: "Mobile" },
];

const dndOptions = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
];

const referralTypeOptions = [
  { value: "1", label: "Internal Users" },
  { value: "2", label: "Affiliate Referral" },
];

const CreateContact = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const leadIdParam = searchParams.get("lead_id");

  // Add validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[\d\s-]{10,}$/;

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        return !value || value === "" ? "Title is required" : "";
      case "first_name":
        return !value.trim() ? "First name is required" : "";
      case "last_name":
        return !value.trim() ? "Last name is required" : "";
      case "email":
        return !value
          ? "Email is required"
          : !emailRegex.test(value)
          ? "Invalid email"
          : "";
      case "secondary_email":
        return value && !emailRegex.test(value) ? "Invalid email" : "";
      case "phone":
        return !value
          ? "Phone is required"
          : !phoneRegex.test(value)
          ? "Invalid phone"
          : "";
      case "secondary_phone":
        return value && !phoneRegex.test(value) ? "Invalid phone" : "";

      // Remove birthdate validation
      case "birthdate":
        return "";

      // Remove mailing info validation
      case "primary_address_postalcode":
        return "";
      case "primary_address_city":
        return "";
      case "primary_address_state":
        return "";
      case "primary_address_street":
        return "";
      case "primary_address_country":
        return "";
      case "house_no":
        return "";

      // Keep other validations
      case "report_to_id":
        return !value || value.length === 0 ? "Business Lead is required" : "";
      case "dnd":
        return !value ? "DND selection is required" : "";
      case "referral_type":
        return !value ? "Referral Type is required" : "";
      case "contact_referral":
        return !value ? "Contact Referral is required" : "";
      default:
        return "";
    }
  };

  const [formData, setFormData] = useState({
    title: "Mr",
    first_name: "",
    middle_name: "",
    last_name: "",
    name_alias: "",
    report_to_id: [],
    department: "",
    birthdate: "",
    email: "",
    phone: "",
    ph_extension: "",
    phone_type: "",
    secondary_email: "",
    secondary_phone: "",
    secondary_phone_type: "",
    primary_address_postalcode: "",
    primary_address_city: "",
    primary_address_state: "",
    primary_address_country: "USA",
    primary_address_street: "",
    house_no: "",
    dnd: "",
    referral_type: "",
    contact_referral: "",
  });

  const [dropdowns, setDropdowns] = useState({
    businessLeads: [],
    salesUsers: [],
    affiliateUsers: [],
  });
  const [userData, setUserData] = useState(null);
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const { businessLeads, salesUsers, affiliateUsers } = dropdowns;

  useEffect(() => {
    const fetchUserAndDropdowns = async () => {
      const userObj = JSON.parse(localStorage.getItem("user"));
      const user = userObj?.data?.user;
      const affiliateRoles = [
        "iris_affiliate_users",
        "account_manager",
        "iris_employee",
        "lead",
      ];
      const isAffiliate = user?.roles?.some((role) =>
        affiliateRoles.includes(role)
      );
      setUserData({ ...user, readonly: isAffiliate, disabled: isAffiliate });

      const [bl, su, au] = await Promise.all([
        axios.get("/oc/v1/business-leads"),
        axios.get("/oc/v1/sales-users"),
        axios.get("/oc/v1/affiliate-users"),
      ]);

      setDropdowns({
        businessLeads: bl.data.data,
        salesUsers: su.data.data,
        affiliateUsers: au.data.data,
      });

      if (id) {
        await fetchContactData();
      } else if (leadIdParam) {
        // Preselect lead_id if provided in URL
        const found = bl.data.data.find((lead) => lead.lead_id == leadIdParam);
        if (found) {
          setFormData((prev) => ({
            ...prev,
            report_to_id: [leadIdParam],
          }));
        }
      }
    };

    const fetchContactData = async () => {
      const [contact, phone, email, address] = await Promise.all([
        axios.get(`/eccom-op-contact/v1/contact/${id}`),
        axios.get(`/eccom-op-phone/v1/phone/${id}`),
        axios.get(`/eccom-op-email/v1/email/${id}`),
        axios.get(`/eccom-op-address/v1/address/${id}`),
      ]);

      setFormData((prev) => ({
        ...prev,
        ...contact.data,
        ...phone.data,
        ...email.data,
        ...address.data,
        report_to_id: contact.data.report_to_id?.split(",") || [],
      }));
    };

    fetchUserAndDropdowns();
    //date
    // setupDateInput({
    //   inputId: "birthdate",
    //   minDate: "1900-01-01", // or leave null if not needed
    //   maxDate: new Date().toISOString().split("T")[0] // disables future dates
    // });

    // setTimeout(() => {
    //   const input = document.getElementById("birthdate");
    //   if (input) {
    //     createDatepicker(
    //       input,
    //       (value) => {
    //         setFormData((prev) => ({
    //           ...prev,
    //           birthdate: value
    //         }));
    //       },
    //       "birthdate",
    //       new Date("1900-01-01"),
    //       new Date()
    //     );
    //   }
    // }, 100);
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        [name]: value || "Mr", // Ensure title is never empty
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Validate field on change
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSelectChange = (option, { name }) => {
    const value = Array.isArray(option)
      ? option.map((opt) => opt.value)
      : option?.value || "";

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Set touched and validate
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const ReadOnlyDateInput = forwardRef(({ value, onClick, onBlur }, ref) => (
    <input
      className="form-control"
      onClick={onClick} // Calendar opens
      value={value} // Show selected date
      onBlur={onBlur}
      readOnly // Prevent typing
      ref={ref}
      placeholder="MM/DD/YYYY"
      style={{ cursor: "pointer", backgroundColor: "#fff" }}
    />
  ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // Define required fields
    const requiredFields = [
      "title",
      "first_name",
      "last_name",
      "email",
      "phone",
      "report_to_id",
      "dnd",
      "referral_type",
      "contact_referral",
    ];

    // Validate only required fields
    const newErrors = {};
    requiredFields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Mark only required fields as touched
    const newTouched = {};
    requiredFields.forEach((key) => {
      newTouched[key] = true;
    });

    setErrors(newErrors);
    setTouched(newTouched);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      setFeedback({
        error: "Please fill in all required fields correctly.",
        success: "",
      });
      return;
    }

    setFeedback({ error: "", success: "" });
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        report_to_id: formData.report_to_id.join(","),
      };
      const method = id ? "put" : "post";
      const url = id
        ? `/eccom-op-contact/v1/contactinone/${id}`
        : "/eccom-op-contact/v1/contactinone";

      const response = await axios({
        method,
        url,
        data: payload,
      });

      const res =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      if (res.code === "success") {
        setFeedback({
          success: res.message || "Success",
          error: "",
        });

        if (!id) {
          // Reset form data
          setFormData({
            title: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            name_alias: "",
            report_to_id: [],
            department: "",
            birthdate: "",
            email: "",
            phone: "",
            ph_extension: "",
            phone_type: "",
            secondary_email: "",
            secondary_phone: "",
            secondary_phone_type: "",
            primary_address_postalcode: "",
            primary_address_city: "",
            primary_address_state: "",
            primary_address_country: "USA",
            primary_address_street: "",
            house_no: "",
            dnd: "",
            referral_type: "",
            contact_referral: "",
          });

          // Reset validation state
          setErrors({});
          setTouched({});

          // Redirect if lead_id is present
          if (leadIdParam) {
            setTimeout(() => {
              navigate(`/lead-detail/${leadIdParam}`);
            }, 2000);
          }
        }
      } else {
        setFeedback({
          error: res.message || "Error occurred",
          success: "",
        });
      }
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Error occurred",
        success: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setFeedback({ error: "", success: "" });

  //   //const requiredFields = ['first_name', 'last_name', 'report_to_id', 'email', 'phone', 'dnd', 'referral_type', 'contact_referral'];
  //   //const missing = requiredFields.filter(f => !formData[f] || (Array.isArray(formData[f]) && !formData[f].length));
  //   //if (missing.length) return setFeedback({ error: `Missing fields: ${missing.join(', ')}`, success: '' });

  //   setIsLoading(true);
  //   try {
  //     const payload = {
  //       ...formData,
  //       report_to_id: formData.report_to_id.join(","),
  //     };
  //     const method = id ? "put" : "post";
  //     const url = id
  //       ? `/eccom-op-contact/v1/contactinone/${id}`
  //       : "/eccom-op-contact/v1/contactinone";
  //     //const res = await axios[method](url, payload);
  //     const response = await axios({
  //       method,
  //       url,
  //       data: payload,
  //       transformResponse: [
  //         (data) => {
  //           try {
  //             return JSON.parse(data);
  //           } catch (e) {
  //             return {
  //               code: "error",
  //               message: "Invalid response from server.",
  //             };
  //           }
  //         },
  //       ],
  //     });
  //     const res = response.data;

  //     //----
  //     //setFeedback({ error: '', success: id ? 'Contact updated successfully' : 'Contact created successfully' });
  //     if (res.code === "success") {
  //       setFeedback({
  //         success: res.message || "Contact saved successfully.",
  //         error: "",
  //       });

  //       // Optional: Reset form only on creation (not update)
  //       if (!id) {
  //         setFormData({
  //           title: "",
  //           first_name: "",
  //           middle_name: "",
  //           last_name: "",
  //           name_alias: "",
  //           report_to_id: [],
  //           department: "",
  //           birthdate: "",
  //           email: "",
  //           phone: "",
  //           ph_extension: "",
  //           phone_type: "",
  //           secondary_email: "",
  //           secondary_phone: "",
  //           secondary_phone_type: "",
  //           primary_address_postalcode: "",
  //           primary_address_city: "",
  //           primary_address_state: "",
  //           primary_address_country: "USA",
  //           primary_address_street: "",
  //           house_no: "",
  //           dnd: "",
  //           referral_type: "",
  //           contact_referral: "",
  //         });
  //       }
  //     } else {
  //       setFeedback({
  //         error: res.message || "Failed to save contact",
  //         success: "",
  //       });
  //     }

  //     // Don't redirect. Show success in place.
  //     //if (!id) navigate(`/contacts/${res.data.id}`);
  //   } catch (err) {
  //     setFeedback({
  //       error: err.response?.data?.message || "Failed to save contact",
  //       success: "",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Add this CSS class to your createContact.css file
  const errorMessageStyle = {
    color: "red",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
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
                      <img
                        src="/reporting/assets/images/Knowledge_Ceter_White.svg"
                        className="page-title-img"
                        alt=""
                      />
                      <h4 className="text-white">
                        {id ? "Update Contact" : "Create Contact"}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="white_card_body">
                  <form onSubmit={handleSubmit} id="user-creation-form">
                    {/* === PROFESSIONAL INFO === */}
                    <div className="form-section">
                      <h4 className="section-title">Professional Info</h4>
                      <div className="row">
                        <div className="floating col-sm-4">
                          <label>First Name*</label>
                          <div className="input-group">
<select
  name="title"
  className={`form-select title-select ${
    touched.title && errors.title ? "is-invalid" : ""
  }`}
  value={formData.title || "Mr"} // Set default value to "Mr"
  onChange={handleChange}
  onBlur={handleBlur}
  disabled={userData?.disabled}
>
  <option value="Mr">Mr</option>
  <option value="Mrs">Mrs</option>
  <option value="Miss">Miss</option>
</select>
                            <input
                              className={`floating__input form-control ${
                                touched.first_name && errors.first_name
                                  ? "is-invalid"
                                  : ""
                              }`}
                              name="first_name"
                              type="text"
                              value={formData.first_name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled={userData?.disabled}
                            />
                          </div>
                          {touched.first_name && errors.first_name && (
                            <div className="errorMsz">{errors.first_name}</div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Middle Name</label>
                          <input
                            className={`form-control ${
                              touched.middle_name && errors.middle_name
                                ? "is-invalid"
                                : ""
                            }`}
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={userData?.disabled}
                          />
                          {touched.middle_name && errors.middle_name && (
                            <div className="errorMsz">{errors.middle_name}</div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Last Name*</label>
                          <input
                            className={`form-control ${
                              touched.last_name && errors.last_name
                                ? "is-invalid"
                                : ""
                            }`}
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={userData?.disabled}
                          />
                          {touched.last_name && errors.last_name && (
                            <div className="errorMsz">{errors.last_name}</div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Alias</label>
                          <input
                            className={`form-control ${
                              touched.name_alias && errors.name_alias
                                ? "is-invalid"
                                : ""
                            }`}
                            name="name_alias"
                            value={formData.name_alias}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={userData?.disabled}
                          />
                          {touched.name_alias && errors.name_alias && (
                            <div className="errorMsz">{errors.name_alias}</div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Business Lead*</label>
                          <Select
                            isMulti
                            name="report_to_id"
                            options={businessLeads.map((lead) => ({
                              value: lead.lead_id,
                              label: lead.business_legal_name,
                            }))}
                            value={businessLeads
                              .filter((lead) =>
                                formData.report_to_id.includes(lead.lead_id)
                              )
                              .map((lead) => ({
                                value: lead.lead_id,
                                label: lead.business_legal_name,
                              }))}
                            onChange={(selected) =>
                              handleSelectChange(selected, {
                                name: "report_to_id",
                              })
                            }
                            isDisabled={userData?.disabled}
                            classNamePrefix="select"
                            className={
                              touched.report_to_id && errors.report_to_id
                                ? "select-error"
                                : ""
                            }
                            placeholder="Select Business Lead"
                          />
                          {touched.report_to_id && errors.report_to_id && (
                            <div className="errorMsz">
                              {errors.report_to_id}
                            </div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Job Title</label>
                          <input
                            className={`form-control ${
                              touched.department && errors.department
                                ? "is-invalid"
                                : ""
                            }`}
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={userData?.disabled}
                          />
                          {touched.department && errors.department && (
                            <div className="errorMsz">{errors.department}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* === PERSONAL INFO === */}
                    {/*
                    <div className="form-section">
                      <h4 className="section-title">Personal Info</h4>
                      <div className="row">
                        <div className="floating col-sm-4 datepicker-container" style={{ position: 'relative' }}>
                          <label>Birth Date</label>
                          <input
                            type="text"
                            id="birthdate"
                            name="birthdate"
                            placeholder="MM/DD/YYYY"
                            value={formData.birthdate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
*/}
                    <div className="form-section">
                      <h4 className="section-title">Personal Info</h4>
                      <div className="row">
                        <div className="floating col-sm-4">
                          <label>Birth Date</label>
                          <DatePicker
                            selected={formData.birthdate ? new Date(formData.birthdate + 'T00:00:00') : null}
                            onChange={(date) => {
                              if (date) {
                                // Get the date in local timezone
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const formatted = `${year}-${month}-${day}`;
                                
                                setFormData((prev) => ({
                                  ...prev,
                                  birthdate: formatted,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  birthdate: '',
                                }));
                              }
                            }}
                            dateFormat="MM/dd/yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="scroll"
                            scrollableYearDropdown
                            yearDropdownItemNumber={120}
                            minDate={new Date("1900-01-01")}
                            maxDate={new Date()}
                            customInput={<ReadOnlyDateInput />}
                            // Add these props to fix timezone issues
                            utcOffset={0}
                            timeZone="UTC"
                          />
                        </div>
                      </div>
                    </div>

                    {/* === CONTACT INFO === */}
                    <div className="form-section">
                      <h4 className="section-title">Contact Info</h4>
                      <div className="row">
                        <div className="floating col-sm-4">
                          <label>Primary Email*</label>
                          <input
                            type="email"
                            className={`form-control ${
                              touched.email && errors.email ? "is-invalid" : ""
                            }`}
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {touched.email && errors.email && (
                            <div className="errorMsz">{errors.email}</div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Primary Phone*</label>
                          <div className="input-group">
                            <span className="input-group-text">+1</span>
                            <input
                              type="tel"
                              className={`form-control ${
                                touched.phone && errors.phone
                                  ? "is-invalid"
                                  : ""
                              }`}
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          </div>
                          {touched.phone && errors.phone && (
                            <div className="errorMsz">{errors.phone}</div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Ext.</label>
                          <input
                            type="text"
                            className={`form-control ${
                              touched.ph_extension && errors.ph_extension
                                ? "is-invalid"
                                : ""
                            }`}
                            name="ph_extension"
                            value={formData.ph_extension}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {touched.ph_extension && errors.ph_extension && (
                            <div className="errorMsz">
                              {errors.ph_extension}
                            </div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Primary Phone Type</label>
                          <Select
                            name="phone_type"
                            options={phoneTypeOptions}
                            value={phoneTypeOptions.find(
                              (opt) => opt.value === formData.phone_type
                            )}
                            onChange={handleSelectChange}
                            classNamePrefix="select"
                            className={
                              touched.phone_type && errors.phone_type
                                ? "select-error"
                                : ""
                            }
                            isSearchable={false}
                            isDisabled={userData?.disabled}
                            placeholder="Select Phone Type"
                          />
                          {touched.phone_type && errors.phone_type && (
                            <div className="errorMsz">{errors.phone_type}</div>
                          )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Secondary Email</label>
                          <input
                            type="email"
                            className={`form-control ${
                              touched.secondary_email && errors.secondary_email
                                ? "is-invalid"
                                : ""
                            }`}
                            name="secondary_email"
                            value={formData.secondary_email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {touched.secondary_email &&
                            errors.secondary_email && (
                              <div className="errorMsz">
                                {errors.secondary_email}
                              </div>
                            )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Secondary Phone</label>
                          <div className="input-group">
                            <span className="input-group-text">+1</span>
                            <input
                              type="tel"
                              className={`form-control ${
                                touched.secondary_phone &&
                                errors.secondary_phone
                                  ? "is-invalid"
                                  : ""
                              }`}
                              name="secondary_phone"
                              value={formData.secondary_phone}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          </div>
                          {touched.secondary_phone &&
                            errors.secondary_phone && (
                              <div className="errorMsz">
                                {errors.secondary_phone}
                              </div>
                            )}
                        </div>
                        <div className="floating col-sm-4">
                          <label>Secondary Phone Type</label>
                          <Select
                            name="secondary_phone_type"
                            options={phoneTypeOptions}
                            value={phoneTypeOptions.find(
                              (opt) =>
                                opt.value === formData.secondary_phone_type
                            )}
                            onChange={handleSelectChange}
                            classNamePrefix="select"
                            className={
                              touched.secondary_phone_type &&
                              errors.secondary_phone_type
                                ? "select-error"
                                : ""
                            }
                            isSearchable={false}
                            isDisabled={userData?.disabled}
                            placeholder="Select Secondary Phone Type"
                          />
                          {touched.secondary_phone_type &&
                            errors.secondary_phone_type && (
                              <div className="errorMsz">
                                {errors.secondary_phone_type}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* === MAILING INFO === */}
                    <div className="form-section">
                      <h4 className="section-title">Mailing Info</h4>
                      <div className="row">
                        <div className="floating col-sm-4">
                          <label>Zip Code</label>
                          <input
                            type="text"
                            className="form-control"
                            name="primary_address_postalcode"
                            value={formData.primary_address_postalcode}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="floating col-sm-4">
                          <label>City</label>
                          <input
                            type="text"
                            className="form-control"
                            name="primary_address_city"
                            value={formData.primary_address_city}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="floating col-sm-4">
                          <label>State</label>
                          <input
                            type="text"
                            className="form-control"
                            name="primary_address_state"
                            value={formData.primary_address_state}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="floating col-sm-4">
                          <label>Country</label>
                          <input
                            type="text"
                            className="form-control"
                            name="primary_address_country"
                            value={formData.primary_address_country}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="floating col-sm-4">
                          <label>Street Address</label>
                          <input
                            type="text"
                            className="form-control"
                            name="primary_address_street"
                            value={formData.primary_address_street}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="floating col-sm-4">
                          <label>Apt/Suite/House</label>
                          <input
                            type="text"
                            className="form-control"
                            name="house_no"
                            value={formData.house_no}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* === CONTACT PREFERENCES === */}
                    <div className="form-section">
                      <h4 className="section-title">Contact Preferences</h4>
                      <div className="row">
                        <div className="floating col-sm-4">
                          <label>DND*</label>
                          <Select
                            name="dnd" // or any field name
                            options={dndOptions} // your options
                            value={dndOptions.find(
                              (opt) => opt.value === formData.dnd
                            )}
                            onChange={handleSelectChange}
                            classNamePrefix="select"
                            className={
                              touched.dnd && errors.dnd ? "select-error" : ""
                            }
                            isSearchable={false}
                            isDisabled={userData?.disabled}
                            placeholder="Select DND"
                          />
                          {touched.dnd && errors.dnd && (
                            <div className="errorMsz">{errors.dnd}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* === REFERRAL INFO === */}
                    <div className="form-section">
                      <h4 className="section-title">Referral Info</h4>
                      <div className="row">
                        <div className="floating col-sm-4">
                          <label>Referral Type*</label>
                          <Select
                            name="referral_type"
                            options={referralTypeOptions}
                            value={referralTypeOptions.find(
                              (opt) => opt.value === formData.referral_type
                            )}
                            onChange={handleSelectChange}
                            classNamePrefix="select"
                            className={
                              touched.referral_type && errors.referral_type
                                ? "select-error"
                                : ""
                            }
                            isSearchable={false}
                            isDisabled={userData?.disabled}
                            placeholder="Select Referral Type"
                          />
                          {touched.referral_type && errors.referral_type && (
                            <div className="errorMsz">
                              {errors.referral_type}
                            </div>
                          )}
                        </div>

                        <div className="floating col-sm-4">
                          <label>Contact Referral*</label>
                          <Select
                            name="contact_referral"
                            options={(formData.referral_type === "1"
                              ? salesUsers
                              : affiliateUsers
                            ).map((user) => ({
                              value: user.userid || user.id,
                              label: user.name || user.display_name,
                            }))}
                            value={(formData.referral_type === "1"
                              ? salesUsers
                              : affiliateUsers
                            )
                              .map((user) => ({
                                value: user.userid || user.id,
                                label: user.name || user.display_name,
                              }))
                              .find(
                                (option) =>
                                  option.value === formData.contact_referral
                              )}
                            onChange={(selected) =>
                              handleSelectChange(selected, {
                                name: "contact_referral",
                              })
                            }
                            classNamePrefix="select"
                            className={
                              touched.contact_referral &&
                              errors.contact_referral
                                ? "select-error"
                                : ""
                            }
                            isSearchable={false}
                            placeholder="Select Contact Referral"
                            isDisabled={userData?.disabled}
                            isLoading={isLoadingUsers}
                          />
                          {touched.contact_referral &&
                            errors.contact_referral && (
                              <div className="errorMsz">
                                {errors.contact_referral}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* === SUBMIT === */}
                    <div className="floating col-sm-12">
                      <button
                        type="submit"
                        id="create-contact-button"
                        className="sendDoc"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? "Saving..."
                          : id
                          ? "Update Contact"
                          : "Create Contact"}
                      </button>
                    </div>
                  </form>

                  {isLoading && (
                    <div id="waiter">
                      {/* <img src="/assets/images/waiter.gif" alt="Loading..." /> */}
                    </div>
                  )}

                  {feedback.error && (
                    <div className="alert alert-danger">{feedback.error}</div>
                  )}
                  {feedback.success && (
                    <div className="alert alert-success">
                      {feedback.success}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContact;
