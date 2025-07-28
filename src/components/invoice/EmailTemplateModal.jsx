import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const EmailTemplateModal = ({
  show,
  onHide,
  onSubmit,
  customerName,
  invoiceNumber,
  leadId,
  defaultTemplateId = '108'
}) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplateId);
  const [subject, setSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });
  const editorRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (show) {
      fetchTemplates();
      setApiMessage({ type: '', text: '' }); // Clear message on modal open
    }
  }, [show]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://play.occamsadvisory.com/portal/wp-json/v1/invoice_email_templates_list');
      if (response.data.success) {
        // Parse the HTML string to extract options
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data.data.dropdown, 'text/html');
        const select = doc.querySelector('select');
        const options = Array.from(select.options).map(option => ({
          id: option.value,
          title: option.text,
          subject: option.getAttribute('data-subject'),
          template: option.getAttribute('data-template')
        }));
        setTemplates(options);

        // Only set default template on initial load
        if (isInitialLoad) {
          const defaultTemplate = options.find(t => t.id === defaultTemplateId);
          if (defaultTemplate) {
            setSelectedTemplate(defaultTemplateId);
            setSubject(defaultTemplate.subject);
            setEmailContent(defaultTemplate.template);
            setIsInitialLoad(false);
          }
        } else {
          // If not initial load, set the previously selected template
          const currentTemplate = options.find(t => t.id === selectedTemplate);
          if (currentTemplate) {
            setSubject(currentTemplate.subject);
            setEmailContent(currentTemplate.template);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setEmailContent(template.template);
    } else {
      setSelectedTemplate('');
      setSubject('');
      setEmailContent('');
    }
    setApiMessage({ type: '', text: '' }); // Clear message on template change
  };

  const handleSubmit = async () => {
    setLoading(true); // Show loader and disable button
    const currentContent = editorRef.current ? editorRef.current.getContent() : emailContent;

    const processedSubject = subject
      .replace('{{customer_name}}', customerName)
      .replace('{{invoice_number}}', invoiceNumber);
    
    const processedContent = currentContent
      .replace('{{customer_name}}', customerName)
      .replace('{{invoice_number}}', invoiceNumber);

    // Prepare data for API
    const postData = new URLSearchParams();
    postData.append('custom_invoice_body', processedContent);
    postData.append('custom_invoice_subject', processedSubject);
    
    // Get lead_id from input field with id 'leadId'
    let lead_id = '';
    const leadInput = document.getElementById('leadId');
    if (leadInput && leadInput.value) {
      lead_id = leadInput.value;
    }
    postData.append('lead_id', lead_id || '');

    // Ensure user_id is set
    let userId = '';
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userDataobj =  userData?.user || userData?.data?.user || null;
      userId =userDataobj.id
      
      //if (userObj?.user || userObj?.data?.user) userObjnn = userObj?.user;
      //console.log('userData id', userObjnn.id);
    } catch (e) {}
    postData.append('user_id', userId);

    // Validation
    if (!processedSubject.trim()) {
      setApiMessage({ type: 'error', text: 'Subject is required.' });
      setLoading(false);
      return;
    }
    if (!lead_id) {
      setApiMessage({ type: 'error', text: 'Lead is not selected!. Please select a lead.' });
      setLoading(false);
      return;
    }

    // Debug log
    //console.log('lead_id:', lead_id, 'user_id:', userId);

    try {
      const response = await axios.post(
        'https://play.occamsadvisory.com/portal/wp-json/v1/save_custom_invoice_email_temp',
        postData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.result === 'success') {
        setApiMessage({ type: 'success', text: response.data.msg || 'Email Template Saved Successfully' });
        // Call onSubmit with template ID
        const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
        onSubmit({ 
          templateId: selectedTemplate, 
          subject: processedSubject, 
          content: processedContent,
          title: selectedTemplateData ? selectedTemplateData.title : ''
        });
         // Set the hidden field value before API call
      // const tempTypeInput = document.getElementById('email_temp_type_edited');
       //if (tempTypeInput) tempTypeInput.value = 'custom_invoice_email_edited';
        setTimeout(() => {
          onHide();
        }, 1500);
      } else {
        setApiMessage({ type: 'error', text: response.data.msg || 'Failed to save email template.' });
      }
    } catch (error) {
      console.error('Error saving email template:', error);
      setApiMessage({ type: 'error', text: 'An error occurred while saving the email template.' });
    } finally {
      setLoading(false); // Hide loader and enable button
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Email Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select Template</Form.Label>
            <Form.Select
            className='email_template_select'
              value={selectedTemplate}
              onChange={handleTemplateChange}
              disabled={loading}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Subject*</Form.Label>
            <Form.Control
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email Content</Form.Label>
            <Editor
              onInit={(evt, editor) => editorRef.current = editor}
              value={emailContent}
              onEditorChange={(newContent) => setEmailContent(newContent)}
              apiKey='npfdjz9es5ie4co83h7h59t2apisb7rlwq9z6b0aeprubz1v'
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar: 'undo redo | formatselect | '
                       + 'bold italic backcolor | alignleft aligncenter '
                       + 'alignright alignjustify | bullist numlist outdent indent | '
                       + 'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
          </Form.Group>
          
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          className='occams_submit_btn'
          onClick={handleSubmit}
          disabled={loading || !selectedTemplate || !subject || !emailContent}
        >
          {loading ? 'Saving...' : 'Submit'}
        </Button>
        {apiMessage.text && (
          <span className={`ms-2 text-${apiMessage.type === 'success' ? 'success' : 'danger'}`}>
            {apiMessage.text}
          </span>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default EmailTemplateModal; 