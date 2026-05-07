import React, { useState, useEffect } from "react";

import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";
import { analyzeIncidentText } from "../services/incidentAnalyzer";
import IncidentDashboard from "./IncidentDashboard";
import "../styles/Demo.css";

const Demo = () => {
  const [mode, setMode] = useState("summarize"); // "summarize" or "analyze" or "dashboard"
  
  // URL Summarization state
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");

  // Incident Analysis state
  const [incident, setIncident] = useState({
    text: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [incidentHistory, setIncidentHistory] = useState([]);

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

  // URL Summarization handlers
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

  // Incident Analysis handlers
  const handleIncidentAnalysis = (e) => {
    e.preventDefault();

    if (!incident.text.trim()) return;

    const result = analyzeIncidentText(incident.text);
    setAnalysis(result);

    // Save to history
    const updated = [result, ...incidentHistory];
    setIncidentHistory(updated);
    localStorage.setItem("incidentHistory", JSON.stringify(updated));

    // Clear input
    setIncident({ text: "" });
  };

  const handleIncidentKeyDown = (e) => {
    if (e.keyCode === 13 && e.ctrlKey) {
      handleIncidentAnalysis(e);
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

  return (
    <section className='mt-16 w-full'>
      {/* Mode Tabs */}
      <div className="mode-tabs">
        <button
          className={`tab-btn ${mode === "summarize" ? "active" : ""}`}
          onClick={() => setMode("summarize")}
        >
          📄 URL Summarizer
        </button>
        <button
          className={`tab-btn ${mode === "analyze" ? "active" : ""}`}
          onClick={() => setMode("analyze")}
        >
          🔍 Incident Analyzer
        </button>
        <button
          className={`tab-btn ${mode === "dashboard" ? "active" : ""}`}
          onClick={() => setMode("dashboard")}
        >
          📊 Dashboard
        </button>
      </div>

      {/* URL Summarization Mode */}
      {mode === "summarize" && (
        <div className='max-w-xl mx-auto'>
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
        </div>
      )}

      {/* Incident Analysis Mode */}
      {mode === "analyze" && (
        <div className='max-w-2xl mx-auto'>
          <div className='incident-analyzer-container'>
            <form onSubmit={handleIncidentAnalysis} className='incident-form'>
              <textarea
                placeholder='Describe an incident... (e.g., "Traffic accident involving 3 vehicles on Main Street with injuries reported")'
                value={incident.text}
                onChange={(e) => setIncident({ ...incident, text: e.target.value })}
                onKeyDown={handleIncidentKeyDown}
                className='incident-textarea'
              />
              <button type='submit' className='submit_btn'>
                <p>Analyze (Ctrl+Enter)</p>
              </button>
            </form>

            {/* Analysis Result */}
            {analysis && (
              <div className='analysis-result'>
                <div className='result-header'>
                  <h3 className='result-title'>📊 Analysis Results</h3>
                </div>

                {/* Categories */}
                <div className='result-section'>
                  <h4 className='section-title'>Categories</h4>
                  <div className='tags-container'>
                    {analysis.categories.length > 0 ? (
                      analysis.categories.map((cat, idx) => (
                        <span key={idx} className='category-tag'>{cat}</span>
                      ))
                    ) : (
                      <span className='tag-empty'>No categories detected</span>
                    )}
                  </div>
                </div>

                {/* Severity */}
                <div className='result-section'>
                  <h4 className='section-title'>Severity Level</h4>
                  <span className={`severity-badge severity-${analysis.severity?.toLowerCase()}`}>
                    {analysis.severity}
                  </span>
                </div>

                {/* Suggested Actions */}
                <div className='result-section'>
                  <h4 className='section-title'>Suggested Actions</h4>
                  <ul className='actions-list'>
                    {analysis.actions.length > 0 ? (
                      analysis.actions.map((action, idx) => (
                        <li key={idx} className='action-item'>✓ {action}</li>
                      ))
                    ) : (
                      <li className='action-item'>No specific actions recommended</li>
                    )}
                  </ul>
                </div>

                {/* Confidence */}
                <div className='result-section'>
                  <h4 className='section-title'>Analysis Confidence</h4>
                  <div className='confidence-bar'>
                    <div
                      className='confidence-fill'
                      style={{ width: `${analysis.confidence}%` }}
                    />
                    <span className='confidence-text'>{analysis.confidence}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Mode */}
      {mode === "dashboard" && <IncidentDashboard />}
    </section>
  );
};

export default Demo;