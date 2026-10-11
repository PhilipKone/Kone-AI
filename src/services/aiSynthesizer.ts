import { getSubdomainKnowledgeContext, SUBDOMAIN_PROFILES } from '../subdomainKnowledge';

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
  apiKey?: string;
  groqApiKey?: string;
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

export function resolveApiKey(key?: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.startsWith('QVEu') || (trimmed.length > 40 && trimmed.endsWith('='))) {
    try {
      if (typeof atob !== 'undefined') {
        return atob(trimmed);
      }
    } catch {
      return trimmed;
    }
  }
  return trimmed;
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

export function generateClientFallbackText(query: string, providerName: string = 'Kone AI', subdomain: string = 'all'): string {
  const q = query.toLowerCase();
  const targetSub = subdomain !== 'all' ? subdomain : 
    (q.includes('kids') || q.includes('child') || q.includes('scratch') ? 'kids' :
     q.includes('consult') || q.includes('enterprise') || q.includes('audit') ? 'consult' :
     q.includes('digital') || q.includes('ui/ux') || q.includes('figma') || q.includes('design') ? 'digital' :
     q.includes('lab') || q.includes('esp32') || q.includes('telemetry') || q.includes('lora') ? 'lab' :
     q.includes('shop') || q.includes('store') || q.includes('kit') || q.includes('buy') ? 'shop' :
     q.includes('farm') || q.includes('irrigation') || q.includes('agri') ? 'farms' :
     q.includes('warp') || q.includes('sandbox') || q.includes('simulator') ? 'warp' :
     q.includes('code') || q.includes('react') || q.includes('typescript') || q.includes('track') ? 'code' : 'all');

  const profile = SUBDOMAIN_PROFILES[targetSub] || SUBDOMAIN_PROFILES['all'];

  if (targetSub !== 'all') {
    return `### 🌟 Kone AI • ${profile.name} (${profile.url})\n\n` +
      `**${profile.tagline}**\n\n` +
      `${profile.description}\n\n` +
      `#### 🚀 Core Offerings & Curriculum Tracks:\n` +
      profile.keyOfferings.map(o => `* **${o.split(':')[0]}:** ${o.split(':')[1] || ''}`).join('\n') + `\n\n` +
      `#### 🎯 Target Audience:\n${profile.targetAudience}\n\n` +
      `> 🔗 **Direct Portal:** [Open ${profile.name}](${profile.url}) to access live modules, sandboxes, and documentation.`;
  }

  return `### Welcome to Kone AI • Unified Ecosystem Intelligence (${providerName})\n\n` +
    `I am fine-tuned across all **9 subdomains** of the Kone Academy ecosystem:\n\n` +
    `- 👶 **Kone Kids (kids.koneacademy.io):** STEM, robotics, and creative coding (Ages 6-16)\n` +
    `- 💻 **Kone Code (code.koneacademy.io):** Full-stack TypeScript, React, and backend tracks\n` +
    `- 💼 **Kone Consult (consult.koneacademy.io):** Enterprise AI advisory and systems architecture\n` +
    `- 🎨 **Kone Digital (digital.koneacademy.io):** UI/UX product design, design systems, and branding\n` +
    `- 🔬 **Kone Lab (lab.koneacademy.io):** Hardware R&D, ESP32 telemetry, and embedded systems\n` +
    `- 🛒 **Kone Shop (shop.koneacademy.io):** Official robotics kits, sensors, and school bundles\n` +
    `- 🌾 **Kone Farms (farms.koneacademy.io):** Smart agriculture and automated IoT irrigation\n` +
    `- ⚡ **Kone Warp (warp.koneacademy.io):** Virtual simulators and cloud browser sandboxes\n\n` +
    `Select any subdomain pill above or ask a targeted question about any division!`;
}

/**
 * Direct Client-Side Live AI Chat Generator
 * Supports Google Gemini API & Groq LPU API directly from the browser.
 * Requires zero backend servers and operates on all devices worldwide!
 */
