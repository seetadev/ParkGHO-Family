import React, { useState } from 'react';
import { create } from '@web3-storage/w3up-client';

interface StorachaUploadProps {
    onUploadComplete: (hash: string, fileURI: string) => void;
}

function StorachaUpload({ onUploadComplete }: StorachaUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadHash, setUploadHash] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setProgress(0);

        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const client = await create();
            await client.login('virtualvasu624@gmail.com');
            await client.setCurrentSpace('did:key:z6Mku19GXrPFP2CyTCSPUaMt3mwdyXuZVurpYgvaqUrn6oFz');

            const cid = await client.uploadFile(selectedFile);
            const url = `https://w3s.link/ipfs/${cid}`;

            clearInterval(progressInterval);
            setProgress(100);

            console.log('Uploaded to Storacha:', url);
            console.log('CID:', cid.toString());

            setUploadHash(cid.toString());
            onUploadComplete(cid.toString(), url);
        } catch (error) {
            console.error("Storacha upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            {/* File Selection */}
            <div className="mb-6">
                <label 
                    htmlFor="storacha-file-upload" 
                    className="block text-sm font-medium text-slate-700 mb-2"
                >
                    Choose a file:
                </label>
                <div className="relative">
                    <input
                        type="file"
                        id="storacha-file-upload"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 file:cursor-pointer cursor-pointer border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                    {selectedFile ? (
                        <span className="text-slate-800 font-medium">{selectedFile.name}</span>
                    ) : (
                        'No file selected'
                    )}
                </p>
            </div>

            {/* Upload Info */}
            <div className="mb-6 bg-slate-50 rounded-md p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Upload to Storacha</h3>
                <p className="text-sm text-slate-600">Store your file on Web3.Storage</p>
            </div>

            {/* Upload Progress */}
            {isUploading && progress > 0 && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="mb-2">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-blue-700">{progress.toFixed(1)}% uploaded</p>
                </div>
            )}

            {/* Upload Button */}
            <div className="mb-6">
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className={`w-full py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                        !selectedFile || isUploading
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm'
                    }`}
                >
                    {isUploading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading to Storacha...
                        </div>
                    ) : (
                        'Upload to Storacha'
                    )}
                </button>
            </div>

            {/* Upload Success Info */}
            {uploadHash && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center mb-2">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="ml-2 text-sm font-medium text-green-800">Upload Complete!</p>
                    </div>
                    <p className="text-sm text-green-700">
                        <span className="font-medium">CID:</span>{' '}
                        <code className="bg-green-100 px-2 py-1 rounded text-xs font-mono">
                            {uploadHash.substring(0, 20)}...
                        </code>
                    </p>
                </div>
            )}
        </div>
    );
}

export default StorachaUpload;