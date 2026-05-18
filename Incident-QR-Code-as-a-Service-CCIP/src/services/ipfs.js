const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_BASE_URL = 'https://api.pinata.cloud';

const getPinataHeaders = () => {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error('Missing VITE_PINATA_API_KEY or VITE_PINATA_API_SECRET in your .env file.');
  }
  return {
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_API_SECRET,
  };
};

export const uploadFileToWeb3Storage = async (file) => {
  if (!file) throw new Error('No file provided for IPFS upload.');

  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: getPinataHeaders(),
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.details || 'Pinata upload failed. Check your API keys.');
  }

  return data.IpfsHash;
};

export const uploadJSONToWeb3Storage = async (json, filename = 'metadata.json') => {
  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
  const file = new File([blob], filename, { type: 'application/json' });
  return uploadFileToWeb3Storage(file);
};

export const buildWeb3StorageUrl = (cid, path = '') => {
  return `https://gateway.pinata.cloud/ipfs/${cid}${path ? `/${path}` : ''}`;
};
