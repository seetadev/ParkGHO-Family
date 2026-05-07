export const DEFAULT_CATEGORY = "General Incident";
export const DEFAULT_SEVERITY = "Medium";
export const DEFAULT_ACTION = "Review the incident report and follow up with the relevant team.";

const categoryRules = [
  { category: "Road Accident", regex: /collision|crash|accident|hit|rear-ended|t-boned|pileup|rollover/ },
  { category: "Road Damage", regex: /pothole|damaged road|uneven road|broken road|road surface|road damage/ },
  { category: "Traffic Infrastructure", regex: /traffic signal|signal failure|signal issue|traffic light|street light|streetlight|light (?:is )?out|red light|green light|yellow light|broken signal|signal/ },
  { category: "Traffic Congestion", regex: /congestion|traffic jam|gridlock|heavy traffic|blocked lane|obstruction|roadblock|backed up|backed-up/ },
  { category: "Parking Issue", regex: /parking violation|illegal parking|double parked|blocked parking/ },
  { category: "Emergency Hazard", regex: /fire|smoke|explosion|hazardous materials/ },
];

const severityRules = [
  { severity: "Critical", regex: /death|fatal|killed|severe injury|multiple injuries|explosion|fire|hospitalized/ },
  { severity: "High", regex: /collision|crash|accident|injury|hurt|wounded|highway|major incident/ },
  { severity: "Medium", regex: /pothole|damaged road|congestion|traffic jam|gridlock|blocked lane|road damage/ },
  { severity: "Low", regex: /signal issue|traffic signal|parking violation|illegal parking|double parked|minor incident/ },
];

const suggestedActionMap = {
  "Road Accident": "Notify emergency services and reroute traffic where possible.",
  "Road Damage": "Dispatch the road maintenance team and inspect the damaged area.",
  "Traffic Infrastructure": "Alert city traffic management authority and repair the signal issue.",
  "Traffic Congestion": "Update route notifications and coordinate traffic flow control.",
  "Parking Issue": "Record the violation and enforce parking regulations as needed.",
  "Emergency Hazard": "Evacuate the area, secure the scene, and contact emergency responders.",
  [DEFAULT_CATEGORY]: DEFAULT_ACTION,
};

export const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const getLocalSummary = (text) => {
  const normalized = text.trim().replace(/\s+/g, " ");
  const sentences = normalized.split(/(?<=\.|\?|!)\s+/);
  if (sentences.length <= 2) return normalized;
  return sentences.slice(0, 2).join(" ");
};

export const detectCategories = (text) => {
  const lowerText = text.toLowerCase();
  const categories = [];

  categoryRules.forEach((rule) => {
    if (rule.regex.test(lowerText) && !categories.includes(rule.category)) {
      categories.push(rule.category);
    }
  });

  return categories.length ? categories : [DEFAULT_CATEGORY];
};

export const detectSeverity = (text) => {
  const lowerText = text.toLowerCase();
  let highestSeverity = null;

  const severityOrder = ["Low", "Medium", "High", "Critical"];
  const getSeverityRank = (severity) => severityOrder.indexOf(severity);

  severityRules.forEach((rule) => {
    if (rule.regex.test(lowerText)) {
      if (!highestSeverity || getSeverityRank(rule.severity) > getSeverityRank(highestSeverity)) {
        highestSeverity = rule.severity;
      }
    }
  });

  return highestSeverity || DEFAULT_SEVERITY;
};

export const getSuggestedAction = (categories) => {
  const actions = categories
    .map((category) => suggestedActionMap[category] || DEFAULT_ACTION)
    .filter((action, index, self) => self.indexOf(action) === index);

  return actions.length ? actions.join(" ") : DEFAULT_ACTION;
};

export const analyzeIncidentText = (text) => {
  const categories = detectCategories(text);
  const severity = detectSeverity(text);
  const suggestedAction = getSuggestedAction(categories);

  return {
    categories,
    severity,
    suggestedAction,
  };
};
