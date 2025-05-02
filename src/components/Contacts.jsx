import React, { useState, useEffect } from 'react';

const Contacts = () => {
  useEffect(() => {
    document.title = "Contacts - Occams Portal"; // Set title for Contacts page
  }, []);
  // Sample contacts data
  const [contacts, setContacts] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '(555) 123-4567', category: 'Lead', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '(555) 987-6543', category: 'Customer', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '(555) 456-7890', category: 'Partner', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice.brown@example.com', phone: '(555) 567-8901', category: 'Lead', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie.wilson@example.com', phone: '(555) 678-9012', category: 'Customer', status: 'Active' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Filter contacts based on search term and category
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);

    const matchesCategory = filterCategory === '' || contact.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle delete contact
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(contact => contact.id !== id));
    }
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
                    <h4 className="text-white">Contacts</h4>
                  </div>
                </div>
              </div>
              <div className="white_card_body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-primary" type="button">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-control"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="Lead">Lead</option>
                      <option value="Customer">Customer</option>
                      <option value="Partner">Partner</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-success w-100">
                      <i className="fas fa-plus"></i> Add Contact
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.length > 0 ? (
                        filteredContacts.map(contact => (
                          <tr key={contact.id}>
                            <td>{contact.name}</td>
                            <td>{contact.email}</td>
                            <td>{contact.phone}</td>
                            <td>
                              <span className={`badge ${
                                contact.category === 'Lead' ? 'bg-warning' :
                                contact.category === 'Customer' ? 'bg-success' :
                                'bg-info'
                              }`}>
                                {contact.category}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${contact.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                                {contact.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-info me-2" title="Edit">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                title="Delete"
                                onClick={() => handleDelete(contact.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">No contacts found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <p>Showing {filteredContacts.length} of {contacts.length} contacts</p>
                  </div>
                  <div className="col-md-6">
                    <nav aria-label="Page navigation example">
                      <ul className="pagination justify-content-end">
                        <li className="page-item disabled">
                          <a className="page-link" href="#" tabIndex="-1">Previous</a>
                        </li>
                        <li className="page-item active"><a className="page-link" href="#">1</a></li>
                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                        <li className="page-item">
                          <a className="page-link" href="#">Next</a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
