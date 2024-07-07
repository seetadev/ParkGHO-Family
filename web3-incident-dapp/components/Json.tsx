// /app/components/UploadForm.tsx

import { useState, FormEvent } from 'react';

interface UploadFormProps {
  formData: FormData;
}

const UploadForm: React.FC<UploadFormProps> = ({ formData }) => {
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.has('image') || !formData.has('name') || !formData.has('description') || !formData.has('file')) {
      setMessage('Please fill out all fields and select a file.');
      return;
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Data saved successfully!');
      } else {
        setMessage(result.error || 'Something went wrong.');
      }
    } catch (error) {
      setMessage('An error occurred while saving the data.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Upload Form</h1>
      <form onSubmit={handleSubmit}>
        {/* Form inputs can be displayed for review or left out */}
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadForm;
