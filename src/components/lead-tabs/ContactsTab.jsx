import React from 'react';

const ContactsTab = ({
  leadId,
  handleOpenLinkContactModal,
  contacts,
  handleEditContact,
  handleDisableContact,
  contactsLoading,
  newContactId
}) => {
  return (
    <div className="mb-4 left-section-container">
      <div className="row custom_opp_create_btn">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open(`/reporting/create-contact?lead_id=${leadId}`, '_blank');
          }}
        >
            <i className="fa-solid fa-plus"></i> New Contact
        </a>
        <a
          className="link_contact"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleOpenLinkContactModal();
          }}
          title="Link a contact"
        >
          <i className="fa-solid fa-plus"></i> Link a Contact
        </a>
      </div>

      <div className="row contact_tab_data mt-4">
        {contactsLoading ? (
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="col-12 text-center">
            <p>No contacts found for this lead.</p>
          </div>
        ) : (
          contacts.map((contact, index) => (
            <div
              key={`contact-${contact.id}-${index}`}
              className={`col-md-6 col-sm-12 mb-4 contact-card ${contact.contact_id === newContactId ? 'new-contact' : ''}`}
              ref={el => {
                // Auto-scroll to the newly added contact
                if (contact.id === newContactId && el) {
                  setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Clear the newContactId after scrolling to prevent highlighting on future renders
                    setTimeout(() => setNewContactId(null), 2000);
                  }, 500);
                }
              }}
            >
              <div className={`card-exam shadow ${contact.trash == 0 ?'':'card_trashed'}`}>
                <div className="custom_opp_tab_header">
                  <h5>
                    <i className="fas fa-star"></i> {contact.contact_type === 'primary' ? 'Primary' : 'Secondary'}
                  </h5>
                  <div className="opp_edit_dlt_btn">
                    <a
                      className="edit_contact"
                      href="javascript:void(0)"
                      title="Edit"
                      onClick={() => handleEditContact(contact.contact_id)}
                    >
                      <i className="fas fa-pen"></i>
                    </a>

                    {contact.trash == 0 && (
                      <a
                        className="delete_contact"
                        href="javascript:void(0)"
                        title="Disable"
                        onClick={() => handleDisableContact(contact.contact_id, contact.name)}
                      >
                        <i className="fas fa-ban"></i>
                      </a>
                    )}
                  </div>
                </div>
                <div className="d-flex w-100 mt-3 align-items-center">
                  <div className="circle">
                    {contact.name ? contact.name.split(' ').map(n => n[0]).join('') : ''}
                  </div>
                  <div className="card-exam-title">
                    <p><a href="javascript:void(0)" target="_blank">{contact.name || ''}</a></p>
                    <p>{contact.title ? `${contact.title}` : ''} {contact.middle_name ? `${contact.middle_name}` : ''}</p>
                    <p>{contact.email || ''}</p>
                    <p>{contact.phone || ''} {contact.ph_extension ? `Ext: ${contact.ph_extension}` : ''}</p>
                    <p>{contact.phone_type ? `Phone Type: ${contact.phone_type}` : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactsTab; 