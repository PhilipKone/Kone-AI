import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { getSubdomainKnowledgeContext, SUBDOMAIN_PROFILES } from './subdomainKnowledge.ts';

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

// Handle malformed JSON body errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload in request body' });
  }
  next(err);
});

/* ── Type Declarations ────────────────────────────────── */

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'ai' | 'model';
  content: string;
}

export interface ChatRequestBody {
  message?: string;
  query?: string; // alias for message
  history?: ChatHistoryItem[];
  provider?: string;
  subdomain?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ServerSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  safetyToggles: {
    speedLimiter: boolean;
    telemetryStream: boolean;
    verboseLogs: boolean;
    groundedSearch: boolean;
  };
  activeProvider: string;
  telemetryOnline: boolean;
}

/* ── Settings Persistence ─────────────────────────────── */

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const DEFAULT_SETTINGS: ServerSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "You are Kone AI, an advanced and friendly AI assistant for Kone Academy. You assist students, creators, and engineers with programming, robotics, electronics, web development, and AI across all academy divisions. Provide clear, accurate, and supportive answers with markdown formatting and well-commented code snippets where helpful.",
  safetyToggles: {
    speedLimiter: true,
    telemetryStream: true,
    verboseLogs: false,
    groundedSearch: true
  },
  activeProvider: 'gemini-flash',
  telemetryOnline: true
};

function loadSettings(): ServerSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err: any) {
    console.warn('Could not read settings.json, using defaults:', err.message);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: ServerSettings): boolean {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err: any) {
    console.error('Failed to write settings.json:', err.message);
    return false;
  }
}

let serverSettings: ServerSettings = loadSettings();

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

const groq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here'
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    })
  : null;

/* ── Intelligent Offline Fallback Generator ──────────── */

