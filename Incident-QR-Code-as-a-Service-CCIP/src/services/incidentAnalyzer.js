/**
 * Incident Analyzer Service
 * Provides AI/ML-like incident analysis including:
 * - Multi-label categorization
 * - Severity detection
 * - Suggested actions
 */

const INCIDENT_KEYWORDS = {
  'Road Accident': ['collision', 'accident', 'crash', 'hit', 'struck', 'impact', 'rear-end', 't-bone', 'rollover', 'multi-car', 'vehicle', 'vehicle accident'],
  'Road Damage': ['pothole', 'crack', 'pavement', 'asphalt', 'damage', 'broken', 'hole', 'patch', 'deterioration', 'road surface', 'broken road'],
  'Traffic Infrastructure': ['traffic light', 'signal', 'sign', 'marking', 'barrier', 'guardrail', 'pole', 'infrastructure', 'equipment', 'road infrastructure'],
  'Traffic Congestion': ['congestion', 'traffic jam', 'delay', 'slow', 'backed up', 'gridlock', 'rush hour', 'traffic', 'heavy traffic', 'bottleneck'],
  'Parking Issue': ['parking', 'parked', 'parking lot', 'spot', 'meter', 'violation', 'parking space', 'blocked', 'unauthorized'],
  'Emergency Hazard': ['hazard', 'emergency', 'fire', 'accident', 'danger', 'medical', 'ambulance', 'police', 'urgent', 'critical'],
};

const SEVERITY_KEYWORDS = {
  'Critical': ['fatal', 'death', 'severe', 'critical', 'life-threatening', 'emergency', 'immediate', 'urgent', 'multi-vehicle', 'multiple injuries'],
  'High': ['injury', 'injured', 'hurt', 'major', 'significant', 'serious', 'extensive damage', 'hospitalized', 'highway', 'multiple vehicles'],
  'Medium': ['minor', 'slight', 'moderate', 'damaged', 'affected', 'involved', 'reported', 'observed', 'slow traffic'],
  'Low': ['observation', 'noted', 'minor issue', 'slight', 'minimal', 'parking', 'inconvenience'],
};

const SUGGESTED_ACTIONS = {
  'Road Accident': [
    'Call 911 immediately if injuries present',
    'Move vehicles to safe location if possible',
    'Document scene with photos',
    'Exchange information with other parties',
    'Report to police for official record',
  ],
  'Road Damage': [
    'Mark area as hazardous if severe',
    'Report to local road authority',
    'Document with photos and location',
    'Avoid if possible - alternative routes',
    'Monitor for further deterioration',
  ],
  'Traffic Infrastructure': [
    'Report to traffic management authority',
    'Verify if equipment is functioning',
    'Check for visibility and safety',
    'Document the issue',
    'Monitor for public safety impact',
  ],
  'Traffic Congestion': [
    'Consider alternative routes',
    'Check for incidents causing congestion',
    'Plan travel during off-peak hours',
    'Monitor traffic updates',
    'Report unusual congestion patterns',
  ],
  'Parking Issue': [
    'Verify parking regulations',
    'Report unauthorized parking',
    'Check for disabled access violations',
    'Document issue location',
    'Contact parking enforcement if needed',
  ],
  'Emergency Hazard': [
    'Call 911 immediately',
    'Evacuate area if necessary',
    'Follow emergency protocols',
    'Alert nearby individuals',
    'Provide first aid if trained',
  ],
};

/**
 * Analyze incident text and return categorized data
 * @param {string} text - The incident description text
 * @returns {object} - Analysis results including categories, severity, and suggested actions
 */
export const analyzeIncidentText = (text) => {
  if (!text || text.trim().length === 0) {
    return {
      text,
      categories: [],
      severity: 'Low',
      actions: [],
      timestamp: new Date().toISOString(),
      confidence: 0,
    };
  }

  const lowerText = text.toLowerCase();

  // Detect categories
  const categories = detectCategories(lowerText);

  // Detect severity
  const severity = detectSeverity(lowerText, categories);

  // Get suggested actions
  const actions = getSuggestedActions(categories);

  // Calculate confidence (simplified metric)
  const confidence = Math.min(100, (categories.length * 30) + (severity === 'Low' ? 20 : 50));

  return {
    text: text.substring(0, 200), // Store first 200 chars
    categories,
    severity,
    actions,
    timestamp: new Date().toISOString(),
    confidence,
  };
};

/**
 * Detect multiple incident categories from text
 * @param {string} lowerText - Lowercased incident text
 * @returns {array} - Array of detected categories
 */
export const detectCategories = (lowerText) => {
  const detectedCategories = [];

  for (const [category, keywords] of Object.entries(INCIDENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        detectedCategories.push(category);
        break; // Move to next category once found
      }
    }
  }

  // Default category if nothing matched
  if (detectedCategories.length === 0) {
    detectedCategories.push('Emergency Hazard');
  }

  return [...new Set(detectedCategories)]; // Remove duplicates
};

/**
 * Detect severity level from text
 * @param {string} lowerText - Lowercased incident text
 * @param {array} categories - Detected categories
 * @returns {string} - Severity level: 'Critical', 'High', 'Medium', or 'Low'
 */
export const detectSeverity = (lowerText, categories = []) => {
  // Check for critical keywords
  for (const keyword of SEVERITY_KEYWORDS['Critical']) {
    if (lowerText.includes(keyword)) {
      return 'Critical';
    }
  }

  // Check for high-severity keywords
  for (const keyword of SEVERITY_KEYWORDS['High']) {
    if (lowerText.includes(keyword)) {
      return 'High';
    }
  }

  // Check for medium-severity keywords
  for (const keyword of SEVERITY_KEYWORDS['Medium']) {
    if (lowerText.includes(keyword)) {
      return 'Medium';
    }
  }

  // Default based on category
  if (categories.includes('Emergency Hazard') || categories.includes('Road Accident')) {
    return 'High';
  }

  return 'Low';
};

/**
 * Get suggested actions based on incident categories
 * @param {array} categories - Array of incident categories
 * @returns {array} - Suggested actions for the incident
 */
export const getSuggestedActions = (categories = []) => {
  const actions = new Set();

  for (const category of categories) {
    if (SUGGESTED_ACTIONS[category]) {
      SUGGESTED_ACTIONS[category].forEach(action => actions.add(action));
    }
  }

  return Array.from(actions).slice(0, 5); // Return top 5 actions
};

export default {
  analyzeIncidentText,
  detectCategories,
  detectSeverity,
  getSuggestedActions,
};
