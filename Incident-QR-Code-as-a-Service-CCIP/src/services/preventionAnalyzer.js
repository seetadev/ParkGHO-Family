/**
 * Prevention Analyzer Service
 * Provides incident prevention capabilities:
 * - Duplicate incident detection to prevent spam
 * - Risk zone detection for hotspot identification
 * - Severity escalation alerts for critical patterns
 */

/**
 * Detect duplicate or similar incidents
 * @param {object} newIncident - The new incident to check
 * @param {array} incidentHistory - Array of previous incidents
 * @param {number} similarityThreshold - Threshold for similarity (0-100)
 * @returns {object} - Duplicate analysis result
 */
export const detectDuplicateIncidents = (newIncident, incidentHistory = [], similarityThreshold = 70) => {
  if (!newIncident || !incidentHistory || incidentHistory.length === 0) {
    return {
      isDuplicate: false,
      similarIncidents: [],
      similarity: 0,
      alertLevel: 'none',
    };
  }

  const similars = [];

  for (const historic of incidentHistory) {
    const similarity = calculateTextSimilarity(newIncident.text, historic.text);
    const categorySimilarity = calculateCategorySimilarity(newIncident.categories, historic.categories);
    
    // Weighted average: 60% text, 40% category
    const overallSimilarity = (similarity * 0.6) + (categorySimilarity * 0.4);

    if (overallSimilarity >= similarityThreshold) {
      similars.push({
        incident: historic,
        similarity: Math.round(overallSimilarity),
        timeDifference: getTimeDifference(newIncident.timestamp, historic.timestamp),
      });
    }
  }

  const isDuplicate = similars.length > 0;
  const maxSimilarity = similars.length > 0 ? Math.max(...similars.map(s => s.similarity)) : 0;

  return {
    isDuplicate,
    similarIncidents: similars.slice(0, 3), // Top 3 similar incidents
    similarity: maxSimilarity,
    alertLevel: isDuplicate ? (maxSimilarity > 85 ? 'high' : 'medium') : 'none',
  };
};

/**
 * Detect high-risk zones based on incident clustering
 * @param {array} incidentHistory - Array of incidents
 * @param {number} timeWindowMinutes - Time window to check (default: 60)
 * @returns {object} - Risk zone analysis
 */
