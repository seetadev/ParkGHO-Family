import { useState } from 'react';
import { uploadJSONToWeb3Storage, uploadFileToWeb3Storage } from '../services/ipfs';

export function useIPFS() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadToIPFS = async (data) => {
    setUploading(true);
    setError(null);
    try {
      const cid = await uploadJSONToWeb3Storage(data, 'incident.json');
      return cid;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const uploadFileIPFS = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const cid = await uploadFileToWeb3Storage(file);
      return cid;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadToIPFS, uploadFileIPFS, uploading, error };
}
