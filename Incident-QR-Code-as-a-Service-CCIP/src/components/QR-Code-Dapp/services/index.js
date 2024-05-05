import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import { useReadContract } from 'wagmi'
const projectId = '2ONjCGu7UlrPOzmZ3hqy8WlN2GC';
const projectSecretKey = '43cc6a424bd74fd70d8a175972fbba87';
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecretKey}`).toString('base64')}`;
const subdomain = 'https://uniqo-marketplace.infura-ipfs.io';

const client = ipfsHttpClient({
    host: 'infura-ipfs.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== 'undefined') {
        try {
            const result = await client.add(file);
            return `${subdomain}/ipfs/${result.path}`;
        } catch (error) {
            console.log('IPFS image upload error: ', error);
            return;
        }
    }

    
};




export default uploadToIPFS;