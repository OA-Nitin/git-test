import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { getUserId } from '../../utils/assetUtils'; // Assuming getUserId is needed here

const LeadClassificationAndAssignment = ({
  leadId,
  setFormData,
  leadGroup,
  leadCampaign,
  leadSource,
  groupOptions,
  campaignOptions,
  sourceOptions,
  isLoadingOptions,
  onLeadGroupChange,
  onLeadCampaignChange,
  onLeadSourceChange,
}) => {
  // Assigned users related state
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [isAssigningUser, setIsAssigningUser] = useState(false);

  // Lead classification state (these are now props)
  // const [leadGroup, setLeadGroup] = useState(null);
  // const [leadCampaign, setLeadCampaign] = useState(null);
  // const [leadSource, setLeadSource] = useState(null);

  // Options for dropdowns (these are now props)
  // const [groupOptions, setGroupOptions] = useState([]);
  // const [campaignOptions, setCampaignOptions] = useState([]);
  // const [sourceOptions, setSourceOptions] = useState([]);
  // const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Function to fetch groups from API (removed, now handled in LeadDetail)
  // const fetchGroups = async () => { /* ... */ };

  // Function to fetch campaigns from API (removed, now handled in LeadDetail)
  // const fetchCampaigns = async () => { /* ... */ };

  // Function to fetch sources from API (removed, now handled in LeadDetail)
  // const fetchSources = async () => { /* ... */ };

  // Function to fetch assigned users
  const fetchAssignedUsers = async () => {
    try {
      setUnassignLoading(true);
      const response = await axios.get(`https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-assign-user?lead_id=${leadId}`);

      if (response.data) {
        const assignedUsersData = response.data.assign_user.map(user => ({
          id: user.user_id,
          name: user.display_name + " (" + user.user_role + ") " || '',
          role: user.role || 'User'
        }));
        setAssignedUsers(assignedUsersData);
      } else {
        console.warn('No assigned users found or invalid response format');
        setAssignedUsers([]);
      }
    } catch (err) {
      console.error('Error fetching assigned users:', err);
      setAssignedUsers([]);
    } finally {
      setUnassignLoading(false);
    }
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      // setIsLoadingOptions(true); // This should be controlled by LeadDetail now
      const response = await axios.get('https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/erc-sales-team');

      if (response.data) {
        let userData = [];
        if (response.data.success && Array.isArray(response.data.data)) {
          userData = response.data.data;
        } else if (Array.isArray(response.data)) {
          userData = response.data;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          userData = Object.values(response.data);
        }

        if (userData.length > 0) {
          const options = userData.map(user => {
            const displayName = user.full_name || user.name || user.display_name || user.user_name || '';
            const userId = user.user_id || user.id || '';
            const userObject = {
              id: userId,
              name: displayName,
              role: user.role || 'User'
            };
            return {
              value: userId,
              label: displayName,
              user: userObject
            };
          });
          setUserOptions(options);
        } else {
          console.warn('No user data found in response');
          setUserOptions([]);
        }
      } else {
        console.warn('Failed to fetch user data:', response.data);
        setUserOptions([]);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserOptions([]);
    } finally {
      // setIsLoadingOptions(false); // This should be controlled by LeadDetail now
    }
  };

  // Initial data fetch (modified to remove classification data fetches)
  useEffect(() => {
    // const fetchAllClassificationData = async () => {
    //   await fetchGroups();
    //   await fetchCampaigns();
    //   await fetchSources();
    // };
    // fetchAllClassificationData();
  }, []);

  useEffect(() => {
    if (leadId) {
      fetchUserData();
      fetchAssignedUsers();
    }
  }, [leadId]);

  // Functions to handle lead classification changes (now using props)
  // const handleLeadGroupChange = (selectedOption) => {
  //   setLeadGroup(selectedOption);
  //   setFormData(prevData => ({
  //     ...prevData,
  //     lead_group: selectedOption ? selectedOption.label : ''
  //   }));
  // };

  // const handleLeadCampaignChange = (selectedOption) => {
  //   setLeadCampaign(selectedOption);
  //   setFormData(prevData => ({
  //     ...prevData,
  //     lead_campaign: selectedOption ? selectedOption.label : ''
  //   }));
  // };

  // const handleLeadSourceChange = (selectedOption) => {
  //   setLeadSource(selectedOption);
  //   setFormData(prevData => ({
  //     ...prevData,
  //     lead_source: selectedOption ? selectedOption.label : ''
  //   }));
  // };

  // Function to handle user selection
  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
  };

  // Function to assign a user
  const handleAssignUser = async () => {
    if (!selectedUser) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a user to assign.',
        icon: 'error'
      });
      return;
    }

    try {
      setIsAssigningUser(true);
      const isAlreadyAssigned = assignedUsers.some(user => user.id === selectedUser.user.id);

      if (!isAlreadyAssigned) {
        const response = await axios.post(
          'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-assign-user',
          {
            lead_id: leadId,
            user_id: selectedUser.user.id,
            operation: 'assign_user',
            current_user_id: getUserId() 
          }
        );

        if (response.data && response.data.success) {
          const newAssignedUsers = [...assignedUsers, selectedUser.user];
          setAssignedUsers(newAssignedUsers);
          setFormData(prevData => ({
            ...prevData,
            assigned_users: newAssignedUsers.map(user => user.id)
          }));
        } else {
          console.error('Failed to assign user:', response.data?.message || 'Unknown error');
          const newAssignedUsers = [...assignedUsers, selectedUser.user];
          setAssignedUsers(newAssignedUsers);
          setFormData(prevData => ({
            ...prevData,
            assigned_users: newAssignedUsers.map(user => user.id)
          }));
        }
      } else {
        console.warn('User is already assigned to this lead');
      }
      setSelectedUser(null);
    } catch (error) {
      console.error('Error assigning user:', error.response?.data?.message || error.message);
      const newAssignedUsers = [...assignedUsers, selectedUser.user];
      setAssignedUsers(newAssignedUsers);
      setFormData(prevData => ({
        ...prevData,
        assigned_users: newAssignedUsers.map(user => user.id)
      }));
      setSelectedUser(null);
    } finally {
      setIsAssigningUser(false);
      fetchAssignedUsers();
    }
  };

  // Function to remove an assigned user
  const handleRemoveUser = async (userId) => {
    try {
      setUnassignLoading(true);
      const response = await axios.post(
        'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/lead-assign-user',
        {
          lead_id: leadId,
          user_id: userId,
          operation: 'unassign_user',
          current_user_id: getUserId()
        }
      );

      if (response.data && response.data.success) {
        const updatedUsers = assignedUsers.filter(user => user.id !== userId);
        setAssignedUsers(updatedUsers);
        setFormData(prevData => ({
          ...prevData,
          assigned_users: updatedUsers.map(user => user.id)
        }));
      } else {
        console.error('Failed to unassign user:', response.data?.message || 'Unknown error');
        const updatedUsers = assignedUsers.filter(user => user.id !== userId);
        setAssignedUsers(updatedUsers);
        setFormData(prevData => ({
          ...prevData,
          assigned_users: updatedUsers.map(user => user.id)
        }));
      }
    } catch (error) {
      console.error('Error unassigning user:', error.response?.data?.message || error.message);
      const updatedUsers = assignedUsers.filter(user => user.id !== userId);
      setAssignedUsers(updatedUsers);
      setFormData(prevData => ({
        ...prevData,
        assigned_users: updatedUsers.map(user => user.id)
      }));
    } finally {
      setUnassignLoading(false);
      fetchAssignedUsers();
    }
  };

  return (
    <>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Assigned Users:</h5>

          <div className="assigned-users-list mb-4">
            {assignedUsers.length === 0 ? (
              <p className="text-muted small">No users assigned yet.</p>
            ) : (
              <div className="assigned-users-tags">
                {assignedUsers.map(user => (
                  <div key={user.id} className="assigned-user-tag">
                    <span className="user-name">{user.name}</span>
                    <button
                      className="remove-tag-btn"
                      onClick={() => handleRemoveUser(user.id)}
                      aria-label="Remove user"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group mb-3">
            <label htmlFor="userSelect" className="form-label">Add User:</label>
            <Select
              id="userSelect"
              value={selectedUser}
              onChange={handleUserChange}
              options={userOptions.filter(option =>
                !assignedUsers.some(user => user.id === option.user.id)
              )}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select user to assign..."
              isClearable
              isSearchable
              isLoading={isLoadingOptions}
              noOptionsMessage={({ inputValue }) =>
                inputValue && inputValue.length > 0
                  ? "No matching users found"
                  : userOptions.length === assignedUsers.length
                    ? "All users have been assigned"
                    : "No users available"
              }
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '4px',
                  borderColor: '#ced4da',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#adb5bd'
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? '#6c63ff'
                    : state.isFocused
                      ? '#f0f4ff'
                      : 'white',
                  color: state.isSelected ? 'white' : '#333',
                  padding: '10px 12px'
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                })
              }}
            />
          </div>

          <button
            className="btn assign-user-btn w-100"
            onClick={handleAssignUser}
            disabled={!selectedUser || isAssigningUser}
          >
            {isAssigningUser ? 'Assigning...' : 'Assign User'}
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Lead Group:</h5>
          <div className="form-group mb-4">
            <Select
              value={leadGroup}
              onChange={onLeadGroupChange}
              options={groupOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              isSearchable
              isLoading={isLoadingOptions}
              placeholder={isLoadingOptions ? "Loading groups..." : "Search or select group..."}
              noOptionsMessage={() => "No matching groups found"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '4px',
                  borderColor: '#ced4da',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#adb5bd'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999
                })
              }}
            />
          </div>

          <h5 className="card-title">Lead Campaign:</h5>
          <div className="form-group mb-4">
            <Select
              value={leadCampaign}
              onChange={onLeadCampaignChange}
              options={campaignOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              isSearchable
              isLoading={isLoadingOptions}
              placeholder={isLoadingOptions ? "Loading campaigns..." : "Search or select campaign..."}
              noOptionsMessage={() => "No matching campaigns found"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '4px',
                  borderColor: '#ced4da',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#adb5bd'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999
                })
              }}
            />
          </div>

          <h5 className="card-title">Lead Source:</h5>
          <div className="form-group">
            <Select
              value={leadSource}
              onChange={onLeadSourceChange}
              options={sourceOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              isSearchable
              isLoading={isLoadingOptions}
              placeholder={isLoadingOptions ? "Loading sources..." : "Search or select source..."}
              noOptionsMessage={() => "No matching sources found"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '4px',
                  borderColor: '#ced4da',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#adb5bd'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999
                })
              }}
            />
          </div>
        </div>
      </div>
      {/* Add custom CSS for the assigned user tags */}
      <style>{`
        .assigned-users-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 15px;
        }
        .assigned-user-tag {
          display: inline-flex;
          align-items: center;
          background-color: #f0f4ff;
          border: 1px solid #d1d9ff;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 14px;
        }
        .user-name {
          margin-right: 6px;
        }
        .remove-tag-btn {
          background: none;
          border: none;
          color: #6c757d;
          font-size: 16px;
          line-height: 1;
          padding: 0 2px;
          cursor: pointer;
        }
        .remove-tag-btn:hover {
          color: #dc3545;
        }
      `}</style>
    </>
  );
};

export default LeadClassificationAndAssignment; 