// incidentAnalyzer.js - Core analyzer service for incident categorization and severity detection
// Implements keyword-based ML-style analysis for incident management

/**
 * Analyzes incident text and returns categorization, severity, and suggested actions
 * @param {string} text - The incident description text
 * @returns {object} Analysis result with categories, severity, and actions
 */
export const analyzeIncidentText = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      categories: [],
      severity: 'unknown',
      suggestedActions: ['Please provide a valid incident description'],
      confidence: 0
    };
  }

  const lowerText = text.toLowerCase();

  // Multi-label categorization based on keywords
  const categories = detectCategories(lowerText);

  // Severity detection
  const severity = detectSeverity(lowerText, categories);

  // Generate suggested actions based on categories and severity
  const suggestedActions = generateSuggestedActions(categories, severity);

  // Calculate confidence based on keyword matches
  const confidence = calculateConfidence(lowerText, categories);

  return {
    categories,
    severity,
    suggestedActions,
    confidence,
    timestamp: new Date().toISOString()
  };
};

/**
 * Detects multiple categories from incident text
 * @param {string} text - Lowercase incident text
 * @returns {string[]} Array of detected categories
 */
const detectCategories = (text) => {
  const categories = [];

  // Accident categories
  if (text.includes('accident') || text.includes('collision') || text.includes('crash')) {
    categories.push('accident');
  }

  // Medical categories
  if (text.includes('medical') || text.includes('emergency') || text.includes('injury') ||
      text.includes('ambulance') || text.includes('hospital')) {
    categories.push('medical');
  }

  // Traffic categories
  if (text.includes('traffic') || text.includes('road') || text.includes('highway') ||
      text.includes('vehicle') || text.includes('car')) {
    categories.push('traffic');
  }

  // Weather categories
  if (text.includes('weather') || text.includes('rain') || text.includes('snow') ||
      text.includes('storm') || text.includes('fog')) {
    categories.push('weather');
  }

  // Infrastructure categories
  if (text.includes('bridge') || text.includes('roadwork') || text.includes('construction') ||
      text.includes('pothole') || text.includes('sign')) {
    categories.push('infrastructure');
  }

  // Default category if none detected
  if (categories.length === 0) {
    categories.push('general');
  }

  return categories;
};

/**
 * Detects severity level based on text and categories
 * @param {string} text - Lowercase incident text
 * @param {string[]} categories - Detected categories
 * @returns {string} Severity level: 'low', 'medium', 'high', 'critical'
 */
const detectSeverity = (text, categories) => {
  let severityScore = 0;

  // Keywords indicating high severity
  const highSeverityKeywords = ['fatal', 'death', 'deadly', 'multiple', 'massive', 'major', 'severe'];
  const mediumSeverityKeywords = ['injury', 'damage', 'delay', 'disruption', 'hazard'];
  const lowSeverityKeywords = ['minor', 'small', 'light'];

  // Check for high severity keywords
  if (highSeverityKeywords.some(keyword => text.includes(keyword))) {
    severityScore += 3;
  }

  // Check for medium severity keywords
  if (mediumSeverityKeywords.some(keyword => text.includes(keyword))) {
    severityScore += 2;
  }

  // Check for low severity keywords
  if (lowSeverityKeywords.some(keyword => text.includes(keyword))) {
    severityScore += 1;
  }

  // Category-based severity adjustment
  if (categories.includes('medical')) {
    severityScore += 2;
  }
  if (categories.includes('accident')) {
    severityScore += 1;
  }

  // Determine severity level
  if (severityScore >= 5) return 'critical';
  if (severityScore >= 3) return 'high';
  if (severityScore >= 1) return 'medium';
  return 'low';
};

/**
 * Generates suggested actions based on categories and severity
 * @param {string[]} categories - Detected categories
 * @param {string} severity - Severity level
 * @returns {string[]} Array of suggested actions
 */
const generateSuggestedActions = (categories, severity) => {
  const actions = [];

  // Base actions for all incidents
  actions.push('Document incident details and location');

  // Category-specific actions
  if (categories.includes('accident')) {
    actions.push('Contact emergency services if injuries reported');
    actions.push('Secure the accident scene');
  }

  if (categories.includes('medical')) {
    actions.push('Dispatch medical assistance immediately');
    actions.push('Clear path for emergency vehicles');
  }

  if (categories.includes('traffic')) {
    actions.push('Implement traffic control measures');
    actions.push('Update traffic management systems');
  }

  if (categories.includes('weather')) {
    actions.push('Monitor weather conditions');
    actions.push('Prepare for potential escalation');
  }

  // Severity-specific actions
  if (severity === 'critical') {
    actions.push('Activate emergency response protocol');
    actions.push('Notify all relevant authorities');
    actions.push('Establish incident command center');
  } else if (severity === 'high') {
    actions.push('Escalate to incident management team');
    actions.push('Increase monitoring frequency');
  } else if (severity === 'medium') {
    actions.push('Monitor incident development');
    actions.push('Prepare contingency plans');
  }

  return actions;
};

/**
 * Calculates confidence score based on keyword matches
 * @param {string} text - Lowercase incident text
 * @param {string[]} categories - Detected categories
 * @returns {number} Confidence score between 0 and 1
 */
const calculateConfidence = (text, categories) => {
  let matchCount = 0;
  let totalKeywords = 0;

  // Define keyword sets for each category
  const keywordSets = {
    accident: ['accident', 'collision', 'crash', 'impact'],
    medical: ['medical', 'emergency', 'injury', 'ambulance', 'hospital'],
    traffic: ['traffic', 'road', 'highway', 'vehicle', 'car'],
    weather: ['weather', 'rain', 'snow', 'storm', 'fog'],
    infrastructure: ['bridge', 'roadwork', 'construction', 'pothole', 'sign'],
    general: ['incident', 'report', 'issue']
  };

  // Count matches for detected categories
  categories.forEach(category => {
    const keywords = keywordSets[category] || [];
    totalKeywords += keywords.length;
    matchCount += keywords.filter(keyword => text.includes(keyword)).length;
  });

  // Calculate confidence
  if (totalKeywords === 0) return 0;
  return Math.min(matchCount / totalKeywords, 1);
};