function generateSmartFallback(query: string, providerName: string, subdomain: string = 'all'): string {
  const q = query.toLowerCase();
  
  // Resolve target subdomain
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

  if (q.includes('robot') || q.includes('arduino') || q.includes('motor') || q.includes('pwm')) {
    return `### Kone AI Robotics Assistant (${providerName})\n\nGreat question regarding robotics and microcontroller control! Here is a structured approach to building and controlling DC motors with an Arduino:\n\n` +
      `#### 1. Hardware Architecture\n` +
      `- **Controller:** Arduino Uno R4 / Nano or ESP32\n` +
      `- **Driver:** L298N or TB6612FNG Dual H-Bridge Motor Driver\n` +
      `- **Power:** Separate 7.4V - 12V LiPo battery for motors (never power motors directly from Arduino 5V!)\n\n` +
      `#### 2. Arduino C++ PWM Control Example\n` +
      `\`\`\`cpp\n` +
      `// Kone AI - PWM Motor Speed Control\n` +
      `const int ENA = 9;  // PWM speed control pin\n` +
      `const int IN1 = 8;  // Direction logic 1\n` +
      `const int IN2 = 7;  // Direction logic 2\n\n` +
      `void setup() {\n` +
      `  pinMode(ENA, OUTPUT);\n` +
      `  pinMode(IN1, OUTPUT);\n` +
      `  pinMode(IN2, OUTPUT);\n` +
      `}\n\n` +
      `void loop() {\n` +
      `  // Rotate forward at 60% speed\n` +
      `  digitalWrite(IN1, HIGH);\n` +
      `  digitalWrite(IN2, LOW);\n` +
      `  analogWrite(ENA, 153); // 153/255 = 60% duty cycle\n` +
      `  delay(2000);\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `*Explore hardware kits on [shop.koneacademy.io](https://shop.koneacademy.io) or lab experiments on [lab.koneacademy.io](https://lab.koneacademy.io).*`;
  }

  if (q.includes('python') || q.includes('code') || q.includes('loop') || q.includes('function') || q.includes('react') || q.includes('typescript')) {
    return `### Kone AI Code Companion (${providerName})\n\nHere is a clean, modern TypeScript solution tailored to the Kone Code curriculum:\n\n` +
      `\`\`\`typescript\n` +
      `// Kone Code Academy - Type-Safe Data Pipeline\n` +
      `interface LearningTrack {\n` +
      `  id: string;\n` +
      `  title: string;\n` +
      `  level: 'Beginner' | 'Intermediate' | 'Advanced';\n` +
      `}\n\n` +
      `export function filterTracks(tracks: LearningTrack[], targetLevel: string): LearningTrack[] {\n` +
      `  return tracks.filter(t => t.level === targetLevel);\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `Explore software roadmaps on [code.koneacademy.io](https://code.koneacademy.io).`;
  }

  return `### Welcome to Kone AI • Unified Ecosystem Intelligence\n\n` +
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

/* ── LLM Chat Completion Handler ────────────────────── */

async function executeChatCompletion(params: {
  message: string;
  history: ChatHistoryItem[];
  provider: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  subdomain?: string;
  apiKey?: string;
  groqApiKey?: string;
}): Promise<{ content: string; provider: string }> {
  const { message, history, provider, temperature, maxTokens, systemPrompt, subdomain = 'all', apiKey, groqApiKey } = params;

  // Format past turns for multi-turn conversational context
  const formattedHistory = history.slice(-8).map(h => ({
    role: (h.role === 'ai' || h.role === 'assistant' || h.role === 'model') ? 'assistant' : 'user',
    content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content)
  }));

  // ── Provider 1: OpenAI (GPT-4o, GPT-4o-mini) ──
  if (provider.startsWith('openai') || provider === 'gpt-4o' || provider === 'gpt-4o-mini') {
    if (!openai) {
      console.warn('OpenAI API key not configured, returning smart educational fallback.');
      return { content: generateSmartFallback(message, 'GPT-4o (Fallback)', subdomain), provider: 'gpt-4o-mini' };
    }

    try {
      const modelName = provider === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini';
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: message }
      ];

      const response = await openai.chat.completions.create({
        model: modelName,
        messages,
        temperature,
        max_tokens: maxTokens
      });

      const content = response.choices[0]?.message?.content || 'No response returned from OpenAI.';
      return { content, provider: modelName };
    } catch (err: any) {
      console.error('OpenAI generation error:', err.message);
      return { content: generateSmartFallback(message, 'OpenAI', subdomain), provider: 'gpt-4o' };
    }
  }

  // ── Provider 2: DeepSeek R1 ──
  if (provider === 'deepseek-r1') {
    if (!deepseek) {
      console.warn('DeepSeek API key not configured, returning smart educational fallback.');
      return { content: generateSmartFallback(message, 'DeepSeek R1 (Fallback)', subdomain), provider: 'deepseek-r1' };
    }

    try {
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: message }
      ];

      const response = await deepseek.chat.completions.create({
        model: 'deepseek-reasoner',
        messages,
        temperature,
        max_tokens: maxTokens
      });

      const content = response.choices[0]?.message?.content || 'No response returned from DeepSeek.';
      return { content, provider: 'deepseek-r1' };
    } catch (err: any) {
      console.error('DeepSeek generation error:', err.message);
      return { content: generateSmartFallback(message, 'DeepSeek R1', subdomain), provider: 'deepseek-r1' };
    }
  }

  // ── Provider 3: Groq (GPT-OSS 120B, Qwen 3.8 27B, Llama 3.3 70B) ──
  if (provider === 'groq-llama-70b' || provider === 'groq-deepseek-r1' || provider.startsWith('groq')) {
    const groqKey = groqApiKey || apiKey || process.env.GROQ_API_KEY;
    const client = groqKey ? new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' }) : groq;
    if (!client) {
      console.warn('Groq API key not configured, returning educational fallback.');
      return { content: generateSmartFallback(message, 'Groq (Offline)', subdomain), provider };
    }

    const candidates = provider === 'groq-deepseek-r1'
      ? ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'deepseek-r1-distill-llama-70b']
      : ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b'];

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    let lastErr: any = null;
    for (const modelName of candidates) {
      try {
        const response = await client.chat.completions.create({
          model: modelName,
          messages,
          temperature,
          max_tokens: maxTokens
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          return { content, provider: `Groq (${modelName})` };
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`Groq model ${modelName} failed, trying next candidate:`, err.message);
      }
    }

    console.error('All Groq candidate models failed:', lastErr?.message);
    return { content: generateSmartFallback(message, 'Groq LPU', subdomain), provider };
  }

  // ── Provider 4: Google Gemini (Default: Gemini 3.8 Flash & Gemini 3.1 Pro) ──
  const activeGenAI = apiKey ? new GoogleGenerativeAI(apiKey) : genAI;
  if (activeGenAI) {
    try {
      const modelCandidates = (provider === 'gemini-3.1-pro' || provider === 'gemini-pro')
        ? ['gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-2.5-flash']
        : ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

      const geminiContents = formattedHistory.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));
      geminiContents.push({ role: 'user', parts: [{ text: message }] });

      let responseText: string | null = null;
      let usedModel = provider === 'gemini-3.1-pro' ? 'Gemini 3.1 Pro' : 'Gemini 3.8 Flash';
      let lastErr: any = null;

      for (const modelName of modelCandidates) {
        try {
          const model = activeGenAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens
            }
          });

          const result = await model.generateContent({
            contents: geminiContents,
            systemInstruction: systemPrompt
          });

          responseText = result.response.text();
          if (responseText) {
            usedModel = modelName;
            break;
          }
        } catch (err: any) {
          lastErr = err;
        }
      }

      if (responseText) {
        return { content: responseText, provider: usedModel };
      } else {
        throw lastErr || new Error("No Gemini models responded successfully.");
      }
    } catch (err: any) {
      console.warn('Gemini generation notice:', err.message);
      const displayProvider = provider === 'gemini-3.1-pro' ? 'Gemini 3.1 Pro' : 'Gemini 3.8 Flash';
      return { content: generateSmartFallback(message, displayProvider, subdomain), provider: displayProvider };
    }
  }

  // Fallback if no engine clients are configured
  return { content: generateSmartFallback(message, 'Kone AI Core', subdomain), provider: 'kone-ai-core' };
}

