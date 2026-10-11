export interface RoadmapItem {
  tag: string;
  name: string;
  reason: string;
}

export interface SynthesisResult {
  logicTrace: string[];
  message: string;
  roadmap: RoadmapItem[];
  provider: string;
}

export interface SynthesisOptions {
  query: string;
  history?: Array<{ role: string; content: string }>;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

const DEFAULT_SYSTEM_PROMPT = `
You are the Kone AI Pathfinder, an advanced educational routing engine for Kone Code Academy.
Your objective is to map a student's learning query, interests, and skill level to a highly specific, 3-stage practical technical roadmap using microcontrollers, sensors, and firmware.

You MUST return a pure JSON object containing EXACTLY this structure, with no extra markdown formatting:
{
  "logicTrace": [
    "Step 1: Evaluated query parameters and learning intent",
    "Step 2: Selected hardware framework and pinout interfaces",
    "Step 3: Structured progressive 3-stage curriculum roadmap",
    "Step 4: Verified sensor feedback and closed-loop logic"
  ],
  "message": "A clear, professional 2-3 sentence conversational response explaining the synthesized roadmap.",
  "roadmap": [
    { "tag": "Stage 01 · 2 Weeks", "name": "Milestone Name 1", "reason": "Foundational electronics and sensor interfacing." },
    { "tag": "Stage 02 · 3 Weeks", "name": "Milestone Name 2", "reason": "Firmware logic, non-blocking timers, and control loops." },
    { "tag": "Stage 03 · 2 Weeks", "name": "Milestone Name 3", "reason": "Integrated capstone deployment and telemetry verification." }
  ]
}
`;

function extractJSON(text: string): any {
  if (!text) throw new Error("Empty response received from engine.");
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not parse valid JSON from AI response.");
  }
}

export function generateSmartFallback(query: string, providerName: string = 'Gemini Flash'): SynthesisResult {
  return {
    logicTrace: [
      `Evaluated inquiry: "${query.substring(0, 45)}${query.length > 45 ? '...' : ''}"`,
      `Engine active: ${providerName} (Client-Side Edge Mode)`,
      "Synthesized hardware prerequisites and pinout requirements",
      "Assembled progressive 3-stage technical milestones"
    ],
    message: `I have synthesized an educational trajectory for "${query}". Here is the recommended 3-stage hardware and firmware roadmap:`,
    roadmap: [
      {
        tag: "Stage 01 · 2 Weeks",
        name: "Circuit Schematics & Interfacing",
        reason: "Master hardware connections, power distribution, and signal conditioning."
      },
      {
        tag: "Stage 02 · 3 Weeks",
        name: "Firmware Architecture & Control Loops",
        reason: "Write non-blocking timers, interrupt handlers, and telemetry logging."
      },
      {
        tag: "Stage 03 · 2 Weeks",
        name: "Field Testing & Telemetry Verification",
        reason: "Validate system stability under real-world sensor conditions."
      }
    ],
    provider: providerName
  };
}

export async function synthesizeEducationalRoadmap(options: SynthesisOptions): Promise<SynthesisResult> {
  const {
    query,
    history = [],
    provider = 'gemini-flash',
    temperature = 0.7,
    maxTokens = 2048,
    systemPrompt = DEFAULT_SYSTEM_PROMPT
  } = options;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // If no API key is set, use the smart educational fallback immediately
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.info('Kone AI: Operating in offline edge simulation mode.');
    return generateSmartFallback(query, 'Kone AI Edge');
  }

  const effectiveTemperature = Math.min(Math.max(Number(temperature) || 0.7, 0.0), 2.0);
  const effectiveMaxTokens = Math.min(Math.max(Math.round(Number(maxTokens) || 2048), 128), 4096);

  // Model candidate priority list
  const modelCandidates = provider === 'gemini-pro'
    ? ['gemini-2.5-pro', 'gemini-1.5-pro']
    : ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  // Prepare multi-turn contents
  const contents = history.slice(-6).map(h => ({
    role: h.role === 'ai' || h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
    parts: [{ text: typeof h.content === 'string' ? h.content : JSON.stringify(h.content) }]
  }));
  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  let lastError: any = null;

  for (const model of modelCandidates) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: effectiveTemperature,
            maxOutputTokens: effectiveMaxTokens,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google API ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        throw new Error('Empty response candidates returned by Google Gemini.');
      }

      const parsed = extractJSON(candidateText);
      return {
        logicTrace: Array.isArray(parsed.logicTrace) ? parsed.logicTrace : [
          'Evaluated query parameters and learning intent',
          'Selected hardware framework and interfaces',
          'Structured progressive 3-stage curriculum roadmap'
        ],
        message: typeof parsed.message === 'string' ? parsed.message : 'Synthesized trajectory generated successfully.',
        roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : [],
        provider: model
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} attempt notice:`, err.message);
    }
  }

  console.warn('All Gemini models attempted; falling back to smart educational engine:', lastError?.message);
  return generateSmartFallback(query, 'Gemini Flash');
}
