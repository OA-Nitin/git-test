import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey='ibxipec548un9t8jbbghd57jsu7lnuk2k9f237075k5k5qm4'
      onInit={(evt, editor) => (editorRef.current = editor)}
      value={value}
      init={{
        height: 300,
        menubar: false,
        branding: false,
        elementpath: false,
        toolbar_sticky: false,
        toolbar_mode: 'sliding',
        plugins: [
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
          'image', 'link', 'lists', 'media', 'searchreplace', 'table',
          'visualblocks', 'wordcount', 'advlist', 'code', 'fullscreen',
          'insertdatetime', 'a11ychecker'
        ],
        toolbar: `
          blocks fontfamily fontsize | 
          bold italic underline strikethrough | addcomment showcomments |
          link image media table mergetags | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | code
        `,
        block_formats:
          'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Blockquote=blockquote',
        style_formats: [
          { title: 'Paragraph', format: 'p' },
          { title: 'Heading 1', format: 'h1' },
          { title: 'Heading 2', format: 'h2' },
          { title: 'Heading 3', format: 'h3' },
          { title: 'Blockquote', format: 'blockquote' },
        ]
      }}
      onEditorChange={onChange}
    />
  );
};

export default RichTextEditor;