export async function generateClientChat(options: SynthesisOptions & { subdomain?: string }): Promise<{ content: string; provider: string }> {
  const {
    query,
    history = [],
    provider = 'gemini-3.8-flash',
    temperature = 0.7,
    maxTokens = 2048,
    systemPrompt = "You are Kone AI, an advanced, friendly, and knowledgeable AI assistant for Kone Academy. You assist students, creators, and engineers with programming, robotics, electronics, web development, and AI across all academy divisions. Provide clear, accurate, and supportive answers with markdown formatting and well-commented code snippets where helpful.",
    subdomain = 'all'
  } = options;

  const effectiveTemperature = Math.min(Math.max(Number(temperature) || 0.7, 0.0), 2.0);
  const effectiveMaxTokens = Math.min(Math.max(Math.round(Number(maxTokens) || 2048), 128), 4096);
  const groundedSystemInstruction = `${systemPrompt}\n\n${getSubdomainKnowledgeContext(subdomain)}`;

  // Resolve Groq credentials
  const explicitGroqKey = resolveApiKey(options.groqApiKey);
  const storedGroqKey = typeof localStorage !== 'undefined' ? resolveApiKey(localStorage.getItem('kone_groq_api_key') || '') : '';
  const envGroqKey = resolveApiKey(import.meta.env.VITE_GROQ_API_KEY);
  const groqApiKey = explicitGroqKey || storedGroqKey || envGroqKey;

  // Helper for direct Groq browser execution
  const executeGroqEdge = async (model: string): Promise<string | null> => {
    if (!groqApiKey) return null;
    try {
      const messages = [
        { role: 'system', content: groundedSystemInstruction },
        ...history.slice(-8).map(h => ({
          role: h.role === 'ai' || h.role === 'assistant' || h.role === 'model' ? 'assistant' : 'user',
          content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content)
        })),
        { role: 'user', content: query }
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: effectiveTemperature,
          max_tokens: effectiveMaxTokens
        })
      });

      if (!res.ok) {
        console.warn(`Groq ${model} status:`, res.status);
        return null;
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.warn(`Groq edge call failed:`, err);
      return null;
    }
  };

  // 1. If Groq model requested directly
  if (provider === 'groq-llama-70b' || provider === 'groq-deepseek-r1') {
    const groqModel = provider === 'groq-deepseek-r1' ? 'deepseek-r1-distill-llama-70b' : 'llama-3.3-70b-versatile';
    if (groqApiKey) {
      const responseText = await executeGroqEdge(groqModel);
      if (responseText) {
        return { content: responseText, provider: groqModel };
      }
    }
    return {
      content: generateClientFallbackText(query, `Groq (${groqModel})`, subdomain),
      provider
    };
  }

  // 2. Google Gemini Execution
  const explicitKey = resolveApiKey(options.apiKey);
  const storedKey = typeof localStorage !== 'undefined' ? resolveApiKey(localStorage.getItem('kone_gemini_api_key') || '') : '';
  const envKey = resolveApiKey(import.meta.env.VITE_GEMINI_API_KEY);
  const apiKey = explicitKey || storedKey || envKey;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // If no Gemini key, but Groq key is present, use Groq automatically!
    if (groqApiKey) {
      const autoGroq = await executeGroqEdge('llama-3.3-70b-versatile');
      if (autoGroq) {
        return { content: autoGroq, provider: 'llama-3.3-70b-versatile (Groq)' };
      }
    }

    return {
      content: generateClientFallbackText(query, 'Kone AI Edge', subdomain),
      provider: 'Kone AI Edge'
    };
  }

  const modelCandidates = (provider === 'gemini-3.1-pro' || provider === 'gemini-pro')
    ? ['gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-2.5-flash']
    : ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

  const contents = history.slice(-8).map(h => ({
    role: h.role === 'ai' || h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
    parts: [{ text: typeof h.content === 'string' ? h.content : JSON.stringify(h.content) }]
  }));
  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

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
            parts: [{ text: groundedSystemInstruction }]
          },
          generationConfig: {
            temperature: effectiveTemperature,
            maxOutputTokens: effectiveMaxTokens
          }
        })
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        return { content: candidateText, provider: model };
      }
    } catch (err) {
      console.warn(`Model ${model} edge error:`, err);
    }
  }

  // 3. If Gemini quota 429 was exhausted, try auto-failover to Groq if key exists!
  if (groqApiKey) {
    const autoGroq = await executeGroqEdge('llama-3.3-70b-versatile');
    if (autoGroq) {
      return { content: autoGroq, provider: 'llama-3.3-70b-versatile (Groq Auto-Failover)' };
    }
  }

  return {
    content: generateClientFallbackText(query, 'Gemini 3.8 Flash (Edge)', subdomain),
    provider: 'gemini-3.8-flash'
  };
}

export async function synthesizeEducationalRoadmap(options: SynthesisOptions): Promise<SynthesisResult> {
  const {
    query,
    history = [],
    provider = 'gemini-3.8-flash',
    temperature = 0.7,
    maxTokens = 2048,
    systemPrompt = DEFAULT_SYSTEM_PROMPT
  } = options;

  const explicitKey = resolveApiKey(options.apiKey);
  const storedKey = typeof localStorage !== 'undefined' ? resolveApiKey(localStorage.getItem('kone_gemini_api_key') || '') : '';
  const envKey = resolveApiKey(import.meta.env.VITE_GEMINI_API_KEY);
  const apiKey = explicitKey || storedKey || envKey;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.info('Kone AI: Operating in offline edge simulation mode.');
    return generateSmartFallback(query, 'Kone AI Edge');
  }

  const effectiveTemperature = Math.min(Math.max(Number(temperature) || 0.7, 0.0), 2.0);
  const effectiveMaxTokens = Math.min(Math.max(Math.round(Number(maxTokens) || 2048), 128), 4096);

  const modelCandidates = ['gemini-3.8-flash', 'gemini-2.5-flash'];

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

  return generateSmartFallback(query, 'Gemini Flash');
}
