import lighthouse from '@lighthouse-web3/sdk';
import { useState } from 'react';

interface LighthouseUploadProps {
    onUploadComplete: (hash: string, fileURI: string) => void;
}

function LighthouseUpload({ onUploadComplete }: LighthouseUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadHash, setUploadHash] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;

    const progressCallback = (progressData: { uploaded: number; total: number }) => {
        const percentageDone = 100 - (progressData.total / progressData.uploaded);
        setProgress(Math.min(percentageDone, 100));
        console.log(percentageDone.toFixed(2));
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        
        setIsUploading(true);
        setProgress(0);
        
        try {
            const output = await lighthouse.upload(
                [selectedFile],
                apiKey,
                //@ts-ignore
                undefined,
                //@ts-ignore
                progressCallback
            );
            
            console.log("File Status:", output);
            const link = "https://gateway.lighthouse.storage/ipfs/" + output.data.Hash;
            console.log("fileURI", link);
            
            setUploadHash(output.data.Hash);
            onUploadComplete(output.data.Hash, link);
        } catch (error) {
            console.error("Upload error:", error);
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
                        id="file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setSelectedFile(file);
                        }}
                    />
                    <div className="border-2 border-dashed border-purple-400/50 rounded-2xl p-6 text-center hover:border-purple-400 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Upload to Lighthouse IPFS</h3>
                <p className="text-gray-400 text-sm mb-4">Store your file on decentralized storage</p>
            </div>
            
            {isUploading && progress > 0 && (
                <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-blue-400 text-xs text-center">{progress.toFixed(1)}% uploaded</p>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    !selectedFile || isUploading
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105'
                }`}
            >
                {isUploading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading to Lighthouse...
                    </div>
                ) : (
                    'Upload to Lighthouse'
                )}
            </button>

            {uploadHash && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-xs font-medium mb-1">✅ Upload Complete!</p>
                    <p className="text-gray-300 text-xs break-all">Hash: {uploadHash.substring(0, 20)}...</p>
                </div>
            )}
        </div>
    );
}

export default LighthouseUpload;