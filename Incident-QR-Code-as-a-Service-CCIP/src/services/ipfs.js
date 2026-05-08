const WEB3_STORAGE_TOKEN = import.meta.env.VITE_WEB3_STORAGE_TOKEN;

const getWeb3StorageHeaders = () => {
  if (!WEB3_STORAGE_TOKEN) {
    throw new Error('Missing VITE_WEB3_STORAGE_TOKEN. Set it in your .env to enable IPFS upload.');
  }

  return {
    Authorization: `Bearer ${WEB3_STORAGE_TOKEN}`,
  };
};

export const uploadFileToWeb3Storage = async (file) => {
  if (!file) {
    throw new Error('No file provided for IPFS upload.');
  }

  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch('https://api.web3.storage/upload', {
    method: 'POST',
    headers: getWeb3StorageHeaders(),
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Upload failed. Check your Web3.Storage token and network.');
  }

  return data.cid;
};

export const uploadJSONToWeb3Storage = async (json, filename = 'metadata.json') => {
  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
  const file = new File([blob], filename, { type: 'application/json' });
  return uploadFileToWeb3Storage(file);
};

export const buildWeb3StorageUrl = (cid, path = '') => {
  return `https://w3s.link/ipfs/${cid}${path ? `/${path}` : ''}`;
};
