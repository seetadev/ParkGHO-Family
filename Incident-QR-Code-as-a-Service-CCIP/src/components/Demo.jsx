import React, { useState, useEffect } from "react";

import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";
import {
  analyzeIncidentText,
  getLocalSummary,
  isValidUrl,
} from "../services/incidentAnalyzer";

const Demo = () => {
  const [incident, setIncident] = useState({
    input: "",
    summary: "",
    categories: [],
    severity: "",
    suggestedAction: "",
  });
  const [allIncidents, setAllIncidents] = useState([]);
  const [copied, setCopied] = useState("");

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const storedIncidents = JSON.parse(localStorage.getItem("incidents"));
    if (storedIncidents) {
      setAllIncidents(storedIncidents);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const existingIncident = allIncidents.find(
      (item) => item.input === incident.input
    );

    if (existingIncident) {
      setIncident(existingIncident);
      return;
    }

    const isUrl = isValidUrl(incident.input);
    let summary = "";
    let analysis = analyzeIncidentText(incident.input);

    if (isUrl) {
      const { data } = await getSummary({ articleUrl: incident.input });
      summary = data?.summary || "Unable to summarize the provided URL.";
      analysis = analyzeIncidentText(summary || incident.input);
    } else {
      summary = getLocalSummary(incident.input);
    }

    const newIncident = {
      ...incident,
      summary,
      categories: analysis.categories,
      severity: analysis.severity,
      suggestedAction: analysis.suggestedAction,
    };

    const updatedAllIncidents = [newIncident, ...allIncidents];
    setIncident(newIncident);
    setAllIncidents(updatedAllIncidents);
    localStorage.setItem("incidents", JSON.stringify(updatedAllIncidents));
  };

  const handleCopy = (copyInput) => {
    setCopied(copyInput);
    navigator.clipboard.writeText(copyInput);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <section className='mt-16 w-full max-w-xl'>
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
            type='text'
            placeholder='Enter an incident description or a URL to summarize'
            value={incident.input}
            onChange={(e) => setIncident({ ...incident, input: e.target.value })}
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

        <div className='text-xs text-gray-500'>
          You can paste a URL or type/paste incident text directly for analysis.
        </div>

        <div className='flex flex-col gap-1 max-h-60 overflow-y-auto'>
          {[...allIncidents].reverse().map((item, index) => (
            <div
              key={`incident-${index}`}
              onClick={() => setIncident(item)}
              className='link_card'
            >
              <div className='copy_btn' onClick={() => handleCopy(item.input)}>
                <img
                  src={copied === item.input ? tick : copy}
                  alt={copied === item.input ? "tick_icon" : "copy_icon"}
                  className='w-[40%] h-[40%] object-contain'
                />
              </div>
              <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                {item.input}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className='my-10 max-w-full flex justify-center items-center'>
        {isFetching ? (
          <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
        ) : error ? (
          <p className='font-inter font-bold text-black text-center'>
            Something went wrong. Please try again.
            <br />
            <span className='font-satoshi font-normal text-gray-700'>
              {error?.data?.error}
            </span>
          </p>
        ) : (
          incident.summary && (
            <div className='flex flex-col gap-4'>
              <div>
                <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                  Incident <span className='blue_gradient'>Analysis</span>
                </h2>
                <div className='summary_box'>
                  <p className='font-inter font-medium text-sm text-gray-700'>
                    {incident.summary}
                  </p>
                </div>
              </div>

              <div className='grid gap-3 md:grid-cols-3'>
                <div className='analysis_card'>
                  <h3 className='font-satoshi font-semibold text-gray-700'>Categories</h3>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {incident.categories.map((category) => (
                      <span key={category} className='category_tag'>
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className='analysis_card'>
                  <h3 className='font-satoshi font-semibold text-gray-700'>Severity</h3>
                  <span className={`severity_badge severity_${incident.severity.toLowerCase()}`}>
                    {incident.severity}
                  </span>
                </div>
                <div className='analysis_card md:col-span-3'>
                  <h3 className='font-satoshi font-semibold text-gray-700'>Suggested Action</h3>
                  <p className='font-inter text-sm text-gray-600'>{incident.suggestedAction}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
