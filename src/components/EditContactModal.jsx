import { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import "./EditContactModal.css";
import LoadingOverlay from "./common/LoadingOverlay";
import Swal from "sweetalert2";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactSchema } from "./validationSchemas/leadSchema.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReadOnlyDateInput = forwardRef(({ value, onClick, onBlur }, ref) => (
  <input
    className="form-control"
    onClick={onClick}
    value={value}
    onBlur={onBlur}
    readOnly
    ref={ref}
    placeholder="MM/DD/YYYY"
  />
));

const EditContactModal = ({ isOpen, onClose, contactId, leadId: propLeadId }) => {
  // Centralized state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [businessOptions, setBusinessOptions] = useState([]);
  const [contactTypeOptions, setContactTypeOptions] = useState([]);
  const [contactReferralOptions, setContactReferralOptions] = useState([]);
  const [leadId, setLeadId] = useState("");
  const [isUserReferralTypeChange, setIsUserReferralTypeChange] = useState(false);
  const [prevContactType, setPrevContactType] = useState('');

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: "onSubmit",
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      name_alias: "",
      title: "Mr",
      birthdate: "",
      department: "",
      report_to_id: "",
      dnd: "No",
      contact_type: "primary",
      contact_referral: "",
      referral_type: "",
      phone: "",
      phone_type: "Office",
      ph_extension: "",
      secondary_phone: "",
      secondary_phone_type: "Mobile",
      email: "",
      secondary_email: "",
      primary_address_street: "",
      house_no: "",
      primary_address_city: "",
      primary_address_state: "",
      primary_address_postalcode: "",
      primary_address_country: "",
      selected_businesses: [],
    },
  });

  // Watchers for interdependent fields
  const referralType = watch("referral_type");
  const selectedBusinesses = watch("selected_businesses");

  // Utility: Parse date string to YYYY-MM-DD
  const parseToDateString = (rawDate) => {
    if (!rawDate) return "";
    if (rawDate.includes("T")) {
      try {
        const date = new Date(rawDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      } catch (e) {}
    }
    const dateParts = rawDate.split(/[-/]/).map((part) => part.trim());
    let year, month, day;
    if (dateParts[0].length === 4) {
      if (parseInt(dateParts[1]) > 12) {
        year = dateParts[0];
        day = dateParts[1];
        month = dateParts[2];
      } else {
        year = dateParts[0];
        month = dateParts[1];
        day = dateParts[2];
      }
    } else if (dateParts[2] && dateParts[2].length === 4) {
      if (parseInt(dateParts[0]) > 12) {
        day = dateParts[0];
        month = dateParts[1];
        year = dateParts[2];
      } else {
        month = dateParts[0];
        day = dateParts[1];
        year = dateParts[2];
      }
    } else {
      return "";
    }
    if (!year || !month || !day) return "";
    try {
      const dateObj = new Date(`${year}-${month}-${day}T00:00:00Z`);
      if (isNaN(dateObj.getTime())) return "";
      return dateObj.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // API: Fetch contact types
  const fetchContactTypes = async (leadId) => {
    try {
      const res = await axios.post(
        "https://portal.occamsadvisory.com/portal/wp-json/eccom-op-contact/v1/contact_type_options",
        { lead_id: leadId }
      );
      if (res.data.status === 200 && Array.isArray(res.data.data)) {
        setContactTypeOptions(res.data.data);
      } else {
        setContactTypeOptions(["primary", "secondary"]);
      }
    } catch {
      setContactTypeOptions(["primary", "secondary"]);
    }
  };

  // API: Fetch contact referrals
  const fetchContactReferrals = async (type, shouldReset = false, apiValue = "") => {
    try {
      const response = await axios.get(
        `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/contact-referrals?type=${type}`
      );
      let referrals = [];
      if (Array.isArray(response.data)) {
        referrals = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        referrals = response.data.data;
      } else if (typeof response.data === "object") {
        referrals = Object.keys(response.data).map((key) => ({
          id: key,
          name: response.data[key],
        }));
      }
      setContactReferralOptions(
        referrals.map((ref) => ({
          value: String(ref.user_id || ref.userid || ref.id || ""),
          label: ref.name || ref.label || ref.full_name || "",
        }))
      );
      if (shouldReset) {
        setValue("contact_referral", ""); // User manually changed referral type, so blank
      } else {
        // Modal load: set from API value if present, else blank
        if (apiValue && referrals.some(ref => String(ref.user_id || ref.userid || ref.id || "") === String(apiValue))) {
          setValue("contact_referral", String(apiValue));
        } else {
          setValue("contact_referral", "");
        }
      }
    } catch {
      setContactReferralOptions([]);
      setValue("contact_referral", "");
    }
  };

  // API: Fetch contact data
  const fetchContactData = async (leadId, contactId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `https://portal.occamsadvisory.com/portal/wp-json/v1/lead-contacts`,
        { lead_id: leadId, contact_id: contactId }
      );
      let contactData = null;
      if (response.data.status === 200 && response.data.data) {
        contactData = response.data.data;
      } else if (Array.isArray(response.data)) {
        contactData = response.data.find(
          (contact) =>
            contact.contact_id === contactId ||
            contact.contact_id === parseInt(contactId)
        );
      } else if (
        response.data.contacts &&
        Array.isArray(response.data.contacts)
      ) {
        contactData = response.data.contacts.find(
          (contact) =>
            contact.contact_id === contactId ||
            contact.contact_id === parseInt(contactId)
        );
      } else if (response.data.contact_id) {
        contactData = response.data;
      }
      if (!contactData) {
        setError(`Contact with ID ${contactId} not found in the response.`);
        setLoading(false);
        return;
      }
      // Business info
      let businessInfo = [];
      let selectedBusinesses = [];
      if (
        contactData.business_info &&
        Array.isArray(contactData.business_info)
      ) {
        businessInfo = contactData.business_info;
        setBusinessOptions(
          businessInfo.map((business) => ({
            value: business.lead_id,
            label: business.business_legal_name,
          }))
        );
        if (contactData.report_to_id) {
          const selectedBusiness = businessInfo.find(
            (business) => business.lead_id === contactData.report_to_id
          );
          if (selectedBusiness) {
            selectedBusinesses = [selectedBusiness.lead_id];
          }
        }
      }
      if (!selectedBusinesses.length && leadId) {
        selectedBusinesses = [leadId];
      }
      // Set all form values, always as strings
      reset({
        first_name: contactData.first_name || "",
        middle_name: contactData.middle_name || "",
        last_name: contactData.last_name || "",
        name_alias: contactData.name_alias || "",
        title: contactData.title || "Mr",
        birthdate: parseToDateString(contactData.birthdate),
        department: contactData.department || "",
        report_to_id: contactData.report_to_id ? String(contactData.report_to_id) : "",
        dnd: contactData.dnd === "1" ? "Yes" : "No",
        contact_type: contactData.contact_type || "primary",
        contact_referral: contactData.contact_referral ? String(contactData.contact_referral) : "",
        referral_type: contactData.referral_type ? String(contactData.referral_type) : "",
        phone: contactData.phone || "",
        phone_type: contactData.phone_type || "Office",
        ph_extension: contactData.ph_extension ? String(contactData.ph_extension) : "",
        secondary_phone: contactData.secondary_phone || "",
        secondary_phone_type: contactData.secondary_phone_type || "Mobile",
        email: contactData.email || "",
        secondary_email: contactData.secondary_email || "",
        primary_address_street: contactData.primary_address_street || "",
        house_no: contactData.house_no || "",
        primary_address_city: contactData.primary_address_city || "",
        primary_address_state: contactData.primary_address_state || "",
        primary_address_postalcode: contactData.primary_address_postalcode || "",
        primary_address_country: contactData.primary_address_country || "",
        selected_businesses: selectedBusinesses.map(String),
      });
      // Fetch referrals for referral_type, pass API value
      if (contactData.referral_type) {
        let referralTypeParam = "";
        if (contactData.referral_type === "1") referralTypeParam = "internal_user";
        else if (contactData.referral_type === "2") referralTypeParam = "affiliate_referral";
        if (referralTypeParam) await fetchContactReferrals(referralTypeParam, false, contactData.contact_referral);
      } else {
        await fetchContactReferrals("affiliate_referral", false, contactData.contact_referral);
      }
      setPrevContactType(contactData.contact_type || 'primary');
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // API: Update contact
  const updateContact = async (data) => {
    setUpdateSuccess(false);
    setUpdateError(null);
    setLoading(true);
    try {
      let formattedBirthdate = "";
      if (data.birthdate) {
        if (typeof data.birthdate === "string" && data.birthdate.includes("T")) {
          formattedBirthdate = data.birthdate.split("T")[0];
        } else if (typeof data.birthdate === "string") {
          formattedBirthdate = data.birthdate;
        } else if (data.birthdate instanceof Date && !isNaN(data.birthdate.getTime())) {
          const year = data.birthdate.getFullYear();
          const month = String(data.birthdate.getMonth() + 1).padStart(2, "0");
          const day = String(data.birthdate.getDate()).padStart(2, "0");
          formattedBirthdate = `${year}-${month}-${day}`;
        }
      }
      const submitData = {
        ...data,
        birthdate: formattedBirthdate,
        dnd: data.dnd === "Yes" ? "1" : "0",
        contact_id: contactId,
        report_to_id:
          data.report_to_id ||
          (data.selected_businesses && data.selected_businesses.length > 0
            ? data.selected_businesses[0]
            : ""),
      };
      const response = await axios.put(
        `https://portal.occamsadvisory.com/portal/wp-json/eccom-op-contact/v1/contactinone/${contactId}`,
        submitData
      );
      if (response.data && JSON.parse(response.data).code == "success") {
        Swal.fire({
          title: "Success!",
          text: "Contact updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          setUpdateSuccess(false);
          setUpdateError(null);
          onClose();
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to update contact. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while updating the contact. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set leadId from prop or URL
  useEffect(() => {
    if (propLeadId) setLeadId(propLeadId);
    else {
      const pathParts = window.location.pathname.split("/");
      const id = pathParts[pathParts.length - 1];
      if (id && !isNaN(id)) setLeadId(id);
    }
  }, [propLeadId]);

  // Fetch all data when modal opens
  useEffect(() => {
    if (isOpen && contactId && leadId) {
      fetchContactTypes(leadId);
      fetchContactData(leadId, contactId);
    }
  }, [isOpen, contactId, leadId]);

  // Fetch referrals when referralType changes
  useEffect(() => {
    if (!isOpen) return;
    let referralTypeParam = "";
    if (referralType === "1") referralTypeParam = "internal_user";
    else if (referralType === "2") referralTypeParam = "affiliate_referral";
    if (referralTypeParam && isUserReferralTypeChange) {
      fetchContactReferrals(referralTypeParam, true);
      setIsUserReferralTypeChange(false);
    } else if (!referralTypeParam) {
      setContactReferralOptions([]);
      setValue("contact_referral", "");
    }
  }, [referralType, isOpen, setValue, isUserReferralTypeChange]);

  // Handle form submit
  const onSubmit = async (data) => {
    setLoading(true);
    setUpdateError(null);
    try {
      // 1. Contact Type Conflict Check
      const checkRes = await axios.post(
        "https://portal.occamsadvisory.com/portal/wp-json/eccom-op-contact/v1/check_contact_type",
        {
          lead_id: leadId,
          contact_id: contactId,
          contact_type: data.contact_type,
        }
      );
      const add_json = typeof checkRes.data === "string" ? JSON.parse(checkRes.data) : checkRes.data;

      if (add_json.code === "success" || add_json.code === "no_change") {
        // 2. No conflict, direct update
        await updateContact(data);
      } else {
        // 3. Conflict, show swal
        const result = await Swal.fire({
          title: "",
          text: add_json.message || "Contact type conflict. Do you want to assign anyway?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
        });
        if (result.isConfirmed) {
          // 4. User confirmed, call change_contact_type API
          const changeRes = await axios.post(
            "https://portal.occamsadvisory.com/portal/wp-json/eccom-op-contact/v1/change_contact_type",
            {
              lead_id: leadId,
              contact_type: data.contact_type,
              contact_id: contactId,
              old_contact_id: add_json.old_contact_id,
              user_id: window.currentUserId || "",
            }
          );
          const change_json = typeof changeRes.data === "string" ? JSON.parse(changeRes.data) : changeRes.data;
          if (change_json.code === "success") {
            // 5. Now update contact
            await updateContact(data);
          } else {
            Swal.fire("", "Failed to update contact type!", "error");
          }
        } else {
          // 6. User cancelled, reset contact_type field
          setValue("contact_type", "");
          setLoading(false);
        }
      }
    } catch (err) {
      setUpdateError("Error while updating contact type. Please try again.");
      setLoading(false);
    }
  };

  // Define the desired order for contact_type
  const contactTypeOrder = [
    'primary',
    'secondary',
    'tertiary',
    'quaternary',
    'quinary',
    'senary',
    'septenary',
    'octonary',
    'nonary',
    'denary'
  ];

  // Sort contactTypeOptions before rendering
  const getSortedContactTypeOptions = (options) => {
    return options.slice().sort((a, b) => {
      const aVal = typeof a === 'string' ? a : (a.value || '');
      const bVal = typeof b === 'string' ? b : (b.value || '');
      const aIndex = contactTypeOrder.indexOf(aVal.toLowerCase());
      const bIndex = contactTypeOrder.indexOf(bVal.toLowerCase());
      if (aIndex === -1 && bIndex === -1) {
        return aVal.localeCompare(bVal);
      }
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const sortedContactTypeOptions = getSortedContactTypeOptions(contactTypeOptions.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt.charAt(0).toUpperCase() + opt.slice(1) } : opt
  ));

  // When contact data loads, always set the dropdown to the loaded value (or first option)
  useEffect(() => {
    // watch('contact_type') is the current value in the form
    // prevContactType is the last loaded value
    // sortedContactTypeOptions is always sorted
    const current = watch('contact_type');
    if (!current || !sortedContactTypeOptions.find(opt => opt.value === current)) {
      // If no value or value not in options, set to loaded or first
      if (prevContactType && sortedContactTypeOptions.find(opt => opt.value === prevContactType)) {
        setValue('contact_type', prevContactType);
      } else if (sortedContactTypeOptions.length > 0) {
        setValue('contact_type', sortedContactTypeOptions[0].value);
        setPrevContactType(sortedContactTypeOptions[0].value);
      }
    }
  }, [contactTypeOptions, prevContactType, setValue, watch, sortedContactTypeOptions]);

  if (!isOpen) return null;

  return (
    <>
      <LoadingOverlay isVisible={loading} message={updateSuccess ? "Saving contact..." : "Loading contact data..."} />
      <div className="modal-backdrop show" onClick={onClose}>
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{contactId ? `${watch("first_name")} ${watch("last_name")}` : "Contact"}</h5>
                <button type="button" className="btn-close" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}></button>
              </div>
              <div className="modal-body">
                {error ? (
                  <div className="error-message">
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => fetchContactData(leadId, contactId)}>Retry</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Professional Info Section */}
                    <h5 className="section-title">Professional Info</h5>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="first_name">First Name:*</label>
                          <div className="input-group">
                            <select className={`form-select title-select ${errors.title ? "is-invalid" : ""}`} {...register("title")} name="title">
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Ms">Ms</option>
                              <option value="Dr">Dr</option>
                            </select>
                            <input type="text" id="first_name" name="first_name" className={`form-control ${errors.first_name ? "is-invalid" : ""}`} {...register("first_name")} />
                            {errors.first_name && <div className="invalid-feedback d-block">{errors.first_name.message}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="middle_name">Middle Name:</label>
                          <input type="text" id="middle_name" name="middle_name" className={`form-control ${errors.middle_name ? "is-invalid" : ""}`} {...register("middle_name")} />
                          {errors.middle_name && <div className="invalid-feedback">{errors.middle_name.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="last_name">Last Name:*</label>
                          <input type="text" id="last_name" name="last_name" className={`form-control ${errors.last_name ? "is-invalid" : ""}`} {...register("last_name")} />
                          {errors.last_name && <div className="invalid-feedback">{errors.last_name.message}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="name_alias">Alias:</label>
                          <input type="text" id="name_alias" name="name_alias" className={`form-control ${errors.name_alias ? "is-invalid" : ""}`} {...register("name_alias")} />
                          {errors.name_alias && <div className="invalid-feedback">{errors.name_alias.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="business_name">Business Name:*</label>
                          <Controller
                            name="selected_businesses"
                            control={control}
                            render={({ field }) => (
                              <select
                                id="selected_businesses"
                                className={`form-select ${errors.selected_businesses ? "is-invalid" : ""}`}
                                {...field}
                                multiple
                                disabled
                                style={{ backgroundColor: "#e9ecef", pointerEvents: "none", color: "#6c757d" }}
                              >
                                {businessOptions.map((business) => (
                                  <option key={business.value} value={business.value}>
                                    {business.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                          {errors.selected_businesses && <div className="invalid-feedback">{errors.selected_businesses.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="department">Job Title:</label>
                          <input type="text" id="department" name="department" className={`form-control ${errors.department ? "is-invalid" : ""}`} {...register("department")} />
                          {errors.department && <div className="invalid-feedback">{errors.department.message}</div>}
                        </div>
                      </div>
                    </div>
                    {/* Personal Info Section */}
                    <h5 className="section-title mt-4">Personal Info</h5>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="birthdate">Birth Date:</label>
                          <Controller
                            name="birthdate"
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                selected={field.value ? new Date(`${field.value}T00:00:00Z`) : null}
                                onChange={(date) => {
                                  if (date) {
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(2, "0");
                                    const formatted = `${year}-${month}-${day}`;
                                    field.onChange(formatted);
                                  } else {
                                    field.onChange("");
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
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Contact Info Section */}
                    <h5 className="section-title mt-4">Contact Info</h5>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="email">Primary Email:*</label>
                          <input type="email" id="email" name="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} {...register("email")} />
                          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="phone">Primary Phone:*</label>
                          <div className="input-group">
                            <span className="input-group-text">+1</span>
                            <input type="tel" id="phone" name="phone" className={`form-control ${errors.phone ? "is-invalid" : ""}`} {...register("phone")} />
                            {errors.phone && <div className="invalid-feedback d-block">{errors.phone.message}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="ph_extension">Ext.</label>
                          <input
                            type="text"
                            id="ph_extension"
                            name="ph_extension"
                            className={`form-control ${errors.ph_extension ? "is-invalid" : ""}`}
                            {...register("ph_extension")}
                            onChange={(e) => {
                              const sanitized = e.target.value.replace(/\D/g, "").slice(0, 5);
                              setValue("ph_extension", sanitized, { shouldValidate: true });
                            }}
                          />
                          {errors.ph_extension && <div className="invalid-feedback">{errors.ph_extension.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="phone_type">Primary Phone Type:</label>
                          <select id="phone_type" name="phone_type" className={`form-select ${errors.phone_type ? "is-invalid" : ""}`} {...register("phone_type")}> <option value="Office">Office</option> <option value="Mobile">Mobile</option> <option value="Home">Home</option> <option value="Other">Other</option> </select>
                          {errors.phone_type && <div className="invalid-feedback">{errors.phone_type.message}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="secondary_email">Secondary Email:</label>
                          <input type="email" id="secondary_email" name="secondary_email" className={`form-control ${errors.secondary_email ? "is-invalid" : ""}`} {...register("secondary_email")} />
                          {errors.secondary_email && <div className="invalid-feedback">{errors.secondary_email.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="secondary_phone">Secondary Phone:</label>
                          <div className="input-group">
                            <span className="input-group-text">+1</span>
                            <input type="tel" id="secondary_phone" name="secondary_phone" className={`form-control ${errors.secondary_phone ? "is-invalid" : ""}`} {...register("secondary_phone")} />
                            {errors.secondary_phone && <div className="invalid-feedback d-block">{errors.secondary_phone.message}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="secondary_phone_type">Secondary Phone Type:</label>
                          <select id="secondary_phone_type" name="secondary_phone_type" className={`form-select ${errors.secondary_phone_type ? "is-invalid" : ""}`} {...register("secondary_phone_type")}> <option value="Mobile">Mobile</option> <option value="Office">Office</option> <option value="Home">Home</option> <option value="Other">Other</option> </select>
                          {errors.secondary_phone_type && <div className="invalid-feedback">{errors.secondary_phone_type.message}</div>}
                        </div>
                      </div>
                    </div>
                    {/* Mailing Info Section */}
                    <h5 className="section-title mt-4">Mailing Info</h5>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_postalcode">Zip Code:</label>
                          <input type="text" id="primary_address_postalcode" className={`form-control ${errors.primary_address_postalcode ? "is-invalid" : ""}`} {...register("primary_address_postalcode")} name="primary_address_postalcode" />
                          {errors.primary_address_postalcode && <div className="invalid-feedback">{errors.primary_address_postalcode.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_city">City:</label>
                          <input type="text" id="primary_address_city" className={`form-control ${errors.primary_address_city ? "is-invalid" : ""}`} {...register("primary_address_city")} name="primary_address_city" />
                          {errors.primary_address_city && <div className="invalid-feedback">{errors.primary_address_city.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_state">State:</label>
                          <input type="text" id="primary_address_state" className={`form-control ${errors.primary_address_state ? "is-invalid" : ""}`} {...register("primary_address_state")} name="primary_address_state" />
                          {errors.primary_address_state && <div className="invalid-feedback">{errors.primary_address_state.message}</div>}
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_country">Country:</label>
                          <input type="text" id="primary_address_country" className={`form-control ${errors.primary_address_country ? "is-invalid" : ""}`} {...register("primary_address_country")} name="primary_address_country" />
                          {errors.primary_address_country && <div className="invalid-feedback">{errors.primary_address_country.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_street">Street Address:</label>
                          <input type="text" id="primary_address_street" className={`form-control ${errors.primary_address_street ? "is-invalid" : ""}`} {...register("primary_address_street")} name="primary_address_street" />
                          {errors.primary_address_street && <div className="invalid-feedback">{errors.primary_address_street.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="house_no">House/Apt Number:</label>
                          <input type="text" id="house_no" className={`form-control ${errors.house_no ? "is-invalid" : ""}`} {...register("house_no")} name="house_no" />
                          {errors.house_no && <div className="invalid-feedback">{errors.house_no.message}</div>}
                        </div>
                      </div>
                    </div>
                    {/* Contact Preferences Section */}
                    <h5 className="section-title mt-4">Contact Preferences</h5>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="dnd">DND:*</label>
                          <select id="dnd" name="dnd" className={`form-select ${errors.dnd ? "is-invalid" : ""}`} {...register("dnd")}> <option value="No">No</option> <option value="Yes">Yes</option> </select>
                          {errors.dnd && <div className="invalid-feedback">{errors.dnd.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="contact_type">Contact Type - Business:*</label>
                          <Controller
                            name="contact_type"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={sortedContactTypeOptions}
                                value={sortedContactTypeOptions.find(opt => opt.value === field.value) || null}
                                onChange={opt => {
                                  field.onChange(opt.value);
                                }}
                                placeholder="Select Contact Type"
                                isClearable={false}
                              />
                            )}
                          />
                          {errors.contact_type && <div className="invalid-feedback">{errors.contact_type.message}</div>}
                        </div>
                      </div>
                    </div>
                    {/* Referral Info Section */}
                    <h5 className="section-title mt-4">Referral Info</h5>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="referral_type">Referral Type:*</label>
                          <select
                            id="referral_type"
                            name="referral_type"
                            className={`form-select ${errors.referral_type ? "is-invalid" : ""}`}
                            {...register("referral_type")}
                            onChange={e => {
                              setIsUserReferralTypeChange(true);
                              register("referral_type").onChange(e);
                            }}
                          >
                            <option value="">Select Referral Type</option>
                            <option value="1">Internal Users</option>
                            <option value="2">Affiliate Referral</option>
                          </select>
                          {errors.referral_type && <div className="invalid-feedback">{errors.referral_type.message}</div>}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="contact_referral">Contact Referral:*</label>
                          <Controller
                            name="contact_referral"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={contactReferralOptions}
                                value={contactReferralOptions.find(opt => String(opt.value) === String(field.value)) || null}
                                onChange={selected => field.onChange(selected ? String(selected.value) : "")}
                                isClearable={false}
                                isSearchable
                                placeholder="Select Contact Referral"
                                isDisabled={contactReferralOptions.length === 0}
                              />
                            )}
                          />
                          {errors.contact_referral && <div className="invalid-feedback d-block">{errors.contact_referral.message}</div>}
                        </div>
                      </div>
                    </div>
                    {/* Update Button */}
                    <div className="d-flex justify-content-center gap-3 mt-4">
                      {updateError && <div className="alert alert-danger">{updateError}</div>}
                      {updateSuccess && <div className="alert alert-success">Contact updated successfully!</div>}
                      <button type="submit" className="btn save-btn" disabled={loading}>{loading ? "Updating..." : "Update"}</button>
                      <button type="button" className="btn cancel-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUpdateError(null); setUpdateSuccess(false); onClose(); }}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditContactModal;