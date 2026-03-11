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
            // Simulate progress for better UX
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
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            {/* File Selection */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="file"
                        id="storacha-file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                    />
                    <div className="border-2 border-dashed border-green-400/50 rounded-2xl p-6 text-center hover:border-green-400 hover:bg-green-500/5 transition-all duration-300 cursor-pointer group">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium mb-1">
                            {selectedFile ? selectedFile.name : 'Choose a file'}
                        </h3>
                        <p className="text-gray-400 text-xs">
                            {selectedFile ? 'File selected - ready to upload!' : 'Click to browse or drag and drop'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Upload to Storacha</h3>
                <p className="text-gray-400 text-sm mb-4">Store your file on Web3.Storage</p>
            </div>
            
            {isUploading && progress > 0 && (
                <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-green-400 text-xs text-center">{progress.toFixed(1)}% uploaded</p>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    !selectedFile || isUploading
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                }`}
            >
                {isUploading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading to Storacha...
                    </div>
                ) : (
                    'Upload to Storacha'
                )}
            </button>

            {uploadHash && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-xs font-medium mb-1">✅ Upload Complete!</p>
                    <p className="text-gray-300 text-xs break-all">CID: {uploadHash.substring(0, 20)}...</p>
                </div>
            )}
        </div>
    );
}

export default StorachaUpload;