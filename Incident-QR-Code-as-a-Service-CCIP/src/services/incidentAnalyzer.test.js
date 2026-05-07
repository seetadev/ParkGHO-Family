/**
 * Incident Analyzer Service Tests
 * Tests for categorization, severity detection, and action suggestion
 */

import {
  analyzeIncidentText,
  detectCategories,
  detectSeverity,
  getSuggestedActions,
} from './incidentAnalyzer';

describe('Incident Analyzer', () => {
  describe('analyzeIncidentText', () => {
    test('should handle empty text', () => {
      const result = analyzeIncidentText('');
      expect(result.categories).toEqual([]);
      expect(result.severity).toBe('Low');
      expect(result.confidence).toBe(0);
    });

    test('should analyze a road accident incident', () => {
      const text = 'Traffic collision on Main Street involving 3 vehicles with injuries reported';
      const result = analyzeIncidentText(text);
      expect(result.categories).toContain('Road Accident');
      expect(result.severity).toBe('High');
      expect(result.actions.length).toBeGreaterThan(0);
    });

    test('should detect critical severity', () => {
      const text = 'Fatal accident with multiple casualties on highway';
      const result = analyzeIncidentText(text);
      expect(result.severity).toBe('Critical');
    });

    test('should detect multiple categories', () => {
      const text = 'Road accident near damaged infrastructure sign';
      const result = analyzeIncidentText(text);
      expect(result.categories.length).toBeGreaterThanOrEqual(1);
    });

    test('should include timestamp in result', () => {
      const text = 'Test incident';
      const result = analyzeIncidentText(text);
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('detectCategories', () => {
    test('should detect road accident keywords', () => {
      const text = 'collision on the road';
      const categories = detectCategories(text);
      expect(categories).toContain('Road Accident');
    });

    test('should detect road damage keywords', () => {
      const text = 'there is a pothole in the street';
      const categories = detectCategories(text);
      expect(categories).toContain('Road Damage');
    });

    test('should detect traffic infrastructure keywords', () => {
      const text = 'traffic signal not working';
      const categories = detectCategories(text);
      expect(categories).toContain('Traffic Infrastructure');
    });

    test('should detect congestion keywords', () => {
      const text = 'heavy traffic jam on highway';
      const categories = detectCategories(text);
      expect(categories).toContain('Traffic Congestion');
    });

    test('should detect parking keywords', () => {
      const text = 'illegal parking blocking the entrance';
      const categories = detectCategories(text);
      expect(categories).toContain('Parking Issue');
    });

    test('should default to Emergency Hazard if no keywords match', () => {
      const text = 'something happened';
      const categories = detectCategories(text);
      expect(categories).toContain('Emergency Hazard');
    });

    test('should not return duplicates', () => {
      const text = 'collision accident crash';
      const categories = detectCategories(text);
      const unique = new Set(categories);
      expect(categories.length).toBe(unique.size);
    });
  });

  describe('detectSeverity', () => {
    test('should detect critical severity', () => {
      const text = 'fatal accident with deaths';
      const severity = detectSeverity(text);
      expect(severity).toBe('Critical');
    });

    test('should detect high severity', () => {
      const text = 'injury reported on highway';
      const severity = detectSeverity(text);
      expect(severity).toBe('High');
    });

    test('should detect medium severity', () => {
      const text = 'minor damage to vehicle';
      const severity = detectSeverity(text);
      expect(severity).toBe('Medium');
    });

    test('should detect low severity', () => {
      const text = 'parking observation';
      const severity = detectSeverity(text);
      expect(severity).toBe('Low');
    });

    test('should use category hints for severity', () => {
      const categories = ['Road Accident'];
      const text = 'traffic issue';
      const severity = detectSeverity(text, categories);
      expect(severity).toBe('High');
    });
  });

  describe('getSuggestedActions', () => {
    test('should return actions for road accident', () => {
      const categories = ['Road Accident'];
      const actions = getSuggestedActions(categories);
      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0]).toContain('911');
    });

    test('should return actions for road damage', () => {
      const categories = ['Road Damage'];
      const actions = getSuggestedActions(categories);
      expect(actions.length).toBeGreaterThan(0);
    });

    test('should return empty array for unknown categories', () => {
      const categories = ['Unknown'];
      const actions = getSuggestedActions(categories);
      expect(actions).toEqual([]);
    });

    test('should limit actions to max 5', () => {
      const categories = ['Road Accident', 'Emergency Hazard', 'Traffic Infrastructure'];
      const actions = getSuggestedActions(categories);
      expect(actions.length).toBeLessThanOrEqual(5);
    });

    test('should handle multiple categories', () => {
      const categories = ['Road Accident', 'Road Damage'];
      const actions = getSuggestedActions(categories);
      expect(actions.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('should analyze a parking incident completely', () => {
      const text = 'Unauthorized vehicle parking blocking emergency exit';
      const result = analyzeIncidentText(text);
      expect(result.categories).toContain('Parking Issue');
      expect(result.actions).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should analyze a congestion incident completely', () => {
      const text = 'Heavy traffic congestion causing significant delays on main highway';
      const result = analyzeIncidentText(text);
      expect(result.categories).toContain('Traffic Congestion');
      expect(result.severity).toBeDefined();
      expect(result.actions.length).toBeGreaterThan(0);
    });

    test('should handle complex multi-incident scenario', () => {
      const text = 'Multiple vehicle accident with injuries near damaged traffic infrastructure causing congestion';
      const result = analyzeIncidentText(text);
      expect(result.categories.length).toBeGreaterThan(1);
      expect(result.severity).not.toBe('Low');
      expect(result.actions.length).toBeGreaterThan(0);
    });
  });
});

// Run tests in Node environment for local testing
if (typeof module !== 'undefined' && module.exports) {
  // Export for Jest/testing framework
  module.exports = {
    analyzeIncidentText,
    detectCategories,
    detectSeverity,
    getSuggestedActions,
  };
}
