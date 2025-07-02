import { useState } from 'react';
import StorachaUpload from './StorachaUpload';
import LitProtocolManager from './LitProtocolManager';

function HandleIpfs() {
    const [uploadHash, setUploadHash] = useState('');
    const [fileURI, setFileURI] = useState('');

    const handleUploadComplete = (hash: string, uri: string) => {
        setUploadHash(hash);
        setFileURI(uri);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Invoice protection - LIT & Storacha
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Upload to IPFS and encrypt with Lit Protocol for decentralized, secure file management
                    </p>
                </div>

                {/* Step 1: Upload Section */}
                <div className="mb-8">
                    <div className="flex items-center mb-6">
                        <div className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-full font-semibold text-sm mr-3">
                            1
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Upload Invoice (Storacha)
                        </h2>
                    </div>
                    <StorachaUpload onUploadComplete={handleUploadComplete} />
                </div>

                {/* Step 2: Encrypt Section */}
                {uploadHash && fileURI && (
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-full font-semibold text-sm mr-3">
                                2
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-900">
                                Encrypt & Decrypt
                            </h2>
                        </div>
                        <LitProtocolManager fileURI={fileURI} uploadHash={uploadHash} />
                    </div>
                )}

                {/* Waiting State */}
                {!uploadHash && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <div className="flex items-center justify-center mb-3">
                            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-blue-800 font-medium mb-1">Ready to Begin</p>
                        <p className="text-blue-600 text-sm">Upload a file to start the encryption process</p>
                    </div>
                )}

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-slate-200">
                    <div className="text-center">
                        <p className="text-sm text-slate-500">
                            Powered by{' '}
                            <span className="font-medium text-slate-700">Lit Protocol</span>
                            {' '}&{' '}
                            <span className="font-medium text-slate-700">Storacha</span>
                        </p>
                        <div className="flex items-center justify-center mt-3 space-x-4">
                            <div className="flex items-center text-xs text-slate-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                Decentralized Storage
                            </div>
                            <div className="flex items-center text-xs text-slate-400">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
                                End-to-End Encryption
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default HandleIpfs;