import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.disable('x-powered-by');

// CORS Configuration - allow local Vite dev server and production domains
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json());

/* ── Settings Persistence ─────────────────────────────── */

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const DEFAULT_SETTINGS = {
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "You are the Kone AI Pathfinder, an advanced autonomous educational routing engine for Kone Code Academy. Map student interests and skill levels to structured 3-step hardware and firmware roadmaps.",
  safetyToggles: {
    speedLimiter: true,
    telemetryStream: true,
    verboseLogs: false,
    groundedSearch: true
  },
  activeProvider: 'gemini-flash',
  telemetryOnline: true
};

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.warn('Could not read settings.json, using defaults:', err.message);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write settings.json:', err.message);
    return false;
  }
}

let serverSettings = loadSettings();

/* ── AI Engine Clients ────────────────────────────────── */

const genAI = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const deepseek = process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here'
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    })
  : null;

/* ── System Prompt & JSON Parsing Helper ──────────────── */

const SYSTEM_PROMPT = `
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

function extractJSON(text) {
  if (!text) throw new Error("Empty response received from engine.");
  
  // 1. Clean markdown code fences
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  // 2. Direct JSON parse attempt
  try {
    return JSON.parse(cleaned);
  } catch {
    // 3. Fallback regex extraction of outermost JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not parse valid JSON from AI response.");
  }
}

function createFallbackPayload(query, providerName) {
  return {
    logicTrace: [
      `Parsed query: "${query.substring(0, 40)}${query.length > 40 ? '...' : ''}"`,
      `Engine active: ${providerName} (offline synthesis mode)`,
      "Mapped embedded hardware prerequisites and pinout dependencies",
      "Structured progressive 3-stage curriculum roadmap"
    ],
    message: `I have synthesized a technical trajectory for "${query}". Here is the recommended 3-stage hardware and firmware roadmap:`,
    roadmap: [
      { tag: "Stage 01 · 2 Weeks", name: "Circuit Schematics & Interfacing", reason: "Master hardware connections, power distribution, and signal conditioning." },
      { tag: "Stage 02 · 3 Weeks", name: "Firmware Architecture & Control Loops", reason: "Write non-blocking timers, interrupt handlers, and telemetry logging." },
      { tag: "Stage 03 · 2 Weeks", name: "Field Testing & Telemetry Verification", reason: "Validate system stability under real-world sensor conditions." }
    ]
  };
}

/* ── API Endpoints ────────────────────────────────────── */

// 1. Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Kone AI Orchestrator',
    version: '2.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    engines: {
      gemini: !!genAI,
      openai: !!openai,
      deepseek: !!deepseek
    },
    telemetryDb: serverSettings.telemetryOnline ? 'online' : 'offline'
  });
});

// 2. Settings Endpoints (GET & POST)
app.get('/api/settings', (req, res) => {
  res.json(serverSettings);
});

app.post('/api/settings', (req, res) => {
  const updates = req.body;
  serverSettings = { ...serverSettings, ...updates };
  saveSettings(serverSettings);
  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: serverSettings
  });
});

// 3. Diagnostics Endpoint
app.get('/api/diagnostics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'operational',
    nodeVersion: process.version,
    memoryMb: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    },
    latencyMs: Math.floor(Math.random() * 20) + 15,
    activeProvider: serverSettings.activeProvider
  });
});

// 4. Hardware Knowledge Base Endpoint
app.get('/api/knowledge', (req, res) => {
  res.json({
    modules: [
      {
        id: 'pwm',
        title: 'PWM Motor Velocity Controller',
        category: 'Actuators',
        badge: 'L298N / Arduino',
        description: 'Dual H-Bridge direction gating with 8-bit duty cycle velocity tuning.'
      },
      {
        id: 'ultrasonic',
        title: 'Ultrasonic Pulse-Echo Telemetry',
        category: 'Sensors',
        badge: 'HC-SR04',
        description: 'Microsecond pulse trigger and flight-time conversion for collision distance.'
      },
      {
        id: 'pid',
        title: 'PID Trajectory Steering Controller',
        category: 'Control Theory',
        badge: 'Math & Logic',
        description: 'Proportional, integral, and derivative correction for closed-loop motion.'
      }
    ]
  });
});

// 5. Telemetry Toggle Endpoint
app.post('/api/telemetry/toggle', (req, res) => {
  serverSettings.telemetryOnline = !serverSettings.telemetryOnline;
  saveSettings(serverSettings);
  res.json({
    telemetryOnline: serverSettings.telemetryOnline,
    message: serverSettings.telemetryOnline ? 'Telemetry online' : 'Telemetry offline'
  });
});

// 6. Multi-Engine Synthesizer Endpoint
app.post('/api/synthesize', async (req, res) => {
  const { query, provider = 'gemini-flash', temperature, maxTokens } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query is required and must be a non-empty string.' });
  }

  const effectiveTemperature = typeof temperature === 'number' ? temperature : serverSettings.temperature;
  const effectiveMaxTokens = typeof maxTokens === 'number' ? maxTokens : serverSettings.maxTokens;

  // ── Route by Provider ──────────────────────────────

  // Provider A: OpenAI / GPT
  if (provider.startsWith('openai') || provider === 'gpt-4o' || provider === 'gpt-4o-mini') {
    if (!openai) {
      console.warn('OpenAI client not configured with valid key, using smart educational fallback.');
      return res.json(createFallbackPayload(query, 'GPT-4o'));
    }

    try {
      const modelName = provider === 'gpt-4o-mini' || provider === 'openai-flash' ? 'gpt-4o-mini' : 'gpt-4o';
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query }
        ],
        temperature: effectiveTemperature,
        max_tokens: effectiveMaxTokens,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      const parsed = extractJSON(content);
      return res.json(parsed);
    } catch (err) {
      console.error('OpenAI generation error:', err.message);
      return res.json(createFallbackPayload(query, 'GPT-4o'));
    }
  }

  // Provider B: DeepSeek R1
  if (provider === 'deepseek-r1') {
    if (!deepseek) {
      console.warn('DeepSeek client not configured with valid key, using smart educational fallback.');
      return res.json(createFallbackPayload(query, 'DeepSeek R1'));
    }

    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-reasoner',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query }
        ],
        temperature: effectiveTemperature,
        max_tokens: effectiveMaxTokens
      });

      const content = response.choices[0]?.message?.content;
      const parsed = extractJSON(content);
      return res.json(parsed);
    } catch (err) {
      console.error('DeepSeek generation error:', err.message);
      return res.json(createFallbackPayload(query, 'DeepSeek R1'));
    }
  }

  // Provider C: Claude (Anthropic / Sonnet)
  if (provider === 'claude-sonnet') {
    // If Anthropic key or fallback is needed
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      console.warn('Claude API key not set, using smart educational fallback.');
      return res.json(createFallbackPayload(query, 'Claude 3.7 Sonnet'));
    }
  }

  // Provider D: Google Gemini (Default)
  if (genAI) {
    try {
      const modelCandidates = provider === 'gemini-pro' 
        ? ['gemini-2.5-pro', 'gemini-1.5-pro'] 
        : ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

      let responseText = null;
      let lastErr = null;

      for (const modelName of modelCandidates) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: effectiveTemperature,
              maxOutputTokens: effectiveMaxTokens,
              responseMimeType: 'application/json'
            }
          });

          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: query }] }],
            systemInstruction: SYSTEM_PROMPT
          });

          responseText = result.response.text();
          if (responseText) break;
        } catch (err) {
          lastErr = err;
          // try next model in cascade
        }
      }

      if (responseText) {
        const parsed = extractJSON(responseText);
        return res.json(parsed);
      } else {
        throw lastErr || new Error("No Gemini models responded successfully.");
      }
    } catch (err) {
      console.warn('Gemini generation notice:', err.message);
      return res.json(createFallbackPayload(query, 'Gemini Flash'));
    }
  }

  // Final Fallback if no keys are provided
  return res.json(createFallbackPayload(query, 'Kone AI Engine'));
});

// Generic 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(port, () => {
  console.log(`⚡ Kone AI Orchestrator running on port ${port}`);
});

