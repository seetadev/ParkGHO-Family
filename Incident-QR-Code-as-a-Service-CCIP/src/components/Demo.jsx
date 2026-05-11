import React, { useState, useEffect } from "react";

import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";
import { analyzeIncidentText } from "../services/incidentAnalyzer";
import { uploadFileToWeb3Storage, buildWeb3StorageUrl } from "../services/ipfs";
import IncidentDashboard from "./IncidentDashboard";
import "../styles/Demo.css";

const Demo = () => {
  // Mode state
  const [mode, setMode] = useState("summarizer"); // summarizer, analyzer, dashboard
  
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  
  // Incident Analyzer state
  const [incident, setIncident] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [claimTitle, setClaimTitle] = useState("");
  const [claimLocation, setClaimLocation] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [evidenceCID, setEvidenceCID] = useState("");
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");

  const canUploadEvidence = Boolean(import.meta.env.VITE_WEB3_STORAGE_TOKEN);

  // RTK lazy query
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  // Load data from localStorage on mount
  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
    
    // Load incident history
    const historyFromLocalStorage = JSON.parse(
      localStorage.getItem("incidentHistory")
    );

    if (historyFromLocalStorage) {
      setIncidentHistory(historyFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const existingArticle = allArticles.find(
      (item) => item.url === article.url
    );

    if (existingArticle) return setArticle(existingArticle);

    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];

      // update state and local storage
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  // copy the url and toggle the icon for user feedback
  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setEvidenceCID("");
    setUploadError("");
  };

  const handleUploadEvidence = async () => {
    if (!selectedFile) {
      setUploadError("Please choose a file to upload.");
      return;
    }

    setUploadError("");
    setIsUploadingEvidence(true);

    try {
      const cid = await uploadFileToWeb3Storage(selectedFile);
      setEvidenceCID(cid);
      setClaimSuccess("");
    } catch (uploadErr) {
      setUploadError(uploadErr.message || "Upload failed. Please check your token and network.");
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  const handleSaveClaim = () => {
    if (!analysis) return;

    const incidentRecord = {
      ...analysis,
      title: claimTitle || analysis.categories.join(', ') || 'Incident Report',
      location: claimLocation,
      evidenceCID,
      evidenceFileName: selectedFile?.name || '',
      timestamp: new Date().toISOString(),
    };

    const updated = [incidentRecord, ...incidentHistory];
    setIncidentHistory(updated);
    localStorage.setItem("incidentHistory", JSON.stringify(updated));
    setClaimSuccess("Claim saved successfully with decentralized evidence reference.");
    setClaimTitle("");
    setClaimLocation("");
    setSelectedFile(null);
    setEvidenceCID("");
    setUploadError("");
    setAnalysis(null);
  };

  // Analyze incident text
  const analyzeIncident = (text) => {
    if (!text.trim()) return;
    
    const result = analyzeIncidentText(text);
    setAnalysis({ ...result, text });
    
    setIncident("");
  };

  return (
    <section className='mt-16 w-full max-w-xl'>
      {/* Mode Tabs */}
      <div className='flex gap-2 mb-8 border-b border-gray-300'>
        <button
          onClick={() => setMode("summarizer")}
          className={`px-4 py-2 font-semibold transition-all ${
            mode === "summarizer"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          📄 URL Summarizer
        </button>
        <button
          onClick={() => setMode("analyzer")}
          className={`px-4 py-2 font-semibold transition-all ${
            mode === "analyzer"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🔍 Incident Analyzer
        </button>
        <button
          onClick={() => setMode("dashboard")}
          className={`px-4 py-2 font-semibold transition-all ${
            mode === "dashboard"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          📊 Dashboard
        </button>
      </div>

      {/* URL Summarizer Mode */}
      {mode === "summarizer" && (
        <>
          {/* Search */}
          <div className='flex flex-col w-full gap-2'>
            <form
              className='relative flex justify-center items-center'
              onSubmit={handleSubmit}
            >
              <img
                src={linkIcon}
                alt='link-icon'
                className='absolute left-0 my-2 ml-3 w-5'
              />

              <input
                type='url'
                placeholder='https://en.wikipedia.org/wiki/Traffic_collision'
                value={article.url}
                onChange={(e) => setArticle({ ...article, url: e.target.value })}
                onKeyDown={handleKeyDown}
                required
                className='url_input peer'
              />
              <button
                type='submit'
                className='submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700 '
              >
                <p>↵</p>
              </button>
            </form>

            {/* Browse History */}
            <div className='flex flex-col gap-1 max-h-60 overflow-y-auto'>
              {allArticles.reverse().map((item, index) => (
                <div
                  key={`link-${index}`}
                  onClick={() => setArticle(item)}
                  className='link_card'
                >
                  <div className='copy_btn' onClick={() => handleCopy(item.url)}>
                    <img
                      src={copied === item.url ? tick : copy}
                      alt={copied === item.url ? "tick_icon" : "copy_icon"}
                      className='w-[40%] h-[40%] object-contain'
                    />
                  </div>
                  <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                    {item.url}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Display Result */}
          <div className='my-10 max-w-full flex justify-center items-center'>
            {isFetching ? (
              <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
            ) : error ? (
              <p className='font-inter font-bold text-black text-center'>
                Sorry for the result. Please try again.
                <br />
                <span className='font-satoshi font-normal text-gray-700'>
                  {error?.data?.error}
                </span>
              </p>
            ) : (
              article.summary && (
                <div className='flex flex-col gap-3'>
                  <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                    Article <span className='blue_gradient'>Summary</span>
                  </h2>
                  <div className='summary_box'>
                    <p className='font-inter font-medium text-sm text-gray-700'>
                      {article.summary}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}

      {/* Incident Analyzer Mode */}
      {mode === "analyzer" && (
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-gray-700'>
              📝 Describe the Incident:
            </label>
            <textarea
              value={incident}
              onChange={(e) => setIncident(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.keyCode === 13) {
                  analyzeIncident(incident);
                }
              }}
              placeholder='E.g., "Multi-vehicle collision on Main Street with injuries reported and traffic backed up for miles"'
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              rows='4'
            />
            <div className='text-sm text-gray-500'>Tip: Press Ctrl+Enter to analyze</div>
          </div>

          <button
            onClick={() => analyzeIncident(incident)}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition'
          >
            🔍 Analyze Incident
          </button>

          {/* Analysis Results */}
          {analysis && (
            <div className='flex flex-col gap-4 mt-4'>
              <div className='analysis_card p-6 bg-white border border-gray-200 rounded-2xl shadow-sm'>
                <h3 className='font-bold text-lg text-gray-800 mb-3'>Analysis Results</h3>
                
                {/* Claim Metadata */}
                <div className='grid gap-4 md:grid-cols-2 mb-4'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Claim Title</label>
                    <input
                      type='text'
                      value={claimTitle}
                      onChange={(e) => setClaimTitle(e.target.value)}
                      placeholder='Enter a short claim title'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Location</label>
                    <input
                      type='text'
                      value={claimLocation}
                      onChange={(e) => setClaimLocation(e.target.value)}
                      placeholder='e.g. Main Street, City'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className='mb-4'>
                  <p className='font-semibold text-gray-700 mb-2'>Categories:</p>
                  <div className='flex flex-wrap gap-2'>
                    {analysis.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div className='mb-4'>
                  <p className='font-semibold text-gray-700 mb-2'>Severity:</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      analysis.severity === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : analysis.severity === 'High'
                        ? 'bg-orange-100 text-orange-800'
                        : analysis.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {analysis.severity}
                  </span>
                </div>

                {/* Confidence Score */}
                <div className='mb-4'>
                  <p className='font-semibold text-gray-700 mb-2'>
                    Confidence: {Math.round(analysis.confidence * 100)}%
                  </p>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full'
                      style={{ width: `${analysis.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Suggested Actions */}
                <div className='mb-6'>
                  <p className='font-semibold text-gray-700 mb-2'>Suggested Actions:</p>
                  <ul className='list-disc list-inside space-y-1'>
                    {analysis.suggestedActions.map((action, idx) => (
                      <li key={idx} className='text-gray-700 text-sm'>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence Upload */}
                <div className='space-y-4'>
                  <div>
                    <p className='font-semibold text-gray-700 mb-2'>Evidence Upload</p>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={handleFileChange}
                      className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                    />
                  </div>

                  {selectedFile && (
                    <div className='rounded-2xl border border-gray-200 bg-slate-50 p-4'>
                      <p className='text-sm font-medium text-slate-700'>Selected file:</p>
                      <p className='text-sm text-slate-600'>{selectedFile.name}</p>
                    </div>
                  )}

                  <div className='flex flex-col gap-3'>
                    <button
                      onClick={handleUploadEvidence}
                      disabled={isUploadingEvidence || !selectedFile || !canUploadEvidence}
                      className='bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:bg-slate-400'
                    >
                      {isUploadingEvidence ? 'Uploading Evidence...' : 'Upload Evidence to IPFS'}
                    </button>
                    {!canUploadEvidence && (
                      <p className='text-sm text-red-600'>
                        Web3.Storage token is required. Set <code>VITE_WEB3_STORAGE_TOKEN</code> in your .env.
                      </p>
                    )}
                    {uploadError && (
                      <p className='text-sm text-red-600'>{uploadError}</p>
                    )}
                    {evidenceCID && (
                      <div className='rounded-2xl border border-green-200 bg-green-50 p-4'>
                        <p className='text-sm font-semibold text-green-900'>Evidence Uploaded</p>
                        <a
                          href={buildWeb3StorageUrl(evidenceCID)}
                          target='_blank'
                          rel='noreferrer'
                          className='text-sm text-blue-700 underline break-all'
                        >
                          {buildWeb3StorageUrl(evidenceCID)}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Claim */}
                <div className='pt-4 border-t border-gray-200'>
                  <button
                    onClick={handleSaveClaim}
                    className='w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition'
                  >
                    ✅ Save Claim with Decentralized Evidence
                  </button>
                  {claimSuccess && (
                    <p className='mt-3 text-sm text-green-700'>{claimSuccess}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dashboard Mode */}
      {mode === "dashboard" && (
        <div className='w-full'>
          <IncidentDashboard />
        </div>
      )}
    </section>
  );
};

export default Demo;