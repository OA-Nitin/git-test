import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Swal from 'sweetalert2';
import './Notes.css';
import { SaveButton } from './ActionButtons';
import Modal from './Modal';

/**
 * Reusable Notes component that can be used throughout the application
 * @param {Object} props - Component props
 * @param {string} props.entityType - Type of entity (lead, project, etc.)
 * @param {string|number} props.entityId - ID of the entity
 * @param {string} [props.entityName] - Optional name of the entity to display
 * @param {boolean} [props.showButtons=true] - Whether to show the view/add buttons
 * @param {boolean} [props.showNotes=false] - Whether to show notes directly (without popup)
 * @param {number} [props.maxHeight=300] - Maximum height of the notes container in pixels
 * @param {Function} [props.onNotesUpdated] - Callback function when notes are updated
 */
const Notes = ({
  entityType,
  entityId,
  entityName = '',
  showButtons = true,
  showNotes = false,
  maxHeight = 300,
  onNotesUpdated = () => {}
}) => {
  // State for notes data
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreNotes, setHasMoreNotes] = useState(true);
  const [notesPage, setNotesPage] = useState(1);
  const [showViewNotesModal, setShowViewNotesModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Determine API endpoints based on entity type
  const getApiEndpoints = () => {
    // Make sure entityId is not undefined or null
    const safeEntityId = entityId || '';
    console.log('Using entityId for API endpoints:', safeEntityId);

    switch (entityType) {
      case 'lead':
        return {
          get: `https://play.occamsadvisory.com/portal/wp-json/v1/lead-notes/${safeEntityId}`,
          post: 'https://play.occamsadvisory.com/portal/wp-json/v1/lead-notes'
        };
      case 'project':
        return {
          get: `https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/project-notes/${safeEntityId}`,
          post: 'https://play.occamsadvisory.com/portal/wp-json/portalapi/v1/project-notes'
        };
      default:
        return {
          get: `https://play.occamsadvisory.com/portal/wp-json/v1/lead-notes/${safeEntityId}`,
          post: 'https://play.occamsadvisory.com/portal/wp-json/v1/lead-notes'
        };
    }
  };

  // Fetch notes when component mounts or when entityId changes
  useEffect(() => {
    if (showNotes || showViewNotesModal) {
      fetchNotes();
    }
  }, [entityId, showNotes, showViewNotesModal]);

  // Function to fetch notes from API
  const fetchNotes = (page = 1) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    const { get } = getApiEndpoints();

    // Add page parameter if API supports pagination
    const apiUrl = `${get}${page > 1 ? `?page=${page}` : ''}`;

    axios.get(apiUrl)
      .then(response => {
        console.log('Notes API response:', response);

        // Process the response data based on format
        let fetchedNotes = [];

        if (Array.isArray(response.data)) {
          fetchedNotes = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If response.data is an object with a data property that is an array
          if (Array.isArray(response.data.data)) {
            fetchedNotes = response.data.data;
          } else {
            // If it's a single note object, wrap it in an array
            fetchedNotes = [response.data];
          }
        }

        // Format the notes for display
        const formattedNotes = fetchedNotes.map(note => {
          // Parse the date from the note (handle different field names)
          const originalDate = new Date(note.created_at || note.date || note.created || new Date());

          // Format the date
          const formattedDate = originalDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          const formattedTime = originalDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          // Clean up the note text - remove any leading numbers or IDs
          let noteText = note.note || note.text || note.content || '';

          // Remove patterns like "1 :", "44140 :", etc. at the beginning of notes
          // Also handle patterns like "1 : VB added a :" or "44140 : demomater.ops added a comment:"
          noteText = noteText.replace(/^\s*\d+\s*:?\s*(.*?added\s+a\s+:?\s*)?/i, '');

          return {
            id: note.id || note.note_id || `note-${Math.random().toString(36).toString(36).slice(2)}`,
            text: noteText,
            author: note.author || note.user_name || note.created_by || 'User',
            date: originalDate,
            formattedDate,
            formattedTime
          };
        });

        // If this is the first page, replace notes
        // Otherwise append to existing notes
        if (page === 1) {
          setNotes(formattedNotes);
        } else {
          setNotes(prevNotes => [...prevNotes, ...formattedNotes]);
        }

        // Check if there are more notes to load
        setHasMoreNotes(formattedNotes.length > 0);
        setNotesPage(page);
      })
      .catch(err => {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Function to load more notes
  const loadMoreNotes = () => {
    fetchNotes(notesPage + 1);
  };

  // Function to handle viewing notes in a modal
  const handleViewNotes = () => {
    setShowViewNotesModal(true);
    if (notes.length === 0) {
      fetchNotes();
    }
  };

  // Function to close the view notes modal
  const closeViewNotesModal = () => {
    setShowViewNotesModal(false);
  };

  // Function to toggle the add note modal
  const toggleAddNoteModal = () => {
    setShowAddNoteModal(!showAddNoteModal);
    setNewNote('');
  };

  // Function to handle adding a new note
  const handleAddNote = (e) => {
    e.preventDefault();

    // Allow empty notes to be submitted, but trim it for the API call
    const trimmedNote = newNote.trim();

    // Debug information
    console.log('Adding note for:', { entityType, entityId, trimmedNote });

    setLoading(true);

    const { post } = getApiEndpoints();
    console.log('Using API endpoint:', post);

    // Make sure entityId is not undefined or null
    const safeEntityId = entityId || '';

    // Prepare the data for the API based on entity type
    const noteData = entityType === 'project'
      ? {
          project_id: safeEntityId,
          note: trimmedNote,
          user_id: 1  // This should ideally come from a user context
        }
      : {
          lead_id: safeEntityId,
          note: trimmedNote,
          status: 'active'
        };

    // Log the data being sent
    console.log('Sending note data:', noteData);

    // Send the data to the API
    axios.post(post, noteData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(response => {
        console.log('Note added successfully:', response);

        // Check if the response contains an error message
        if (response.data && response.data.error) {
          throw new Error(response.data.error);
        }

        // Show success message
        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Success</span>`,
          html: `
            <div class="text-center py-3">
              <div class="mb-3">
                <i class="fas fa-check-circle fa-3x text-success"></i>
              </div>
              <p class="text-muted">Your note has been saved successfully.</p>
            </div>
          `,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-popup-custom',
            title: 'swal-title-custom'
          }
        });

        // Close the modal and reset the new note input
        toggleAddNoteModal();

        // Refresh the notes
        setTimeout(() => {
          fetchNotes();
          // Call the callback function if provided
          if (typeof onNotesUpdated === 'function') {
            onNotesUpdated();
          }
        }, 2100);
      })
      .catch(err => {
        console.error('Error adding note:', err);

        // Log more detailed error information
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
          console.error('Error response headers:', err.response.headers);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('Error request:', err.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', err.message);
        }

        Swal.fire({
          title: `<span style="font-size: 1.2rem; color: #333;">Error</span>`,
          html: `
            <div class="text-center py-3">
              <div class="mb-3">
                <i class="fas fa-exclamation-circle fa-3x text-danger"></i>
              </div>
              <p class="text-muted">There was a problem saving your note. Please try again.</p>
              <p class="text-muted small">${err.response ? `Error: ${err.response.status} - ${err.response.statusText}` : err.message}</p>
            </div>
          `,
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-popup-custom',
            title: 'swal-title-custom'
          }
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Render the notes list
  const renderNotesList = () => {
    if (notes.length === 0) {
      return (
        <div className="text-center py-4 bg-light rounded">
          <div className="mb-3">
            <i className="fas fa-sticky-note fa-3x text-muted"></i>
          </div>
          <p className="text-muted">No notes available</p>
          <button
            className="btn add-note-btn mt-3"
            onClick={toggleAddNoteModal}
          >
            <span className="d-flex align-items-center">
              <i className="fas fa-plus me-2"></i>Add Note
            </span>
          </button>
        </div>
      );
    }

    return (
      <div
        id="scrollableNotesDiv"
        className="scrollable-notes-container"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <InfiniteScroll
          dataLength={notes.length}
          next={loadMoreNotes}
          hasMore={hasMoreNotes}
          loader={
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted small mt-2">Loading more notes...</p>
            </div>
          }
          endMessage={
            <div className="text-center py-3">
              <p className="text-muted small">No more notes to load</p>
            </div>
          }
          scrollableTarget="scrollableNotesDiv"
        >
          {notes.map((note) => (
            <div
              key={note.id}
              className="note-item mb-3 p-3 bg-white rounded shadow-sm"
            >
              <div className="d-flex justify-content-between">
                <div className="note-date fw-bold">{note.formattedDate}</div>
                <div className="note-date fw-bold">{note.formattedTime}</div>
              </div>
              <div className="note-content mt-2">
                <div className="d-flex align-items-start">
                  <span className="note-text">{note.text}</span>
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    );
  };

  // Render the view notes modal
  const renderViewNotesModal = () => {
    return (
      <Modal
        show={showViewNotesModal}
        onClose={closeViewNotesModal}
        title={`Notes ${entityName ? `for ${entityName}` : ''}`}
        size="lg"
        showFooter={false}
      >
        {loading && notes.length === 0 ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading notes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="mb-3">
              <i className="fas fa-exclamation-circle fa-3x text-danger"></i>
            </div>
            <p className="text-muted">{error}</p>
          </div>
        ) : (
          renderNotesList()
        )}
      </Modal>
    );
  };

  // Render the add note modal
  const renderAddNoteModal = () => {
    return (
      <Modal
        show={showAddNoteModal}
        onClose={toggleAddNoteModal}
        title="Add Note"
        showFooter={false}
      >
        <form onSubmit={handleAddNote}>
          <div className="text-start">
            <div className="mb-3">
              <textarea
                className="form-control"
                id="note-content"
                rows="5"
                placeholder="Enter your note here..."
                style={{ resize: 'vertical', minHeight: '100px' }}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="text-muted small">
              <i className="fas fa-info-circle me-1"></i>
              Your note will be saved with the current date and time.
            </div>
          </div>
          <div className="d-flex justify-content-center mt-4">
            <SaveButton
              type="submit"
              text="Save Note"
              onClick={() => {}} // Form will handle submission
              disabled={loading}
              loading={loading}
            />
          </div>
        </form>
      </Modal>
    );
  };

  return (
    <div className="notes-component">
      {/* Buttons for viewing and adding notes */}
      {showButtons && (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={handleViewNotes}
            title="View Notes"
          >
            <i className="fas fa-eye"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={toggleAddNoteModal}
            title="Add Notes"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      )}

      {/* Display notes directly if showNotes is true */}
      {showNotes && (
        <div className="notes-container p-0">
          <div className="d-flex justify-content-between align-items-center mb-4 notes-header">
            <h6 className="notes-title mb-0">
              {entityType === 'lead' ? 'Lead' : 'Project'} notes and activity history
            </h6>
            <button
              className="add-note-btn"
              onClick={toggleAddNoteModal}
            >
              <span className="d-flex align-items-center">
                <i className="fas fa-plus me-2"></i>Add Note
              </span>
            </button>
          </div>

          {loading && notes.length === 0 ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading notes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <div className="mb-3">
                <i className="fas fa-exclamation-circle fa-3x text-danger"></i>
              </div>
              <p className="text-muted">{error}</p>
            </div>
          ) : (
            renderNotesList()
          )}
        </div>
      )}

      {/* View Notes Modal */}
      {showViewNotesModal && renderViewNotesModal()}

      {/* Add Note Modal */}
      {showAddNoteModal && renderAddNoteModal()}
    </div>
  );
};

export default Notes;