/* ── API Endpoints ────────────────────────────────────── */

// 1. Primary Generic Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const body: ChatRequestBody = req.body;
    const message = body.message || body.query;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
    }

    const provider = body.provider || serverSettings.activeProvider || 'gemini-3.8-flash';
    const temperature = Math.min(Math.max(typeof body.temperature === 'number' ? body.temperature : serverSettings.temperature, 0.0), 2.0);
    const maxTokens = Math.min(Math.max(typeof body.maxTokens === 'number' ? body.maxTokens : serverSettings.maxTokens, 128), 4096);
    const basePrompt = body.systemPrompt || serverSettings.systemPrompt;
    const subdomain = body.subdomain || 'all';
    const groundedPrompt = `${basePrompt}\n\n${getSubdomainKnowledgeContext(subdomain)}`;
    const history = Array.isArray(body.history) ? body.history : [];

    const result = await executeChatCompletion({
      message: message.trim(),
      history,
      provider,
      temperature,
      maxTokens,
      systemPrompt: groundedPrompt,
      subdomain,
      apiKey: (body as any).geminiApiKey || (body as any).apiKey,
      groqApiKey: (body as any).groqApiKey
    });

    return res.json({
      role: 'assistant',
      content: result.content,
      provider: result.provider,
      subdomain,
      timestamp: Date.now()
    });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({
      error: 'Failed to process chat request',
      message: err.message
    });
  }
});

// Subdomain Directory Endpoint
app.get('/api/subdomains', (req: Request, res: Response) => {
  res.json({
    subdomains: Object.values(SUBDOMAIN_PROFILES)
  });
});

// 2. Backwards-Compatible /api/synthesize Endpoint
app.post('/api/synthesize', async (req: Request, res: Response) => {
  try {
    const body: ChatRequestBody = req.body;
    const query = body.query || body.message;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query is required and must be a non-empty string.' });
    }

    const provider = body.provider || serverSettings.activeProvider || 'gemini-flash';
    const temperature = Math.min(Math.max(typeof body.temperature === 'number' ? body.temperature : serverSettings.temperature, 0.0), 2.0);
    const maxTokens = Math.min(Math.max(typeof body.maxTokens === 'number' ? body.maxTokens : serverSettings.maxTokens, 128), 4096);
    const systemPrompt = body.systemPrompt || serverSettings.systemPrompt;
    const history = Array.isArray(body.history) ? body.history : [];

    const result = await executeChatCompletion({
      message: query.trim(),
      history,
      provider,
      temperature,
      maxTokens,
      systemPrompt
    });

    // Provide both natural message and optional scaffold
    return res.json({
      message: result.content,
      content: result.content,
      provider: result.provider,
      activeProvider: result.provider,
      logicTrace: [
        `Processed query with ${result.provider}`,
        'Context history analyzed and structured',
        'Natural educational response synthesized'
      ],
      roadmap: [
        { tag: 'Core Concept', name: 'Understanding Foundations', reason: 'Master core principles and logic.' },
        { tag: 'Hands-On', name: 'Practical Implementation', reason: 'Write, test, and debug code.' },
        { tag: 'Mastery', name: 'Expansion & Capstone', reason: 'Extend logic and deploy production firmware.' }
      ]
    });
  } catch (err: any) {
    console.error('Synthesize endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// 3. Healthcheck Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Kone AI Full-Stack Orchestrator',
    language: 'TypeScript',
    version: '3.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    engines: {
      gemini: !!genAI,
      openai: !!openai,
      deepseek: !!deepseek
    },
    activeProvider: serverSettings.activeProvider,
    telemetryDb: serverSettings.telemetryOnline ? 'online' : 'offline'
  });
});

// 4. Settings Endpoints
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(serverSettings);
});

app.post('/api/settings', (req: Request, res: Response) => {
  const updates = req.body;
  serverSettings = { ...serverSettings, ...updates };
  saveSettings(serverSettings);
  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: serverSettings
  });
});

// 5. Diagnostics Endpoint
app.get('/api/diagnostics', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'operational',
    nodeVersion: process.version,
    memoryMb: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    },
    activeProvider: serverSettings.activeProvider
  });
});

// 6. Hardware Knowledge Base Endpoint
app.get('/api/knowledge', (req: Request, res: Response) => {
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

// Generic 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Only start listening when running standalone (not in Cloud Functions)
const isServerless = !!(process.env.FUNCTION_NAME || process.env.K_SERVICE || process.env.FIREBASE_CONFIG);
if (!isServerless && process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`⚡ Kone AI TypeScript Orchestrator running on port ${port}`);
  });
}

export default app;