export const detectRiskZones = (incidentHistory = [], timeWindowMinutes = 60) => {
  if (!incidentHistory || incidentHistory.length < 2) {
    return {
      riskZones: [],
      hasRiskZones: false,
      alertLevel: 'none',
    };
  }

  const categoryCount = {};
  const severityCount = {};
  const recentIncidents = [];
  const now = new Date();

  // Count incidents in the time window
  incidentHistory.forEach(incident => {
    const incidentTime = new Date(incident.timestamp);
    const minutesDiff = (now - incidentTime) / (1000 * 60);

    if (minutesDiff <= timeWindowMinutes) {
      recentIncidents.push(incident);

      // Count by category
      if (incident.categories) {
        incident.categories.forEach(cat => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      }

      // Count by severity
      const severity = incident.severity || 'Low';
      severityCount[severity] = (severityCount[severity] || 0) + 1;
    }
  });

  // Identify risk zones
  const riskZones = [];
  const threshold = Math.ceil(recentIncidents.length / 2); // More than half

  // Category-based risk zones
  for (const [category, count] of Object.entries(categoryCount)) {
    if (count >= threshold) {
      riskZones.push({
        type: 'category_cluster',
        name: `${category} - High Frequency`,
        category,
        incidentCount: count,
        riskScore: Math.min(100, (count / recentIncidents.length) * 100),
        severity: 'high',
      });
    }
  }

  // Severity-based risk zones
  const criticalCount = severityCount['Critical'] || 0;
  const highCount = severityCount['High'] || 0;
  
  if (criticalCount > 0) {
    riskZones.push({
      type: 'critical_cluster',
      name: 'Critical Incidents Cluster',
      severity: 'critical',
      incidentCount: criticalCount,
      riskScore: 100,
    });
  }

  if (highCount >= threshold) {
    riskZones.push({
      type: 'severity_cluster',
      name: 'High Severity Incidents - Elevated Risk',
      severity: 'high',
      incidentCount: highCount,
      riskScore: Math.min(100, (highCount / recentIncidents.length) * 100),
    });
  }

  // Sort by risk score
  riskZones.sort((a, b) => b.riskScore - a.riskScore);

  const hasRiskZones = riskZones.length > 0;
  const maxRiskScore = riskZones.length > 0 ? Math.max(...riskZones.map(z => z.riskScore)) : 0;
  const alertLevel = maxRiskScore >= 80 ? 'critical' : (hasRiskZones ? 'high' : 'none');

  return {
    riskZones: riskZones.slice(0, 5), // Top 5 risk zones
    hasRiskZones,
    alertLevel,
    timeWindow: timeWindowMinutes,
    incidentsInWindow: recentIncidents.length,
  };
};

/**
 * Detect severity escalation patterns
 * @param {array} incidentHistory - Array of incidents
 * @param {number} timeWindowMinutes - Time window to check (default: 120)
 * @returns {object} - Escalation analysis
 */
export const detectSeverityEscalation = (incidentHistory = [], timeWindowMinutes = 120) => {
  if (!incidentHistory || incidentHistory.length < 2) {
    return {
      escalationPatterns: [],
      hasEscalation: false,
      alertLevel: 'none',
    };
  }

  const patterns = [];
  const severityLevels = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  const now = new Date();

  // Get recent incidents sorted by time
  const recentIncidents = incidentHistory
    .filter(inc => {
      const minutesDiff = (now - new Date(inc.timestamp)) / (1000 * 60);
      return minutesDiff <= timeWindowMinutes;
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Check for severity escalation by category
  const categorySequences = {};

  recentIncidents.forEach(incident => {
    if (incident.categories) {
      incident.categories.forEach(cat => {
        if (!categorySequences[cat]) {
          categorySequences[cat] = [];
        }
        categorySequences[cat].push({
          severity: incident.severity || 'Low',
          severityLevel: severityLevels[incident.severity || 'Low'] || 1,
          timestamp: incident.timestamp,
        });
      });
    }
  });

  // Analyze each category for escalation
  for (const [category, sequence] of Object.entries(categorySequences)) {
    if (sequence.length >= 2) {
      // Check if severity is increasing
      let isEscalating = false;
      let escalationSteps = 0;
      let maxSeverity = sequence[0].severityLevel;

      for (let i = 1; i < sequence.length; i++) {
        if (sequence[i].severityLevel > maxSeverity) {
          isEscalating = true;
          escalationSteps++;
          maxSeverity = sequence[i].severityLevel;
        }
      }

      if (isEscalating && escalationSteps >= 1) {
        patterns.push({
          category,
          escalationSteps,
          fromSeverity: sequence[0].severity,
          toSeverity: sequence[sequence.length - 1].severity,
          incidentCount: sequence.length,
          riskScore: Math.min(100, escalationSteps * 25 + sequence.length * 15),
          alertLevel: escalationSteps >= 2 ? 'critical' : 'high',
        });
      }
    }
  }

  // Check for rapid critical incidents
  const criticalIncidents = recentIncidents.filter(inc => inc.severity === 'Critical');
  if (criticalIncidents.length >= 2) {
    patterns.push({
      type: 'critical_repetition',
      description: 'Multiple critical incidents in short timeframe',
      incidentCount: criticalIncidents.length,
      riskScore: 95,
      alertLevel: 'critical',
    });
  }

  patterns.sort((a, b) => b.riskScore - a.riskScore);

  const hasEscalation = patterns.length > 0;
  const maxRiskScore = patterns.length > 0 ? Math.max(...patterns.map(p => p.riskScore)) : 0;
  const alertLevel = maxRiskScore >= 90 ? 'critical' : (hasEscalation ? 'high' : 'none');

  return {
    escalationPatterns: patterns.slice(0, 3), // Top 3 patterns
    hasEscalation,
    alertLevel,
    timeWindow: timeWindowMinutes,
    totalIncidentsInWindow: recentIncidents.length,
  };
};

/**
 * Generate prevention recommendations based on incidents
 * @param {object} incidentHistory - Array of incidents
 * @returns {array} - Array of recommendations
 */
export const generatePreventionRecommendations = (incidentHistory = []) => {
  const recommendations = [];

  if (!incidentHistory || incidentHistory.length === 0) {
    return recommendations;
  }

  // Check for high-risk zones
  const riskZones = detectRiskZones(incidentHistory);
  if (riskZones.hasRiskZones) {
    riskZones.riskZones.forEach(zone => {
      recommendations.push({
        type: 'risk_zone',
        priority: zone.riskScore > 80 ? 'high' : 'medium',
        title: `High-Risk Zone Detected: ${zone.name}`,
        description: `${zone.incidentCount} incidents detected. Increase monitoring and prevention measures.`,
        action: 'Deploy additional resources',
        riskScore: zone.riskScore,
      });
    });
  }

  // Check for escalation patterns
  const escalation = detectSeverityEscalation(incidentHistory);
  if (escalation.hasEscalation) {
    escalation.escalationPatterns.forEach(pattern => {
      recommendations.push({
        type: 'escalation_warning',
        priority: pattern.alertLevel === 'critical' ? 'critical' : 'high',
        title: `Severity Escalation: ${pattern.category || 'Multiple Categories'}`,
        description: `Incidents are escalating from ${pattern.fromSeverity} to ${pattern.toSeverity}. Immediate intervention recommended.`,
        action: 'Review patterns and escalate response',
        riskScore: pattern.riskScore,
      });
    });
  }

  // General preventive measures
  const totalIncidents = incidentHistory.length;
  if (totalIncidents > 10) {
    recommendations.push({
      type: 'prevention_measure',
      priority: 'medium',
      title: 'Implement Preventive Measures',
      description: `${totalIncidents} incidents recorded. Consider implementing community awareness programs.`,
      action: 'Launch prevention campaign',
      riskScore: 40,
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.riskScore - a.riskScore;
  });

  return recommendations;
};

// Helper Functions

/**
 * Calculate text similarity using simple word overlap
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity percentage (0-100)
 */
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return (intersection.size / union.size) * 100;
};

/**
 * Calculate category similarity
 * @param {array} categories1 - First array of categories
 * @param {array} categories2 - Second array of categories
 * @returns {number} - Similarity percentage (0-100)
 */
const calculateCategorySimilarity = (categories1 = [], categories2 = []) => {
  if (!categories1 || !categories2 || categories1.length === 0 || categories2.length === 0) {
    return 0;
  }

  const set1 = new Set(categories1);
  const set2 = new Set(categories2);
  const intersection = new Set([...set1].filter(c => set2.has(c)));
  const union = new Set([...set1, ...set2]);

  return (intersection.size / union.size) * 100;
};

/**
 * Get human-readable time difference
 * @param {string} timestamp1 - First timestamp
 * @param {string} timestamp2 - Second timestamp
 * @returns {string} - Time difference description
 */
const getTimeDifference = (timestamp1, timestamp2) => {
  const time1 = new Date(timestamp1);
  const time2 = new Date(timestamp2);
  const diffMs = Math.abs(time1 - time2);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else {
    return `${diffDays} days ago`;
  }
};

export default {
  detectDuplicateIncidents,
  detectRiskZones,
  detectSeverityEscalation,
  generatePreventionRecommendations,
};
