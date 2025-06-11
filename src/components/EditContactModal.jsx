import { useState, useEffect } from "react";
import axios from "axios";
import "./EditContactModal.css";
import LoadingOverlay from "./common/LoadingOverlay";
import Swal from 'sweetalert2';


import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactSchema } from "./validationSchemas/leadSchema.jsx";

import { forwardRef } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ReadOnlyDateInput = forwardRef(({ value, onClick, onBlur }, ref) => (
  <input
    className="form-control"
    onClick={onClick}         // Calendar opens
    value={value}             // Show selected date
    onBlur={onBlur}
    readOnly                 // Prevent typing
    ref={ref}
    placeholder="MM/DD/YYYY"
    // style={{ cursor: "pointer", backgroundColor: "#fff" }}
  />
));

const EditContactModal = ({
  isOpen,
  onClose,
  contactId,
  leadId: propLeadId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [contactReferrals, setContactReferrals] = useState([]);
  const [leadId, setLeadId] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    name_alias: "",
    title: "",
    birthdate: "",
    department: "",
    report_to_id: "",
    dnd: "No",
    contact_type: "primary",
    contact_referral: "",
    referral_type: "",
    phone: "",
    phone_type: "Office",
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
    selected_businesses: [], // Array to store selected businesses
  });

  // State to store business options from the API
  const [businessOptions, setBusinessOptions] = useState([]);
