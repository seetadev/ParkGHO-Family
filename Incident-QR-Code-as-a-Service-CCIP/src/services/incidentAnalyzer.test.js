import assert from "node:assert/strict";
import { analyzeIncidentText } from "./incidentAnalyzer.js";

const cases = [
  {
    input: "Minor parking violation near shopping mall",
    expected: {
      categories: ["Parking Issue"],
      severity: "Low",
      suggestedAction: "Record the violation and enforce parking regulations as needed.",
    },
  },
  {
    input: "Explosion after fuel truck collision on the highway",
    expected: {
      categories: ["Road Accident", "Emergency Hazard"],
      severity: "Critical",
      suggestedAction:
        "Notify emergency services and reroute traffic where possible. Evacuate the area, secure the scene, and contact emergency responders.",
    },
  },
  {
    input: "Heavy traffic due to broken signal and potholes",
    expected: {
      categories: ["Road Damage", "Traffic Infrastructure", "Traffic Congestion"],
      severity: "Medium",
      suggestedAction:
        "Dispatch the road maintenance team and inspect the damaged area. Alert city traffic management authority and repair the signal issue. Update route notifications and coordinate traffic flow control.",
    },
  },
  {
    input: "The street light is out and cars are backed up at the intersection",
    expected: {
      categories: ["Traffic Infrastructure", "Traffic Congestion"],
      severity: "Medium",
      suggestedAction:
        "Alert city traffic management authority and repair the signal issue. Update route notifications and coordinate traffic flow control.",
    },
  },
  {
    input: "The shop was broken into and the storefront was vandalized",
    expected: {
      categories: ["General Incident"],
      severity: "Medium",
      suggestedAction: "Review the incident report and follow up with the relevant team.",
    },
  },
];

cases.forEach(({ input, expected }, index) => {
  const result = analyzeIncidentText(input);
  try {
    assert.deepStrictEqual(result.categories, expected.categories);
    assert.strictEqual(result.severity, expected.severity);
    assert.strictEqual(result.suggestedAction, expected.suggestedAction);
  } catch (error) {
    console.error(`Test case ${index + 1} failed for input: ${input}`);
    console.error("Expected:", expected);
    console.error("Received:", result);
    throw error;
  }
});

console.log("All incident analyzer tests passed.");
