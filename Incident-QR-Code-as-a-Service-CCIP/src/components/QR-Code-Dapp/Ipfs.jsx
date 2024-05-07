import { useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

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

const Ipfs = () => {
    const [image, setImage] = useState('');
    console.log("this is image", image);
    const [price, setPrice] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const uploadToIPFS = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file);
                setImage(`${subdomain}/ipfs/${result.path}`);
            } catch (error) {
                console.log('IPFS image upload error: ', error);
            }
        }
    };

    const createNFT = async () => {
        if (!image || !price || !name || !description) return;
        try {
            const result = await client.add(JSON.stringify({ image, price, name, description }));
            console.log('IPFS result:', result);
            // Do something with the IPFS result if needed
        } catch (error) {
            console.log('IPFS URI upload error: ', error);
        }
    };

    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                    <div className="content mx-auto">
                        <div className="g-4">
                            <input type="file" required name="file" onChange={uploadToIPFS} />
                            <input onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
                            <textarea onChange={(e) => setDescription(e.target.value)} size="lg" required placeholder="Description" />
                            <input onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in MATIC" />
                            <div className="d-grid px-0">
                                <button onClick={createNFT} className="btn btn-primary btn-lg">
                                    Create & List NFT!
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Ipfs;
