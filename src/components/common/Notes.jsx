import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import Swal from 'sweetalert2';
import './Notes.css';
import { SaveButton } from './ActionButtons';
import Modal from './Modal';
import { getUserId } from '../../utils/userUtils';

// validations
import { noteFormSchema } from '../../components/validationSchemas/leadSchema.jsx';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// date formate
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);


// Standardized date formatting function for MM/DD/YYYY format
const formatDateToMMDDYYYYss = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    // Format as MM/DD/YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export function formatDateToMMDDYYYY(dateString,entityType) {
if(entityType=='lead'){
  if (!dateString) return "Invalid Date";

    // List of possible formats your dateString may come in
    const possibleFormats = [
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD hh:mm:ss A",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ss A",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ssA",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ss A",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ss",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD HH:mm:ssA",
        "YYYY-MM-DD HH:mm:ss a"
    ];

    let parsedDate = null;

    // Try parsing the string with all formats
    for (let format of possibleFormats) {
        const attempt = dayjs.tz(dateString, format, "UTC");
        if (attempt.isValid()) {
            parsedDate = attempt;
            break;
        }
    }

    // If none matched, fallback
    if (!parsedDate) {
        parsedDate = dayjs.tz(dateString, "UTC");
        if (!parsedDate.isValid()) {
            return "Invalid Date";
        }
    }

    // Convert to EST timezone (America/New_York)
    const estDate = parsedDate.tz("America/New_York");

    // Format output like: (08:15am on Wed Jun 04th, 2025)
    const hour12 = estDate.format("hh:mmA").toLowerCase();
    const weekDay = estDate.format("ddd");
    const month = estDate.format("MMM");
    const day = estDate.format("DD");
    const year = estDate.format("YYYY");

    // Add ordinal suffix
    const ordinalSuffix = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `(${hour12} on ${weekDay} ${month} ${parseInt(day)}${ordinalSuffix(day)}, ${year})`;
  }else{
    if (!dateString) return 'Invalid Date';

  // Parse as custom time format in UTC
  const parsed = dayjs.utc(dateString, 'YYYY-MM-DD hh:mm:ssa');

  if (!parsed.isValid()){
    // ------ date formate change ----
    if (!dateString) return "Invalid Date";

    // List of possible formats your dateString may come in
    const possibleFormats = [
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD hh:mm:ss A",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ss A",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ssA",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ss A",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD hh:mm:ss",
        "YYYY-MM-DD hh:mm:ssa",
        "YYYY-MM-DD HH:mm:ssA",
        "YYYY-MM-DD HH:mm:ss a"
    ];

    let parsedDate = null;

    // Try parsing the string with all formats
    for (let format of possibleFormats) {
        const attempt = dayjs.tz(dateString, format, "UTC");
        if (attempt.isValid()) {
            parsedDate = attempt;
            break;
        }
    }

    // If none matched, fallback
    if (!parsedDate) {
        parsedDate = dayjs.tz(dateString, "UTC");
        if (!parsedDate.isValid()) {
            return "Invalid Date";
        }
    }

    // Convert to EST timezone (America/New_York)
    const estDate = parsedDate.tz("America/New_York");

    // Format output like: (08:15am on Wed Jun 04th, 2025)
    const hour12 = estDate.format("hh:mmA").toLowerCase();
    const weekDay = estDate.format("ddd");
    const month = estDate.format("MMM");
    const day = estDate.format("DD");
    const year = estDate.format("YYYY");

    // Add ordinal suffix
    const ordinalSuffix = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `(${hour12} on ${weekDay} ${month} ${parseInt(day)}${ordinalSuffix(day)}, ${year})`;
  }

  const estDate = parsed.tz('America/New_York');

  const hour12 = estDate.format('hh:mma').toLowerCase(); // e.g., 11:45am
  const weekDay = estDate.format('ddd');                 // e.g., Mon
  const month = estDate.format('MMM');                   // e.g., Jun
  const day = estDate.date();                            // e.g., 30
  const year = estDate.year();                           // e.g., 2025

  const ordinalSuffix = (n) => {
    if (n >= 11 && n <= 13) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `(${hour12} on ${weekDay} ${month} ${day}${ordinalSuffix(day)}, ${year})`;
  }
}


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
  maxHeight = 550,
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
  // const [newNote, setNewNote] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(noteFormSchema),
    mode: 'onTouched'
  });

  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Determine API endpoints based on entity type
  const getApiEndpoints = () => {
    // Make sure entityId is not undefined or null
    const safeEntityId = entityId || '';
    //console.log('Using entityId for API endpoints:', safeEntityId);

    switch (entityType) {
      case 'lead':
        return {
          get: `https://portal.occamsadvisory.com/portal/wp-json/v1/lead-notes/${safeEntityId}`,
          post: 'https://portal.occamsadvisory.com/portal/wp-json/v1/lead-notes'
        };
      case 'project':
        return {
          get: `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-notes/${safeEntityId}`,
          post: 'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/project-notes'
        };
      case 'opportunity':
        //console.log('Opportunity ID for notes API:', safeEntityId);
        // Use the exact API endpoint from the Postman GET screenshot
        return {
          get: `https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/opportunity-notes?opportunity_id=${safeEntityId}`,
          post: 'https://portal.occamsadvisory.com/portal/wp-json/portalapi/v1/opportunity-notes'
        };
      default:
        return {
          get: `https://portal.occamsadvisory.com/portal/wp-json/v1/lead-notes/${safeEntityId}`,
          post: 'https://portal.occamsadvisory.com/portal/wp-json/v1/lead-notes'
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
  const fetchNotes = (page = 1, isRetry = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    const { get } = getApiEndpoints();

    // Add page parameter if API supports pagination
    // For opportunity notes, the opportunity_id is already in the URL
    const apiUrl = entityType === 'opportunity'
      ? get
      : `${get}${page > 1 ? `?page=${page}` : ''}`;

    //console.log(`Fetching notes from API: ${apiUrl} for entity type: ${entityType}, entityId: ${entityId}, isRetry: ${isRetry}, retryCount: ${retryCount}`);

    // Additional logging for opportunity notes
    if (entityType === 'opportunity') {
      //console.log('OPPORTUNITY NOTES FETCH DEBUG:');
      //console.log('- API URL:', apiUrl);
      //console.log('- Opportunity ID:', entityId);
      //console.log('- Entity Name:', entityName);
    }

    // For debugging - log the entity ID and type
    // console.log('Entity details:', {
    //   type: entityType,
    //   id: entityId,
    //   name: entityName,
    //   endpoint: get
    // });

    // Function to process notes response
    const processNotesResponse = (response) => {
      // Reset retry count on successful response
      if (retryCount > 0) {
        //console.log('Resetting retry count after successful response');
        setRetryCount(0);
      }

      //console.log('Notes API response:', response);

      // Process the response data based on format
      let fetchedNotes = [];

      if (Array.isArray(response.data)) {
        //console.log('Response data is an array with', response.data.length, 'items');
        fetchedNotes = response.data;
      } else if (response.data && typeof response.data === 'object') {
        //console.log('Response data is an object:', response.data);

        // Special handling for opportunity notes
        if (entityType === 'opportunity') {
          //console.log('Processing opportunity notes response');

          // Check for different possible formats in the opportunity notes response
          //console.log('Opportunity notes response structure:', JSON.stringify(response.data, null, 2));

          // Based on the Postman GET screenshot, the response has a notes array
          if (response.data.status === 200 && response.data.message && response.data.message.includes("fetch successfully") && Array.isArray(response.data.notes)) {
            //console.log('Found opportunity notes in response.data.notes');
            fetchedNotes = response.data.notes;
          }
          // Handle create note response
          else if (response.data.status === 200 && response.data.message && response.data.message.includes("create successfully")) {
            //console.log('Found success response for note creation');
            // This is a success response for creating a note, not for fetching notes
            fetchedNotes = [];
          }
          // Handle other possible formats
          else if (Array.isArray(response.data)) {
            //console.log('Found opportunity notes as array in response.data');
            fetchedNotes = response.data;
          } else if (Array.isArray(response.data.data)) {
            //console.log('Found opportunity notes in response.data.data');
            fetchedNotes = response.data.data;
          } else if (Array.isArray(response.data.opportunity_notes)) {
            //console.log('Found opportunity notes in response.data.opportunity_notes');
            fetchedNotes = response.data.opportunity_notes;
          } else if (response.data.note) {
            //console.log('Found single opportunity note in response.data.note');
            fetchedNotes = [response.data.note];
          } else if (response.data.status && response.data.status === 200 && response.data.message) {
            // This is likely a success response with no notes
            //console.log('Found success response with no notes');
            fetchedNotes = [];
          } else {
            // If it's a single note object, wrap it in an array
            //console.log('Treating response data as a single opportunity note object');
            fetchedNotes = [response.data];
          }
        } else {
          // Standard handling for other entity types
          if (Array.isArray(response.data.data)) {
            //console.log('Response data.data is an array with', response.data.data.length, 'items');
            fetchedNotes = response.data.data;
          } else if (Array.isArray(response.data.notes)) {
            //console.log('Found notes in response.data.notes');
            fetchedNotes = response.data.notes;
          } else {
            // If it's a single note object, wrap it in an array
            //console.log('Treating response data as a single note object');
            fetchedNotes = [response.data];
          }
        }
      }

      // Format the notes for display in MM/DD/YYYY format (no time)
      const formattedNotes = fetchedNotes.map(note => {
        // Parse the date from the note (handle different field names)
        const originalDate = new Date(note.created_at || note.date || note.created || new Date());

        // Format the date in MM/DD/YYYY format
        // const formattedDate = formatDateToMMDDYYYY(note.created_at || note.date || note.created || new Date());
           const formattedDate = formatDateToMMDDYYYY(note.created_at || note.date || note.created || new Date(),entityType);

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
          formattedDate
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
    };

    // Function to handle errors
    const handleError = (err) => {
      console.error('Error fetching notes:', err);

      // Log more detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);

        // If it's a 404 error for opportunity notes, don't show an error message
        // This is likely because there are no notes yet for this opportunity
        if (entityType === 'opportunity' && err.response.status === 404) {
          //console.log('No notes found for this opportunity (404 response)');
          //console.log('Opportunity ID:', entityId);
          //console.log('API URL that returned 404:', apiUrl);
          // Set empty notes array and clear error
          setNotes([]);
          setError(null);
          // Log additional information for debugging
          //console.log('Setting empty notes array for opportunity with no notes');
        }
        // Handle 500 errors for opportunity notes - retry a few times before showing error
        else if (entityType === 'opportunity' && err.response.status === 500) {
          //console.log('Server error for opportunity notes (500 response)');
          //console.log('Opportunity ID:', entityId);
          //console.log('API URL that returned 500:', apiUrl);
          //console.log('Current retry count:', retryCount);

          // If we haven't reached the maximum number of retries, try again
          if (retryCount < MAX_RETRIES) {
            //console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
            setRetryCount(prevCount => prevCount + 1);

            // Wait a moment before retrying
            setTimeout(() => {
              //console.log('Retrying fetch notes after 500 error');
              fetchNotes(page, true);
            }, 1000); // Wait 1 second before retrying
          } else {
            // If we've reached the maximum number of retries, show an error
            //console.log(`Maximum retries (${MAX_RETRIES}) reached, showing error`);
            setRetryCount(0); // Reset retry count
            setNotes([]);
            setError('No notes available for this opportunity.');
            //console.log('Setting empty notes array for opportunity with server error after max retries');
          }
        } else {
          setError(`Failed to load notes. Error: ${err.response.status} - ${err.response.statusText}`);
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('Failed to load notes. No response received from server.');
      } else {
        console.error('Error message:', err.message);
        setError(`Failed to load notes: ${err.message}`);
      }
    };

    // Use GET for all entity types including opportunity
    //console.log(`Using GET for ${entityType} notes with ID:`, entityId);
    //console.log('API URL:', apiUrl);

    axios.get(apiUrl)
      .then(processNotesResponse)
      .catch(handleError)
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
    // setShowAddNoteModal(!showAddNoteModal);
    // setNewNote('');
    setShowAddNoteModal(!showAddNoteModal);
    reset(); // clear form and validation
  };

  // Function to handle adding a new note
  const handleAddNote = (formData) => {
    // Allow empty notes to be submitted, but trim it for the API call
    const trimmedNote = formData.note ? formData.note.trim() : '';

    // Debug information
    //console.log('Adding note for:', { entityType, entityId, trimmedNote });

    setLoading(true);

    const { post } = getApiEndpoints();
    //console.log('Using API endpoint:', post);

    // Make sure entityId is not undefined or null
    const safeEntityId = entityId || '';
    const userId = getUserId();
    // Prepare the data for the API based on entity type
    let noteData;
    if (entityType === 'lead') {
      noteData = {
        lead_id: safeEntityId,
        note: trimmedNote,
        user_id: userId  // This should ideally come from a user context
      };
    }
    else if (entityType === 'project') {
      noteData = {
        project_id: safeEntityId,
        note: trimmedNote,
        user_id: userId  // This should ideally come from a user context
      };
    } else if (entityType === 'opportunity') {
      // For opportunities, ensure we're sending the correct data format
      // Based on the Postman screenshot
      noteData = {
        opportunity_id: safeEntityId,
        note: trimmedNote,
        user_id: userId  // Required parameter as shown in the Postman screenshot
      };

      // Log the data being sent for debugging
      //console.log('Opportunity note data being sent:', noteData);
    } else {
      // Default case for leads
      noteData = {
        lead_id: safeEntityId,
        note: trimmedNote,
        status: 'active'
      };
    }

    // Log the data being sent
    //console.log('Sending note data:', noteData);

    // Log additional information for opportunity notes
    if (entityType === 'opportunity') {
      //console.log('OPPORTUNITY NOTE DEBUG INFO:');
      //console.log('- Opportunity ID:', entityId);
      //console.log('- API Endpoint:', post);
      //console.log('- Note Data:', JSON.stringify(noteData, null, 2));
    }

    // Send the data to the API
    axios.post(post, noteData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(response => {
        //console.log('Note added successfully:', response);

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
          // For opportunity notes, we need to force a refresh
          if (entityType === 'opportunity') {
            //console.log('Refreshing opportunity notes after adding a new note');
            // Clear the notes array first to ensure we get fresh data
            setNotes([]);
            // Then fetch the notes again
            fetchNotes();
          } else {
            fetchNotes();
          }

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

          // Log the entity type and ID for debugging
          console.error('Entity type:', entityType);
          console.error('Entity ID:', safeEntityId);
          console.error('API endpoint used:', post);
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
        <form onSubmit={handleSubmit(handleAddNote)}>
          <div className="text-start">
            <div className="mb-3">
              <textarea
                className={`form-control ${errors.note ? 'is-invalid' : ''}`}
                id="note-content"
                rows="5"
                placeholder="Enter your note here..."
                style={{ resize: 'vertical', minHeight: '100px' }}
                {...register('note')}
                maxLength={1000}
              ></textarea>
              {errors.note && (
                <div className="invalid-feedback">{errors.note.message}</div>
              )}
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
              {entityType === 'lead' ? 'Lead' :
               entityType === 'project' ? 'Project' :
               entityType === 'opportunity' ? 'Opportunity' : 'Entity'} notes and activity history
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
