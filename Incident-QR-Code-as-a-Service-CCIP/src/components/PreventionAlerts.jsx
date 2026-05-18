import React, { useMemo } from 'react';
import {
  detectDuplicateIncidents,
  detectRiskZones,
  detectSeverityEscalation,
  generatePreventionRecommendations,
} from '../services/preventionAnalyzer';
import '../styles/PreventionAlerts.css';

const PreventionAlerts = ({ incidentHistory = [] }) => {
  const alerts = useMemo(() => {
    if (!incidentHistory || incidentHistory.length === 0) {
      return {
        duplicateAlerts: [],
        riskZoneAlerts: [],
        escalationAlerts: [],
        recommendations: [],
        totalAlerts: 0,
        criticalCount: 0,
      };
    }

    // Analyze for prevention issues
    const riskZones = detectRiskZones(incidentHistory, 60);
    const escalation = detectSeverityEscalation(incidentHistory, 120);
    const recommendations = generatePreventionRecommendations(incidentHistory);

    // Count critical alerts
    let criticalCount = 0;
    if (riskZones.alertLevel === 'critical') criticalCount++;
    if (escalation.alertLevel === 'critical') criticalCount++;
    criticalCount += recommendations.filter(r => r.priority === 'critical').length;

    return {
      duplicateAlerts: [],
      riskZoneAlerts: riskZones.riskZones,
      escalationAlerts: escalation.escalationPatterns,
      recommendations,
      totalAlerts: riskZones.riskZones.length + escalation.escalationPatterns.length + recommendations.length,
      criticalCount,
      riskZoneAlertLevel: riskZones.alertLevel,
      escalationAlertLevel: escalation.alertLevel,
    };
  }, [incidentHistory]);

  if (!alerts.totalAlerts) {
    return (
      <div className="prevention-alerts">
        <div className="no-alerts">
          ✅ No active prevention alerts. System operating normally.
        </div>
      </div>
    );
  }

  return (
    <div className="prevention-alerts">
      {/* Alert Summary */}
      <div className={`alert-summary alert-summary-${alerts.criticalCount > 0 ? 'critical' : 'warning'}`}>
        <div className="summary-header">
          <span className="summary-title">🚨 Prevention Alerts</span>
          <span className="alert-badge">{alerts.totalAlerts} {alerts.totalAlerts === 1 ? 'Alert' : 'Alerts'}</span>
        </div>
        {alerts.criticalCount > 0 && (
          <div className="critical-warning">
            ⚠️ {alerts.criticalCount} CRITICAL alert{alerts.criticalCount > 1 ? 's' : ''} require immediate attention!
          </div>
        )}
      </div>

      {/* Risk Zone Alerts */}
      {alerts.riskZoneAlerts.length > 0 && (
        <div className="alert-section">
          <h3 className="alert-section-title">🔥 High-Risk Zones Detected</h3>
          <div className="alert-list">
            {alerts.riskZoneAlerts.map((zone, idx) => (
              <div key={idx} className={`alert-item alert-item-${zone.severity}`}>
                <div className="alert-header">
                  <span className="alert-type">Risk Zone</span>
                  <span className="alert-score">Risk: {zone.riskScore}%</span>
                </div>
                <p className="alert-title">{zone.name}</p>
                <p className="alert-message">
                  {zone.incidentCount} incident{zone.incidentCount > 1 ? 's' : ''} detected in this category.
                  Increase monitoring and implement targeted prevention measures.
                </p>
                <div className="alert-action">→ Deploy additional resources to this area</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Severity Escalation Alerts */}
      {alerts.escalationAlerts.length > 0 && (
        <div className="alert-section">
          <h3 className="alert-section-title">📈 Severity Escalation Detected</h3>
          <div className="alert-list">
            {alerts.escalationAlerts.map((pattern, idx) => (
              <div key={idx} className={`alert-item alert-item-${pattern.alertLevel}`}>
                <div className="alert-header">
                  <span className="alert-type">Escalation Warning</span>
                  <span className="alert-score">Risk: {pattern.riskScore}%</span>
                </div>
                <p className="alert-title">
                  {pattern.category ? `${pattern.category}: ` : ''}
                  Severity Escalating from {pattern.fromSeverity} to {pattern.toSeverity}
                </p>
                <p className="alert-message">
                  {pattern.escalationSteps} escalation step{pattern.escalationSteps > 1 ? 's' : ''} detected across {pattern.incidentCount} incident{pattern.incidentCount > 1 ? 's' : ''}.
                  This pattern indicates deteriorating conditions.
                </p>
                <div className="alert-action">→ Investigate root causes and implement preventive measures immediately</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {alerts.recommendations.length > 0 && (
        <div className="alert-section">
          <h3 className="alert-section-title">💡 Prevention Recommendations</h3>
          <div className="recommendation-list">
            {alerts.recommendations.map((rec, idx) => (
              <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                <div className="recommendation-header">
                  <span className="priority-badge">{rec.priority.toUpperCase()}</span>
                  <span className="recommendation-title">{rec.title}</span>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                <div className="recommendation-action">
                  ✓ Recommended Action: {rec.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Statistics */}
      <div className="alert-stats">
        <div className="stat-item">
          <span className="stat-label">Total Incidents</span>
          <span className="stat-value">{incidentHistory.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Alerts</span>
          <span className="stat-value" style={{ color: alerts.criticalCount > 0 ? '#ef4444' : '#f97316' }}>
            {alerts.totalAlerts}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Risk Level</span>
          <span className={`stat-value risk-level-${alerts.criticalCount > 0 ? 'critical' : (alerts.totalAlerts > 0 ? 'high' : 'low')}`}>
            {alerts.criticalCount > 0 ? 'CRITICAL' : (alerts.totalAlerts > 0 ? 'HIGH' : 'LOW')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PreventionAlerts;
