import React, { useMemo } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import '../styles/IncidentDashboard.css';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

const CATEGORY_COLORS = {
  'Road Accident': '#ef4444',
  'Road Damage': '#f97316',
  'Traffic Infrastructure': '#eab308',
  'Traffic Congestion': '#3b82f6',
  'Parking Issue': '#8b5cf6',
  'Emergency Hazard': '#ec4899',
};

const SEVERITY_COLORS = {
  'Critical': '#ef4444',
  'High': '#f97316',
  'Medium': '#eab308',
  'Low': '#22c55e',
};

const IncidentDashboard = () => {
  const analytics = useMemo(() => {
    const historyStr = localStorage.getItem('incidentHistory');
    const history = historyStr ? JSON.parse(historyStr) : [];

    if (history.length === 0) {
      return {
        totalIncidents: 0,
        criticalCount: 0,
        mostCommonCategory: 'N/A',
        recentIncidents: [],
        categoryData: [],
        severityData: [],
      };
    }

    // Calculate totals
    const totalIncidents = history.length;
    const criticalCount = history.filter(inc => inc.severity === 'Critical').length;

    // Calculate category distribution
    const categoryCount = {};
    history.forEach(inc => {
      if (inc.categories && Array.isArray(inc.categories)) {
        inc.categories.forEach(cat => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      }
    });

    const mostCommonCategory = Object.entries(categoryCount).length > 0
      ? Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0][0]
      : 'N/A';

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
      fill: CATEGORY_COLORS[name] || '#6b7280',
    }));

    // Calculate severity distribution
    const severityCount = {};
    history.forEach(inc => {
      const severity = inc.severity || 'Low';
      severityCount[severity] = (severityCount[severity] || 0) + 1;
    });

    const severityData = Object.entries(severityCount).map(([name, value]) => ({
      name,
      value,
      fill: SEVERITY_COLORS[name] || '#6b7280',
    }));

    // Get recent incidents (last 5)
    const recentIncidents = history.slice(-5).reverse();

    return {
      totalIncidents,
      criticalCount,
      mostCommonCategory,
      recentIncidents,
      categoryData,
      severityData,
    };
  }, []);

  return (
    <div className="incident-dashboard">
      <h1 className="dashboard-title">📊 Incident Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-card">
          <div className="stat-label">Total Incidents</div>
          <div className="stat-value">{analytics.totalIncidents}</div>
          <div className="stat-subtitle">All analyzed incidents</div>
        </div>

        <div className="stat-card critical-card">
          <div className="stat-label">⚠️ Critical</div>
          <div className="stat-value">{analytics.criticalCount}</div>
          <div className="stat-subtitle">Require immediate action</div>
        </div>

        <div className="stat-card category-card">
          <div className="stat-label">🔥 Most Common</div>
          <div className="stat-value-small">{analytics.mostCommonCategory}</div>
          <div className="stat-subtitle">Primary incident type</div>
        </div>

        <div className="stat-card prevention-card">
          <div className="stat-label">📈 Prevention Score</div>
          <div className="stat-value">
            {analytics.totalIncidents > 0 
              ? Math.round(((analytics.totalIncidents - analytics.criticalCount) / analytics.totalIncidents) * 100) 
              : 0}%
          </div>
          <div className="stat-subtitle">Non-critical ratio</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        <div className="chart-container">
          <h2 className="chart-title">📑 Incident Categories</h2>
          {analytics.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No data available</div>
          )}
        </div>

        <div className="chart-container">
          <h2 className="chart-title">⚡ Severity Breakdown</h2>
          {analytics.severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {analytics.severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No data available</div>
          )}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="recent-incidents-container">
        <h2 className="chart-title">📰 Recent Incident Reports</h2>
        {analytics.recentIncidents.length > 0 ? (
          <div className="incidents-list">
            {analytics.recentIncidents.map((incident, index) => (
              <div key={index} className="incident-item">
                <div className="incident-header">
                  <div className="incident-text">{incident.text.substring(0, 60)}...</div>
                  <span className={`severity-badge severity-${incident.severity?.toLowerCase()}`}>
                    {incident.severity}
                  </span>
                </div>
                <div className="incident-meta">
                  <div className="categories">
                    {incident.categories && incident.categories.map((cat, idx) => (
                      <span key={idx} className="category-tag">{cat}</span>
                    ))}
                  </div>
                  <div className="timestamp">
                    {new Date(incident.timestamp).toLocaleDateString()} {new Date(incident.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No incidents recorded yet. Start analyzing incidents to populate the dashboard!</div>
        )}
      </div>
    </div>
  );
};

export default IncidentDashboard;
