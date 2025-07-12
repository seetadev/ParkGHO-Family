import { useState } from 'react';
import LighthouseUpload from './LighthouseUpload';
import StorachaUpload from './StorachaUpload';
import LitProtocolManager from './LitProtocolManager';

type UploadProvider = 'lighthouse' | 'storacha';

function HandleIpfs() {
    const [uploadHash, setUploadHash] = useState('');
    const [fileURI, setFileURI] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<UploadProvider>('lighthouse');

    const handleUploadComplete = (hash: string, uri: string) => {
        setUploadHash(hash);
        setFileURI(uri);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl mx-auto">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Secure File Storage</h1>
                        <p className="text-gray-300">Upload to IPFS and encrypt with Lit Protocol</p>
                    </div>

                    {/* Provider Selection */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <div className="w-6 h-6 bg-indigo-500 rounded-full mr-2 flex items-center justify-center text-white text-sm font-bold">1</div>
                            Choose Storage Provider
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div 
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                    selectedProvider === 'lighthouse' 
                                        ? 'border-blue-500 bg-blue-500/10' 
                                        : 'border-white/20 bg-white/5 hover:border-blue-400/50'
                                }`}
                                onClick={() => setSelectedProvider('lighthouse')}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">Lighthouse</h3>
                                        <p className="text-xs text-gray-400">IPFS with progress tracking</p>
                                    </div>
                                    {selectedProvider === 'lighthouse' && (
                                        <div className="ml-auto">
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div 
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                    selectedProvider === 'storacha' 
                                        ? 'border-green-500 bg-green-500/10' 
                                        : 'border-white/20 bg-white/5 hover:border-green-400/50'
                                }`}
                                onClick={() => setSelectedProvider('storacha')}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">Storacha</h3>
                                        <p className="text-xs text-gray-400">Web3.Storage powered</p>
                                    </div>
                                    {selectedProvider === 'storacha' && (
                                        <div className="ml-auto">
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <div className="w-6 h-6 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-white text-sm font-bold">2</div>
                            Upload File
                        </h2>
                        {selectedProvider === 'lighthouse' ? (
                            <LighthouseUpload onUploadComplete={handleUploadComplete} />
                        ) : (
                            <StorachaUpload onUploadComplete={handleUploadComplete} />
                        )}
                    </div>

                    {/* Encryption Section */}
                    {uploadHash && fileURI && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <div className="w-6 h-6 bg-purple-500 rounded-full mr-2 flex items-center justify-center text-white text-sm font-bold">3</div>
                                Encrypt & Decrypt
                            </h2>
                            <LitProtocolManager fileURI={fileURI} uploadHash={uploadHash} />
                        </div>
                    )}

                    {/* Status Indicator */}
                    {!uploadHash && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-2xl">
                            <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-400">Upload a file to begin encryption process</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        Powered by <span className="text-purple-400 font-medium">Lit Protocol</span> & 
                        {selectedProvider === 'lighthouse' ? (
                            <span className="text-pink-400 font-medium"> Lighthouse</span>
                        ) : (
                            <span className="text-green-400 font-medium"> Storacha</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default HandleIpfs;