const parseToDateString = (rawDate) => {
  if (rawDate.includes('T')) {
    try {
      const date = new Date(rawDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error("Error parsing ISO date:", e);
    }
  } 

  const dateParts = rawDate.split(/[-/]/).map((part) => part.trim());

  // Identify based on value structure
  let year, month, day;

  // Format: YYYY-MM-DD or YYYY/DD/MM
  if (dateParts[0].length === 4) {
    if (parseInt(dateParts[1]) > 12) {
      // Treat as YYYY-DD-MM
      year = dateParts[0];
      day = dateParts[1];
      month = dateParts[2];
    } else {
      // Treat as YYYY-MM-DD
      year = dateParts[0];
      month = dateParts[1];
      day = dateParts[2];
    }
  }
  // Format: DD-MM-YYYY or MM-DD-YYYY
  else if (dateParts[2] && dateParts[2].length === 4) {
    if (parseInt(dateParts[0]) > 12) {
      // Treat as DD-MM-YYYY
      day = dateParts[0];
      month = dateParts[1];
      year = dateParts[2];
    } else {
      // Treat as MM-DD-YYYY
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

    // Return UTC-formatted YYYY-MM-DD
    return dateObj.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

  
  // Initialize form validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: "onTouched",
  });


      // Modify your useEffect to set form values based on the currently opened contact edit form
      useEffect(() => {
        if (contactId) {
          Object.keys(formData).forEach((key) => {
            setValue(key, formData[key]);
          });
        }
      }, [contactId, formData, setValue]);
      


    // Watch form values for conditional validation
    const watchReferralType = watch("referral_type");


  // Extract lead ID from URL or use the prop (for future reference)
  useEffect(() => {
    if (propLeadId) {
      setLeadId(propLeadId);
    } else {
      const pathParts = window.location.pathname.split("/");
      const id = pathParts[pathParts.length - 1];
      if (id && !isNaN(id)) {
        setLeadId(id);
      }
    }
  }, [propLeadId]);

  // Fetch contact data when the modal opens
  useEffect(() => {
    if (isOpen && contactId) {
      fetchContactData();
    }
  }, [isOpen, contactId]);

  // Fetch default contact referrals when the component mounts
  useEffect(() => {
    if (isOpen) {
      // Set loading to true immediately when modal opens
      setLoading(true);

      // Default to affiliate_referral on initial load
      fetchContactReferrals("affiliate_referral");
    }
  }, [isOpen]);

  // Fetch contact data from API
  const fetchContactData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the specified API endpoint for contact data
      console.log(
        "Fetching contact data with leadId:",
        leadId,
        "and contactId:",
        contactId
      );

      // Make a POST request to fetch contact details
      const response = await axios.post(
        `https://portal.occamsadvisory.com/portal/wp-json/v1/lead-contacts`,
        {
          lead_id: leadId,
          contact_id: contactId,
        }
      );

      console.log("Contact API response:", response.data);

      if (response.data) {
        // Log the entire response structure to understand its format
        console.log(
          "Full API response structure:",
          JSON.stringify(response.data, null, 2)
        );

        // Extract contact data from the response
        // The structure might be different from what we expect, so we need to handle it properly
        let contactData = null;

        // Check if the response matches the expected format:
        // {
        //   "status": 200,
        //   "message": "Contact detail fetch successfully.",
        //   "data": { ... contact details ... }
        // }
        if (response.data.status === 200 && response.data.data) {
          contactData = response.data.data;
        }
        // Check if the response is an array
        else if (Array.isArray(response.data)) {
          // If the response is an array of contacts, find the one with matching contact_id
          contactData = response.data.find(
            (contact) =>
              contact.contact_id === contactId ||
              contact.contact_id === parseInt(contactId)
          );
        }
        // Check if the response has a contacts array
        else if (
          response.data.contacts &&
          Array.isArray(response.data.contacts)
        ) {
          // If the response contains an array of contacts, find the one with matching contact_id
          contactData = response.data.contacts.find(
            (contact) =>
              contact.contact_id === contactId ||
              contact.contact_id === parseInt(contactId)
          );
        }
        // If the response is a single contact object
        else if (response.data.contact_id) {
          contactData = response.data;
        }

        // If no contact data was found
        if (!contactData) {
          setError(`Contact with ID ${contactId} not found in the response.`);
          return;
        }

        console.log("Extracted contact data:", contactData);

        // Extract business information from the response
        let businessInfo = [];
        let selectedBusinesses = [];

        if (
          contactData.business_info &&
          Array.isArray(contactData.business_info)
        ) {
          businessInfo = contactData.business_info;

          // Set the business options for the dropdown
          setBusinessOptions(
            businessInfo.map((business) => ({
              value: business.lead_id,
              label: business.business_legal_name,
            }))
          );

          // Set the selected businesses based on report_to_id
          if (contactData.report_to_id) {
            // Find the business with matching lead_id
            const selectedBusiness = businessInfo.find(
              (business) => business.lead_id === contactData.report_to_id
            );

            if (selectedBusiness) {
              selectedBusinesses = [selectedBusiness.lead_id];
            }
          }
        }

        console.log("Business info:", businessInfo);
        console.log("Selected businesses:", selectedBusinesses);

        selectedBusinesses = [leadId];
        // Set form data with values from API response
        setFormData({
          first_name: contactData.first_name || "",
          middle_name: contactData.middle_name || "",
          last_name: contactData.last_name || "",
          name_alias: contactData.name_alias || "",
          title: contactData.title || "",
          birthdate: parseToDateString(contactData.birthdate),
          job_title: contactData.department || "",
          report_to_id: contactData.report_to_id || "", // Keep report_to_id for reference
          dnd: contactData.dnd === "1" ? "Yes" : "No",
          contact_type: contactData.contact_type || "primary",
          contact_referral: contactData.contact_referral || "",
          referral_type: contactData.referral_type || "",
          phone: contactData.phone || "",
          phone_type: contactData.phone_type || "Office",
          ph_extension: contactData.ph_extension || "", // Map ph_extension to ph_extension
          secondary_phone: contactData.secondary_phone || "",
          secondary_phone_type: contactData.secondary_phone_type || "Mobile",
          email: contactData.email || "",
          secondary_email: contactData.secondary_email || "",
          primary_address_street: contactData.primary_address_street || "",
          house_no: contactData.house_no || "",
          primary_address_city: contactData.primary_address_city || "",
          primary_address_state: contactData.primary_address_state || "",
          primary_address_postalcode:
          contactData.primary_address_postalcode || "",
          primary_address_country: contactData.primary_address_country || "",
          department: contactData.department || "", // Job title field
          selected_businesses: selectedBusinesses, // Store selected businesses
        });

        // Fetch contact referrals based on referral type
        if (contactData.referral_type) {
          console.log("Referral type from API:", contactData.referral_type);

          // Map referral type value to the correct type parameter
          let referralTypeParam = "";

          if (contactData.referral_type === "1") {
            referralTypeParam = "internal_user";
          } else if (contactData.referral_type === "2") {
            referralTypeParam = "affiliate_referral";
          }

          if (referralTypeParam) {
            console.log(
              "Fetching contact referrals for type:",
              referralTypeParam
            );
            fetchContactReferrals(referralTypeParam);
          }
        } else {
          // Default to affiliate_referral if no referral type is specified
          console.log(
            "No referral type specified, using default: affiliate_referral"
          );
          fetchContactReferrals("affiliate_referral");
        }
      } else {
        setError("Failed to load contact data. Invalid response format.");
      }
    } catch (err) {
      console.error("Error fetching contact data:", err);
      setError("Failed to load contact data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Referral types are now hardcoded in the dropdown

  // Fetch contact referrals based on referral type
  const fetchContactReferrals = async (type) => {
    try {
      console.log(`Fetching contact referrals for type: ${type}`);

      // Use the API endpoint with type parameter
      const response = await axios.get(
        `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/contact-referrals?type=${type}`
      );

      console.log("Contact referrals API response:", response.data);

      if (response.data) {
        // Process the response data
        let referrals = [];

        // Handle different response formats
        if (Array.isArray(response.data)) {
          referrals = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          referrals = response.data.data;
        } else if (typeof response.data === "object") {
          // If it's an object with key-value pairs, convert to array
          referrals = Object.keys(response.data).map((key) => ({
            id: key,
            name: response.data[key],
          }));
        }

        console.log("Processed contact referrals:", referrals);

        // Set the contact referrals
        setContactReferrals(referrals);

        // Auto-select the first value if available
        if (referrals.length > 0) {
          const firstReferral = referrals[0];
          // Prioritize user_id for the value
          const firstReferralUserId =
            firstReferral.user_id || firstReferral.id || "";

          // Only set if we have a valid user ID
          if (firstReferralUserId) {
            setFormData((prevData) => ({
              ...prevData,
              contact_referral: firstReferralUserId,
            }));

            console.log(
              "Auto-selected first referral with userId:",
              firstReferralUserId
            );
          } else {
            console.warn("First referral has no valid user ID:", firstReferral);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching contact referrals:", err);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Add debug logging for contact referral changes
    if (name === "contact_referral") {
      console.log("Contact referral changed to:", value);

      // Force update for contact_referral
      const newFormData = {
        ...formData,
        contact_referral: value,
      };

      console.log("Updated form data:", newFormData);
      setFormData(newFormData);
    } else {
      // Handle other fields normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle referral type change
  const handleReferralTypeChange = (e) => {
    const value = e.target.value;
    console.log("Selected referral type:", value);

    setFormData({
      ...formData,
      referral_type: value,
      contact_referral: "", // Reset contact referral when type changes
    });

    // Map dropdown values to API parameters
    let referralTypeParam = "";

    if (value === "1") {
      referralTypeParam = "internal_user";
    } else if (value === "2") {
      referralTypeParam = "affiliate_referral";
    }

    if (referralTypeParam) {
      console.log("Fetching contact referrals for type:", referralTypeParam);
      fetchContactReferrals(referralTypeParam);
    } else {
      setContactReferrals([]);
    }
  };

  // Handle business selection change
  const handleBusinessChange = (e) => {
    const selectedValues = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    console.log("Selected business values:", selectedValues);

    setFormData({
      ...formData,
      selected_businesses: selectedValues,
    });
  };

  // Handle contact referral change specifically
  const handleContactReferralChange = (e) => {
    const value = e.target.value;
    console.log("Contact referral changed to (specific handler):", value);

    // Update the form data with the new contact referral value
    setFormData((prevData) => ({
      ...prevData,
      contact_referral: value,
    }));
  };

  // Handle form submission
  const onSubmit = async (data) => {
    Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to update this contact information.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, update it!'
  }).then((result) => {
    if (result.isConfirmed) {
        updateContact(data);
    }
  });
      
  };

  const updateContact = async (data) => {
    try {
          setUpdateSuccess(false);
          setUpdateError(null);
          setLoading(true);

          console.log("Form data before submission:", data);

          // Ensure birthdate is in YYYY-MM-DD string format for submission
          let formattedBirthdate = '';
          if (data.birthdate) {
            // data.birthdate should already be YYYY-MM-DD from DatePicker's setValue
            // If it's somehow an ISO string (e.g., from initial load before edit), split it
            // Otherwise, use it directly.
            if (typeof data.birthdate === 'string' && data.birthdate.includes('T')) {
              formattedBirthdate = data.birthdate.split('T')[0];
            } else if (typeof data.birthdate === 'string') {
              formattedBirthdate = data.birthdate; // Already YYYY-MM-DD
            } 
            // If it's a Date object (less likely with setValue, but for robustness)
            else if (data.birthdate instanceof Date && !isNaN(data.birthdate.getTime())) {
              const year = data.birthdate.getFullYear();
              const month = String(data.birthdate.getMonth() + 1).padStart(2, '0');
              const day = String(data.birthdate.getDate()).padStart(2, '0');
              formattedBirthdate = `${year}-${month}-${day}`;
            }
          }

          const submitData = {
            ...data,
            birthdate: formattedBirthdate, // Use the explicitly formatted string
            dnd: data.dnd === "Yes" ? "1" : "0",
            contact_id: contactId,
            report_to_id:
              data.report_to_id || 
              (data.selected_businesses && data.selected_businesses.length > 0
                ? data.selected_businesses[0]
                : ""),
          };

          console.log("Submitting contact data:", submitData);

          const response = await axios.put(
            `https://portal.occamsadvisory.com/portal/wp-json/eccom-op-contact/v1/contactinone/${contactId}`,
            submitData
          );

          console.log("Update response:", JSON.parse(response.data));

          if (response.data && JSON.parse(response.data).code == "success") {
            Swal.fire({
              title: 'Success!',
              text: 'Contact updated successfully!',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              setUpdateSuccess(false);
              setUpdateError(null);
              onClose();
            });
            // setUpdateSuccess(true);
            // setTimeout(() => {
            //   setUpdateSuccess(false);
            //   setUpdateError(null);
            //   onClose();
            // }, 2000);
          } else {
              Swal.fire({
              title: 'Error!',
              text: 'Failed to update contact. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            // setUpdateError("Failed to update contact. Please try again.");
          }
        } catch (err) {
          console.error("Error updating contact:", err);
          // setUpdateError(
          //   "An error occurred while updating the contact. Please try again."
          // );
          Swal.fire({
            title: 'Error!',
            text: 'An error occurred while updating the contact. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setLoading(false);
        }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Loading overlay */}
      <LoadingOverlay
        isVisible={loading}
        message={
          updateSuccess ? "Saving contact..." : "Loading contact data..."
        }
      />

<style>{`
 .react-datepicker__month-dropdown,
 .react-datepicker__year-dropdown {
  max-height: 200px;
  overflow-y: auto;
  font-size: 14px;
  scrollbar-width: thin;
}
.react-datepicker__year-dropdown::-webkit-scrollbar,
.react-datepicker__month-dropdown::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.react-datepicker__year-dropdown::-webkit-scrollbar-thumb,
.react-datepicker__month-dropdown::-webkit-scrollbar-thumb {
  background-color: #aaa;
  border-radius: 6px;
`}
</style>
 
      <div className="modal-backdrop show" onClick={onClose}>
        <div className="modal show" style={{ display: "block" }}>
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {contactId
                    ? `${formData.first_name} ${formData.last_name}`
                    : "Contact"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                ></button>
              </div>

              <div className="modal-body">
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading contact data...</p>
                  </div>
                ) : error ? (
                  <div className="error-message">
                    <p>{error}</p>
                    <button
                      className="btn btn-primary"
                      onClick={fetchContactData}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Professional Info Section */}
                    <h5 class="section-title">Professional Info</h5>
                    <div className="row mb-3">
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="first_name">First Name:*</label>
                          <div className="input-group">
                            <select
                               className={`form-select title-select ${errors.title ? 'is-invalid' : ''}`}
                               {...register("title")}
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                            >
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Ms">Ms</option>
                              <option value="Dr">Dr</option>
                            </select>
                            <input
                              type="text"
                              id="first_name"
                              name="first_name"
                              className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                              {...register("first_name")}
                              value={formData.first_name}
                              onChange={handleInputChange}
                              
                            />
                            {errors.first_name && (
                              <div className="invalid-feedback d-block">
                                {errors.first_name.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="middle_name">Middle Name:</label>
                          <input
                            type="text"
                            id="middle_name"
                            name="middle_name"
                            className={`form-control ${errors.middle_name ? 'is-invalid' : ''}`}
                            {...register("middle_name")}
                            value={formData.middle_name}
                            onChange={handleInputChange}
                          />
                          {errors.middle_name && (
                            <div className="invalid-feedback">
                              {errors.middle_name.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="last_name">Last Name:*</label>
                          <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                            {...register("last_name")}
                            value={formData.last_name}
                            onChange={handleInputChange}
                            
                          />
                          {errors.last_name && (
                            <div className="invalid-feedback">
                              {errors.last_name.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="name_alias">Alias:</label>
                          <input
                            type="text"
                            id="name_alias"
                            name="name_alias"
                            className={`form-control ${errors.name_alias ? 'is-invalid' : ''}`}
                            {...register("name_alias")}
                            value={formData.name_alias}
                            onChange={handleInputChange}
                          />
                          {errors.name_alias && (
                            <div className="invalid-feedback">
                              {errors.name_alias.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="business_name">Business Name:*</label>
                          <select
                            id="selected_businesses"
                            name="selected_businesses"
                            className={`form-select ${errors.selected_businesses ? 'is-invalid' : ''}`}
                            {...register("selected_businesses")}
                            value={formData.selected_businesses}
                            onChange={handleBusinessChange}
                            multiple
                            
                            // disabled={true} // Disable the field
                            style={{
                              backgroundColor: '#e9ecef',
                              pointerEvents: 'none',   // make it readonly-like
                              color: '#6c757d',         // match disabled look
                            }}// Make the dropdown taller for multiple selections
                          >
                            {businessOptions.map((business) => (
                              <option
                                key={business.value}
                                value={business.value}
                              >
                                {business.label}
                              </option>
                            ))}
                          </select>
                          {errors.selected_businesses && (
                            <div className="invalid-feedback">
                              {errors.selected_businesses.message}
                            </div>
                          )}
                      </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="department">Job Title:</label>
                          <input
                            type="text"
                            id="department"
                            name="department"
                            className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                            {...register("department")}
                            value={formData.department}
                            onChange={handleInputChange}
                          />
                          {errors.department && (
                            <div className="invalid-feedback">
                              {errors.department.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal Info Section */}
                    <h5 class="section-title mt-4">Personal Info</h5>
                    <div className="row mb-3">
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="birthdate">Birth Date:</label>
                          {/* <input
                            type="date"
                            id="birthdate"
                            name="birthdate"
                            className={`form-control ${errors.birthdate ? 'is-invalid' : ''}`}
                            {...register("birthdate")}
                            value={formData.birthdate}
                            onChange={handleInputChange}
                          /> */}
                          <DatePicker

selected={
  formData.birthdate
    ? new Date(`${formData.birthdate}T00:00:00Z`) // Ensures it's parsed in UTC
    : null
}
                            name="birthdate"
                            id="birthdate"
                            onChange={(date) => {
                              if (date) {
                                // Get the date components in local time
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const formatted = `${year}-${month}-${day}`;
                                
                                setFormData((prev) => ({
                                  ...prev,
                                  birthdate: formatted,
                                }));
                                // Explicitly set the value in react-hook-form
                                setValue("birthdate", formatted);
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  birthdate: '',
                                }));
                                setValue("birthdate", ''); // Also update react-hook-form when cleared
                              }
                            }}
                            dateFormat="MM/dd/yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="scroll"
                            scrollableYearDropdown    
                            yearDropdownItemNumber={120}  
                            minDate={new Date('1900-01-01')}
                            maxDate={new Date()}
                            customInput={<ReadOnlyDateInput />}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Info Section */}
                    <h5 class="section-title mt-4">Contact Info</h5>
                    <div className="row mb-3">
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="email">Primary Email:*</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            {...register("email")}
                            value={formData.email}
                            onChange={handleInputChange}
                            
                          />
                          {errors.email && (
                            <div className="invalid-feedback">
                              {errors.email.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="phone">Primary Phone:*</label>
                          <div className="input-group">
                            <span className="input-group-text">+1</span>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                              {...register("phone")}
                              value={formData.phone}
                              onChange={handleInputChange}
                              
                            />
                            {errors.phone && (
                            <div className="invalid-feedback d-block">
                              {errors.phone.message}
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="ph_extension">Ext.</label>
                          <input
                            type="text"
                            id="ph_extension"
                            name="ph_extension"
                            className={`form-control ${errors.ph_extension ? 'is-invalid' : ''}`}
                            {...register("ph_extension")}
                            value={formData.ph_extension}
                            onChange={handleInputChange}
                          />
                          {errors.ph_extension && (
                            <div className="invalid-feedback">
                              {errors.ph_extension.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="phone_type">Primary Phone Type:</label>
                          <select
                            id="phone_type"
                            name="phone_type"
                            className={`form-select ${errors.phone_type ? 'is-invalid' : ''}`}
                            {...register("phone_type")}
                            value={formData.phone_type}
                            onChange={handleInputChange}
                          >
                            <option value="Office">Office</option>
                            <option value="Mobile">Mobile</option>
                            <option value="Home">Home</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.phone_type && (
                            <div className="invalid-feedback">
                              {errors.phone_type.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="secondary_email">
                            Secondary Email:
                          </label>
                          <input
                            type="email"
                            id="secondary_email"
                            name="secondary_email"
                            className={`form-control ${errors.secondary_email ? 'is-invalid' : ''}`}
                            {...register("secondary_email")}
                            value={formData.secondary_email}
                            onChange={handleInputChange}
                          />
                          {errors.secondary_email && (
                            <div className="invalid-feedback">
                              {errors.secondary_email.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="secondary_phone">
                            Secondary Phone:
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">+1</span>
                            <input
                              type="tel"
                              id="secondary_phone"
                              name="secondary_phone"
                              className={`form-control ${errors.secondary_phone ? 'is-invalid' : ''}`}
                              {...register("secondary_phone")}
                              value={formData.secondary_phone}
                              onChange={handleInputChange}
                            />
                            {errors.secondary_phone && (
                              <div className="invalid-feedback d-block">
                                {errors.secondary_phone.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="secondary_phone_type">
                            Secondary Phone Type:
                          </label>
                          <select
                            id="secondary_phone_type"
                            name="secondary_phone_type"
                            className={`form-select ${errors.secondary_phone_type ? 'is-invalid' : ''}`}
                            {...register("secondary_phone_type")}
                            value={formData.secondary_phone_type}
                            onChange={handleInputChange}
                          >
                            <option value="Mobile">Mobile</option>
                            <option value="Office">Office</option>
                            <option value="Home">Home</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.secondary_phone_type && (
                            <div className="invalid-feedback">
                              {errors.secondary_phone_type.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mailing Info Section */}
                    <h5 className="section-title mt-4">Mailing Info</h5>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_postalcode">
                            Zip Code:
                          </label>
                          <input
                            type="text"
                            id="primary_address_postalcode"
                            className={`form-control ${errors.primary_address_postalcode ? 'is-invalid' : ''}`}
                            {...register("primary_address_postalcode")} name="primary_address_postalcode"
                            onChange={handleInputChange}
                          />
                          {errors.primary_address_postalcode && (
                            <div className="invalid-feedback">
                              {errors.primary_address_postalcode.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_city">City:</label>
                          <input
                            type="text"
                            id="primary_address_city"
                            className={`form-control ${errors.primary_address_city ? 'is-invalid' : ''}`}
                            {...register("primary_address_city")} name="primary_address_city"
                            onChange={handleInputChange}
                          />
                          {errors.primary_address_city && (
                            <div className="invalid-feedback">
                              {errors.primary_address_city.message} 
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_state">State:</label>
                          <input
                            type="text"
                            id="primary_address_state"
                            className={`form-control ${errors.primary_address_state ? 'is-invalid' : ''}`}
                            {...register("primary_address_state")} name="primary_address_state"
                            onChange={handleInputChange}
                          />
                          {errors.primary_address_state && (
                            <div className="invalid-feedback">
                              {errors.primary_address_state.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_country">
                            Country:
                          </label>
                          <input
                            type="text"
                            id="primary_address_country"
                            className={`form-control ${errors.primary_address_country ? 'is-invalid' : ''}`}
                            {...register("primary_address_country")} name="primary_address_country"
                            onChange={handleInputChange}
                          />
                          {errors.primary_address_country && (
                            <div className="invalid-feedback">
                              {errors.primary_address_country.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="primary_address_street">
                            Street Address:
                          </label>
                          <input
                            type="text"
                            id="primary_address_street"
                            className={`form-control ${errors.primary_address_street ? 'is-invalid' : ''}`}
                            {...register("primary_address_street")} name="primary_address_street"
                            onChange={handleInputChange}
                          />
                          {errors.primary_address_street && (
                            <div className="invalid-feedback">
                              {errors.primary_address_street.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="house_no">House/Apt Number:</label>
                          <input
                            type="text"
                            id="house_no"
                            className={`form-control ${errors.house_no ? 'is-invalid' : ''}`}
                            {...register("house_no")} name="house_no"
                            onChange={handleInputChange}
                          />
                          {errors.house_no && (
                            <div className="invalid-feedback">
                              {errors.house_no.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>


                    {/* Contact Preferences Section */}
                    <h5 class="section-title mt-4">Contact Preferences</h5>
                    <div className="row mb-3">
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="dnd">DND:*</label>
                          <select
                            id="dnd"
                            name="dnd"
                            className={`form-select ${errors.dnd ? 'is-invalid' : ''}`}
                            {...register("dnd")}
                            value={formData.dnd}
                            onChange={handleInputChange}
                            
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                          {errors.dnd && (
                            <div className="invalid-feedback">
                              {errors.dnd.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="contact_type">
                            Contact Type - Business:*
                          </label>
                          <select
                            id="contact_type"
                            name="contact_type"
                            className={`form-select ${errors.contact_type ? 'is-invalid' : ''}`}
                            {...register("contact_type")}
                            value={formData.contact_type}
                            onChange={handleInputChange}
                            
                          >
                            {errors.contact_type && (
                              <div className="invalid-feedback">
                                {errors.contact_type.message}
                              </div>
                            )}
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Referral Info Section */}
                    <h5 class="section-title mt-4">Referral Info</h5>
                    <div className="row mb-3">
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="referral_type">Referral Type:*</label>
                          <select
                            id="referral_type"
                            name="referral_type"
                            className={`form-select ${errors.referral_type ? 'is-invalid' : ''}`}
                            {...register("referral_type")}
                            value={formData.referral_type}
                            onChange={handleReferralTypeChange}
                            
                          >
                            <option value="">Select Referral Type</option>
                            <option value="1">Internal Users</option>
                            <option value="2">Affiliate Referral</option>
                          </select>
                          {errors.referral_type && (
                            <div className="invalid-feedback">
                              {errors.referral_type.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div className="form-group">
                          <label htmlFor="contact_referral">
                            Contact Referral:*
                          </label>
                          {console.log(
                            "Current contact_referral value:",
                            formData.contact_referral
                          )}
                          <select
                            id="contact_referral"
                            name="contact_referral"
                            className={`form-select ${errors.contact_referral ? 'is-invalid' : ''}`}
                            {...register("contact_referral")}
                            value={formData.contact_referral || ""}
                            onChange={handleContactReferralChange}
                            
                          >
                            <option key="default" value="">
                              Select Contact Referral
                            </option>
                            {contactReferrals.length > 0 ? (
                              contactReferrals.map((referral, index) => {
                                // Extract user_id specifically for the value attribute
                                const userId =
                                  referral.user_id || referral.userid || "";

                                // Extract name for display
                                const name =
                                  referral.name ||
                                  referral.label ||
                                  referral.full_name ||
                                  "";

                                // Generate a unique key using index as fallback if userId is empty
                                const uniqueKey = userId
                                  ? `referral-${userId}`
                                  : `referral-index-${index}`;

                                //console.log(`Rendering option: key=${uniqueKey}, userId=${userId}, name=${name}`);

                                return (
                                  <option key={uniqueKey} value={userId}>
                                    {name}
                                  </option>
                                );
                              })
                            ) : (
                              <option key="no-referrals" value="" disabled>
                                No referrals available
                              </option>
                            )}
                          </select>
                          {errors.contact_referral && (
                            <div className="invalid-feedback">
                              {errors.contact_referral.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Update Button */}
                    <div className="d-flex justify-content-center gap-3 mt-4">
                      {updateError && (
                        <div className="alert alert-danger">{updateError}</div>
                      )}
                      {updateSuccess && (
                        <div className="alert alert-success">
                          Contact updated successfully!
                        </div>
                      )}
                      <button
                        type="submit"
                        className="btn save-btn"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update"}
                      </button>
                      <button
                        type="button"
                        className="btn cancel-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUpdateError(null);
                          setUpdateSuccess(false);
                          onClose();
                        }}>
                        Cancel

                      </button>
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
