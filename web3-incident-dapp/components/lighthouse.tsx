// FileUploader.tsx

import React, { useState, useRef } from 'react';

const FileUploader: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [cid, setCid] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    const file = fileInput.files[0];
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      console.log('Upload result:', result.ipfsUrl);

      setUploadStatus(`Upload completed. Your CID is ${result.ipfsCid}`);
      setCid(result.ipfsCid);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>File Uploader</h2>
      <input type="file" ref={fileInputRef} id="fileUpload" />
      <button className='text-black' onClick={uploadFile}>Upload File</button>
      <p>{uploadStatus}</p>
      <div>
        <label htmlFor="cid">CID:</label>
        <input type="text" id="cid" value={cid} readOnly />
      </div>
    </div>
  );
};

export default FileUploader;
