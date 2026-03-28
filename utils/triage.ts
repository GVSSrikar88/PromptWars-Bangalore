/**
 * Represents the structured response from the VitalBridge AI.
 */
export type TriageResponse = {
    assigned_agent: "Environment Agent" | "Weather Agent" | "Finance Agent" | "Medical Agent" | "Emergency Agent";
    scenario_type: string;
    risk_assessment: "Critical" | "High" | "Medium" | "Low";
    key_contexts: string[];
    extracted_entities: {
        Location: string;
        People_Involved: string;
        Hazards: string;
    };
    action_plan: Array<{
        step: string;
        is_urgent: boolean;
    }>;
};

/**
 * Generates the system prompt for the Gemini model to perform triage.
 */
export function generateSystemPrompt(text: string): string {
    return `
You are VitalBridge, an advanced AI triage engine.
GOAL: Transform messy, unstructured emergency/incident input into verified, mission-critical data.

SYSTEM ROLES & ROUTING:
- ENVIRONMENT AGENT: Pollution, wildlife, spills, habitat disasters.
- WEATHER AGENT: Natural disasters, storms, floods, drought.
- FINANCE AGENT: Aid distribution, grants, insurance, relief funds.
- MEDICAL AGENT: Injuries, health crises, hospital triage.
- EMERGENCY AGENT: Fire, high-speed crashes, active life-threatening events.

INPUT DATA:
"${text}"

INSTRUCTIONS:
1. Identify the ONE specialized agent above that is best suited for this task.
2. Extract precisely 3-5 "key_contexts" (important trigger words or phrases like "sludge", "trapped", "heavy smoke") that were pivotal in your agent routing decision.
3. Assess the Risk Level based on immediate threat to life/environment.
4. Create a sequential Action Plan with boolean 'is_urgent' flags for each step.

RESPONSE FORMAT (Strict JSON Only):
{
  "assigned_agent": "Environment Agent | Weather Agent | Finance Agent | Medical Agent | Emergency Agent",
  "scenario_type": "string",
  "risk_assessment": "Critical | High | Medium | Low",
  "key_contexts": ["keyword1", "keyword2", "keyword3"],
  "extracted_entities": {
    "Location": "string or Not Specified",
    "People_Involved": "string or Not Specified",
    "Hazards": "string or None Detected"
  },
  "action_plan": [
    { "step": "Actionable command", "is_urgent": boolean }
  ]
}
`.trim();
}

/**
 * Parses and validates the Gemini AI response into a structured TriageResponse object.
 */
export function parseGeminiResponse(responseText: string): TriageResponse {
    try {
        // Robust JSON extraction: look for the first '{' and last '}'
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("No JSON object found in response");
        }
        
        const jsonStr = responseText.slice(firstBrace, lastBrace + 1);
        return JSON.parse(jsonStr) as TriageResponse;
    } catch (e) {
        console.error("AI Parse Error:", e, "Raw Content:", responseText);
        throw new Error("Failed to process AI response into mission-critical structure.");
    }
}
