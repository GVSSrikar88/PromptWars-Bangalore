import { generateSystemPrompt, parseGeminiResponse } from '../utils/triage';

describe('Triage Utility Functions', () => {
  it('should generate a system prompt including the provided text', () => {
    const inputText = 'urgent car crash at mile 9';
    const prompt = generateSystemPrompt(inputText);
    expect(prompt).toContain(inputText);
    expect(prompt).toContain('VitalBridge');
    expect(prompt).toContain('assigned_agent');
  });

  it('should parse valid JSON from a raw codeblock response', () => {
    const rawResponse = `
    \`\`\`json
    {
      "assigned_agent": "Emergency Agent",
      "scenario_type": "Car Accident",
      "risk_assessment": "Critical",
      "extracted_entities": {
         "Location": "Mile 9"
      },
      "action_plan": [
        { "step": "Dispatch Ambulance", "is_urgent": true }
      ]
    }
    \`\`\`
    `;

    const parsed = parseGeminiResponse(rawResponse);
    expect(parsed.assigned_agent).toBe('Emergency Agent');
    expect(parsed.scenario_type).toBe('Car Accident');
    expect(parsed.risk_assessment).toBe('Critical');
    expect(parsed.action_plan[0].is_urgent).toBe(true);
  });

  it('should parse valid JSON from an unformatted string', () => {
     const rawResponse = `{
      "assigned_agent": "Medical Agent",
      "scenario_type": "Medical",
      "risk_assessment": "Low",
      "extracted_entities": {},
      "action_plan": []
    }`;

    const parsed = parseGeminiResponse(rawResponse);
    expect(parsed.assigned_agent).toBe('Medical Agent');
    expect(parsed.scenario_type).toBe('Medical');
    expect(parsed.risk_assessment).toBe('Low');
  });

  it('should throw an error if parsing fails', () => {
    const invalidResponse = `This is not JSON`;
    expect(() => parseGeminiResponse(invalidResponse)).toThrow('Failed to parse AI response into actionable structure.');
  });
});

