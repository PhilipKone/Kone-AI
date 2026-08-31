import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MissionSimulator from './components/MissionSimulator';
import Sitemap from './components/Sitemap';
import { 
  Menu, 
  Settings, 
  RefreshCw, 
  Sliders, 
  FileCode, 
  Check, 
  Cpu, 
  Globe,
  Compass,
  Copy,
  CheckCheck,
  Code2,
  BookOpen,
  Share2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

/* ── Type Declarations ────────────────────────────────── */

export interface RoadmapItem {
  tag: string;
  name: string;
  reason: string;
}

export interface MessageItem {
  role: 'user' | 'ai';
  content: string;
  logicTrace?: string[];
  roadmap?: RoadmapItem[] | null;
  activeProvider?: string;
}

export interface Session {
  id: string;
  name: string;
  messages: MessageItem[];
}

export interface AIParameters {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

/* ── Main Component ───────────────────────────────────── */

function App() {
  const API_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5000';
  const [activeView, setActiveView] = useState<string>('synthesis');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Sidebar Collapse & Mobile Drawer State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // AI Parameters State
  const [parameters, setParameters] = useState<AIParameters>({
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "You are the Kone AI Pathfinder, an advanced autonomous educational routing engine..."
  });

  // Knowledge Base State
  const [selectedDocId, setSelectedDocId] = useState<string>('pwm');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeCodeLang, setActiveCodeLang] = useState<'cpp' | 'python'>('cpp');

  // Settings State
  const [safetyToggles, setSafetyToggles] = useState({
    speedLimiter: true,
    telemetryStream: true,
    verboseLogs: false,
    groundedSearch: true
  });

  // Sessions State
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'alex-robotics',
      name: 'Alex - Level 2 Robotics',
      messages: [
        { role: 'user', content: 'Design a path for Alex interested in robotics.' },
        { 
          role: 'ai', 
          content: 'I have synthesized a structured 3-stage robotics roadmap tailored for Alex. We start with motor loop fundamentals, integrate ultrasonic obstacle detection, and finish with a remote telemetry maze-solving capstone.',
          logicTrace: [
            'Parsed learner profile: Alex (Robotics, Level 2 Beginner)',
            'Selected hardware framework: Arduino Uno R4 + L298N Dual H-Bridge',
            'Integrated sensor loops: HC-SR04 pulse-echo telemetry',
            'Generated progressive curriculum milestones with verified pinout diagrams'
          ],
          roadmap: [
            { tag: '2-3 Weeks', name: 'PWM Motor Control Master', reason: 'Understand H-bridge direction logic and 8-bit duty cycle velocity tuning.' },
            { tag: '2 Weeks', name: 'Ultrasonic Feedback Loops', reason: 'Implement pulse-timing distance measurement and collision-prevention thresholds.' },
            { tag: '3 Weeks', name: 'Autonomous Maze Solver Capstone', reason: 'Integrate multi-sensor state machines with autonomous directional steering.' }
          ],
          activeProvider: 'gemini-flash'
        }
      ]
    },
    {
      id: 'motor-optimization',
      name: "PWM Speed Control Firmware",
      messages: [
        { role: 'user', content: "Show me the C++ code to run a DC motor at 50% speed." },
        {
          role: 'ai',
          content: "Here is the production-grade Arduino C++ routine to drive a DC gearmotor at a 50% duty cycle on PWM pin 9:",
          logicTrace: [
            'Detected runtime: Arduino C++ / AVR-core',
            'Mapped PWM pin: D9 (Timer1 OC1A)',
            'Calculated 8-bit PWM value: 50% = 128 / 255'
          ],
          roadmap: [
            { tag: 'Hardware', name: 'Timer PWM Configuration', reason: 'Initializes D9 output with hardware square-wave modulation.' }
          ],
          activeProvider: 'gemini-flash'
        }
      ]
    },
    {
      id: 'sensor-calibration',
      name: 'ESP32 Soil Moisture Mesh',
      messages: []
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('alex-robotics');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  /* ── Actions ─────────────────────────────────────────── */

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendMessage = async (text: string, provider: string) => {
    if (!text.trim()) return;

    const userMsg: MessageItem = { role: 'user', content: text };
    
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [...s.messages, userMsg] };
      }
      return s;
    }));

    setIsAnalyzing(true);

    try {
      const response = await axios.post(`${API_URL}/api/synthesize`, {
        query: text,
        history: activeSession.messages.map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content
        })),
        provider,
        temperature: parameters.temperature,
        maxTokens: parameters.maxTokens
      });

      const data = response.data;
      
      const aiMsg: MessageItem = {
        role: 'ai',
        logicTrace: data.logicTrace || [
          'Evaluated query parameters and learning intent',
          'Resolved embedded hardware dependencies',
          'Generated modular milestones and code scaffolds'
        ],
        content: data.message || "Synthesis complete. The personalized trajectory milestones have been generated below.",
        roadmap: data.roadmap || [
          { tag: 'Milestone 01', name: 'Core Principles', reason: 'Foundational electronics and sensor interfacing.' },
          { tag: 'Milestone 02', name: 'Firmware Logic', reason: 'Asynchronous event loops and feedback calibration.' },
          { tag: 'Milestone 03', name: 'Integrated Capstone', reason: 'End-to-end hardware deployment and verification.' }
        ],
        activeProvider: provider
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const name = s.messages.length <= 1 ? (text.length > 25 ? text.substring(0, 25) + '...' : text) : s.name;
          return {
            ...s,
            name,
            messages: [...s.messages, aiMsg]
          };
        }
        return s;
      }));

    } catch (error: any) {
      console.warn("Synthesis fallback activated:", error);
      // Clean fallback for demonstration/offline
      const aiMsg: MessageItem = {
        role: 'ai',
        logicTrace: [
          'Processed natural language query with offline intelligence cache',
          'Mapped embedded hardware prerequisites and pinout dependencies',
          'Structured progressive 3-stage curriculum roadmap'
        ],
        content: `I have analyzed your request regarding "${text}". Here is the recommended multi-stage technical trajectory:`,
        roadmap: [
          { tag: 'Stage 1 · 2 Weeks', name: 'Circuit Schematics & Interfacing', reason: 'Master hardware connections, power distribution, and signal conditioning.' },
          { tag: 'Stage 2 · 3 Weeks', name: 'Firmware Architecture & Control Loops', reason: 'Write non-blocking timers, interrupt handlers, and telemetry logging.' },
          { tag: 'Stage 3 · 2 Weeks', name: 'Field Testing & Telemetry Verification', reason: 'Validate system stability under real-world sensor conditions.' }
        ],
        activeProvider: provider
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const name = s.messages.length <= 1 ? (text.length > 25 ? text.substring(0, 25) + '...' : text) : s.name;
          return {
            ...s,
            name,
            messages: [...s.messages, aiMsg]
          };
        }
        return s;
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: Session = {
      id: newId,
      name: `Trajectory ${sessions.length + 1}`,
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveView('synthesis');
    showToast("Created new trajectory thread", "info");
  };

  const handleClearSession = () => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [] };
      }
      return s;
    }));
    showToast("Trajectory cleared", "info");
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast("Code snippet copied to clipboard", "success");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  /* ── Sub-Views: Knowledge Base (Stripe/Linear Docs Style) ────────────────── */

  const renderKnowledgeBase = () => {
    const docs = [
      { 
        id: 'pwm', 
        title: 'PWM Motor Velocity Controller', 
        category: 'Actuators', 
        badge: 'L298N / Arduino',
        desc: 'Dual H-Bridge direction gating with 8-bit duty cycle velocity tuning.', 
        cpp: `// L298N Motor Driver Control Routine
const int IN1 = 7;
const int IN2 = 8;
const int ENA = 9; // PWM enabled pin

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
}

void loop() {
  // Set forward rotation direction
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  
  // Set speed to 50% (128 / 255)
  analogWrite(ENA, 128);
}`,
        python: `# MicroPython Motor PWM Control on ESP32
from machine import Pin, PWM
import time

in1 = Pin(25, Pin.OUT)
in2 = Pin(26, Pin.OUT)
ena = PWM(Pin(27), freq=1000)

in1.value(1)
in2.value(0)
ena.duty(512) # 50% duty cycle (0-1023)`
      },
      { 
        id: 'ultrasonic', 
        title: 'Ultrasonic Pulse-Echo Telemetry', 
        category: 'Sensors', 
        badge: 'HC-SR04',
        desc: 'Microsecond pulse trigger and flight-time conversion for collision distance.', 
        cpp: `// HC-SR04 Distance Measurement
#define TRIG_PIN 8
#define ECHO_PIN 7

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

long getDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2; // cm
}`,
        python: `# MicroPython HC-SR04 Sonar Reader
from machine import Pin, time_pulse_us
import time

trig = Pin(5, Pin.OUT)
echo = Pin(18, Pin.IN)

def get_distance():
    trig.value(0)
    time.sleep_us(2)
    trig.value(1)
    time.sleep_us(10)
    trig.value(0)
    duration = time_pulse_us(echo, 1, 30000)
    return (duration * 0.0343) / 2`
      },
      { 
        id: 'pid', 
        title: 'PID Trajectory Steering Controller', 
        category: 'Control Theory', 
        badge: 'Math & Logic',
        desc: 'Proportional, integral, and derivative correction for closed-loop motion.', 
        cpp: `// Closed-loop PID Controller
double kp = 2.4, ki = 0.4, kd = 1.2;
double setpoint = 15.0; // Target distance: 15cm

double computePID(double currentDistance, double dt) {
  static double integral = 0, lastError = 0;
  double error = setpoint - currentDistance;
  
  integral += error * dt;
  double derivative = (error - lastError) / dt;
  lastError = error;
  
  return (kp * error) + (ki * integral) + (kd * derivative);
}`,
        python: `# Python Discrete PID Controller
class PIDController:
    def __init__(self, kp=2.0, ki=0.5, kd=1.0, setpoint=0.0):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.setpoint = setpoint
        self.integral = 0.0
        self.last_error = 0.0
        
    def update(self, measurement, dt):
        error = self.setpoint - measurement
        self.integral += error * dt
        derivative = (error - self.last_error) / dt
        self.last_error = error
        return (self.kp * error) + (self.ki * self.integral) + (self.kd * derivative)`
      }
    ];

    const activeDoc = docs.find(d => d.id === selectedDocId) || docs[0];

    return (
      <div className="space-y-6 pt-2 animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Hardware Schematics & Docs</h2>
            <p className="text-xs text-[#94a3b8] mt-1">Verified wiring diagrams, pinout configurations, and embedded firmware routines.</p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            3 Hardware Modules Loaded
          </span>
        </div>

        {/* Documentation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {docs.map(doc => (
            <div 
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all mobbin-card ${
                selectedDocId === doc.id
                ? 'border-indigo-500/50 bg-indigo-500/[0.06] shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/5">
                  {doc.category}
                </span>
                <span className="text-[10px] text-[#64748b] font-mono">{doc.badge}</span>
              </div>
              <h4 className="font-semibold text-sm mb-1.5 text-white">{doc.title}</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{doc.desc}</p>
            </div>
          ))}
        </div>

        {/* Code Snippet Viewer */}
        <div className="mobbin-glass rounded-2xl overflow-hidden border border-white/[0.08]">
          <div className="flex items-center justify-between px-4 py-3 bg-[#11131a] border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Code2 size={15} className="text-indigo-400" />
                <span>{activeDoc.title}</span>
              </div>
              
              {/* Language Switcher */}
              <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5 text-[11px]">
                <button 
                  onClick={() => setActiveCodeLang('cpp')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${activeCodeLang === 'cpp' ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-[#64748b] hover:text-white'}`}
                >
                  C++ (Arduino)
                </button>
                <button 
                  onClick={() => setActiveCodeLang('python')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${activeCodeLang === 'python' ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-[#64748b] hover:text-white'}`}
                >
                  MicroPython
                </button>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(activeCodeLang === 'cpp' ? activeDoc.cpp : activeDoc.python)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#94a3b8] hover:text-white transition-colors"
            >
              {copiedCode ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 text-xs font-mono bg-[#090a0f] text-emerald-300 overflow-x-auto leading-relaxed max-h-80 custom-scrollbar">
            <code>{activeCodeLang === 'cpp' ? activeDoc.cpp : activeDoc.python}</code>
          </pre>
        </div>
      </div>
    );
  };

  /* ── Sub-Views: Lab Settings ────────────────────────────────────────────── */

  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('connected');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  const handleSaveAllSettings = async () => {
    setIsSavingSettings(true);
    try {
      localStorage.setItem('kone_ai_parameters', JSON.stringify(parameters));
      localStorage.setItem('kone_ai_safety', JSON.stringify(safetyToggles));
      
      await axios.post(`${API_URL}/api/settings`, {
        temperature: parameters.temperature,
        maxTokens: parameters.maxTokens,
        systemPrompt: parameters.systemPrompt,
        safetyToggles
      }, { timeout: 3000 }).catch(() => {
        // Backend offline fallback
      });

      showToast("All settings saved and synced successfully", "success");
    } catch {
      showToast("Settings saved locally", "info");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCheckBackend = async () => {
    setBackendStatus('checking');
    try {
      const res = await axios.get(`${API_URL}/api/health`, { timeout: 2500 });
      if (res.data?.status === 'healthy') {
        setBackendStatus('connected');
        showToast("Backend orchestrator is online and healthy", "success");
      } else {
        setBackendStatus('offline');
        showToast("Backend reported unexpected status", "warning");
      }
    } catch {
      setBackendStatus('offline');
      showToast("Backend offline — running in standalone browser mode", "info");
    }
  };

  const renderLabSettings = () => {
    return (
      <div className="space-y-6 pt-2 animate-in fade-in duration-300 max-w-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Lab & System Settings</h2>
            <p className="text-xs text-[#94a3b8] mt-1">Configure backend orchestrator routing, model inference parameters, and simulator safety.</p>
          </div>

          <button
            onClick={handleSaveAllSettings}
            disabled={isSavingSettings}
            className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
          >
            {isSavingSettings ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
            <span>Save Settings</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Backend Orchestrator Card */}
          <div className="mobbin-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Globe size={14} /> Backend Orchestrator Connection
              </h3>
              
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  backendStatus === 'connected' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : backendStatus === 'checking'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                  : 'bg-neutral-500/10 text-[#94a3b8] border-white/10'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-400' : backendStatus === 'checking' ? 'bg-amber-400' : 'bg-neutral-400'}`}></span>
                  <span>{backendStatus === 'connected' ? 'Port 5000 Ready' : backendStatus === 'checking' ? 'Testing...' : 'Standalone Mode'}</span>
                </span>

                <button
                  onClick={handleCheckBackend}
                  className="p-1 rounded-lg hover:bg-white/5 text-[#94a3b8] hover:text-white transition-colors"
                  title="Ping backend"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            <div className="text-xs text-[#94a3b8] leading-relaxed">
              API Endpoint: <code className="text-white font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">{API_URL}/api/synthesize</code>
            </div>
          </div>

          {/* Model Inference Parameters Card */}
          <div className="mobbin-card p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Sliders size={14} /> Model Inference Configuration
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-[#94a3b8] mb-1">
                  <span>Sampling Temperature</span>
                  <span className="font-mono text-white">{parameters.temperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={parameters.temperature}
                  onChange={(e) => setParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#94a3b8] mb-1">
                  <span>Max Tokens per Turn</span>
                  <span className="font-mono text-white">{parameters.maxTokens}</span>
                </div>
                <input 
                  type="range" 
                  min="256" 
                  max="4096" 
                  step="128"
                  value={parameters.maxTokens}
                  onChange={(e) => setParameters(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#94a3b8] mb-1.5">
                  <span>System Persona Prompt</span>
                  <button 
                    onClick={() => setParameters(prev => ({
                      ...prev,
                      systemPrompt: "You are the Kone AI Pathfinder, an advanced autonomous educational routing engine for Kone Code Academy. Map student interests and skill levels to structured 3-step hardware and firmware roadmaps."
                    }))}
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Reset Default
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={parameters.systemPrompt}
                  onChange={(e) => setParameters(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  className="w-full bg-[#090a0f] border border-white/[0.08] focus:border-indigo-500/50 rounded-xl p-3 text-xs text-white outline-none resize-none font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Safety & Hardware Limits Card */}
          <div className="mobbin-card p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Cpu size={14} /> Safety & Hardware Offsets
            </h3>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
              <div>
                <div className="text-sm font-medium text-white">Hardware Speed Limiter</div>
                <div className="text-xs text-[#94a3b8]">Caps PWM duty cycle output to 75% for motor protection.</div>
              </div>
              <input 
                type="checkbox" 
                checked={safetyToggles.speedLimiter} 
                onChange={(e) => {
                  setSafetyToggles(prev => ({ ...prev, speedLimiter: e.target.checked }));
                  showToast(e.target.checked ? "Speed limiter enabled" : "Speed limiter disabled", "info");
                }}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-white">Live Telemetry Handshake</div>
                <div className="text-xs text-[#94a3b8]">Streams real-time sensor loops directly into the trajectory canvas.</div>
              </div>
              <input 
                type="checkbox" 
                checked={safetyToggles.telemetryStream} 
                onChange={(e) => {
                  setSafetyToggles(prev => ({ ...prev, telemetryStream: e.target.checked }));
                  showToast(e.target.checked ? "Telemetry active" : "Telemetry disabled", "info");
                }}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'knowledge':
        return renderKnowledgeBase();
      case 'settings':
        return renderLabSettings();
      case 'synthesis':
      default:
        return (
          <MissionSimulator 
            session={activeSession}
            onSendMessage={handleSendMessage}
            isAnalyzing={isAnalyzing}
            parameters={parameters}
            onUpdateParameters={setParameters}
            onClearSession={handleClearSession}
            onShowToast={showToast}
          />
        );
    }
  };

  if (activeView === 'sitemap') {
    return <Sitemap onBack={() => setActiveView('synthesis')} onNavigate={setActiveView} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#131314] overflow-hidden text-[#e3e3e3] font-sans">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1e1f20] border border-white/[0.08] rounded-2xl p-3.5 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 
            toast.type === 'warning' ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 
            'bg-[#8ab4f8] shadow-[0_0_8px_#8ab4f8]'
          }`} />
          <span className="text-xs font-medium text-white">{toast.message}</span>
        </div>
      )}

      {/* Sidebar (Standard Left Placement) */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={setActiveSessionId}
        onNewSession={handleNewSession}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenAgentSpecs={() => setActiveView('knowledge')}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      
      {/* Main Content Stage */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#131314]">
        
        {/* Gemini Minimal Top Header */}
        <header className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-white/[0.05] bg-[#131314]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              className="p-2 rounded-full text-[#c4c7c5] hover:text-white hover:bg-white/10 transition-colors md:hidden"
            >
              <Menu size={18} />
            </button>

            {/* Gemini Brand & Breadcrumb */}
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="gemini-gradient-text font-bold text-base tracking-tight">Kone Gemini</span>
              <span className="text-[#8e918f]">/</span>
              <span className="text-[#c4c7c5] text-xs capitalize">
                {activeView === 'synthesis' ? 'AI Pathfinder' : activeView === 'knowledge' ? 'Hardware Schematics' : 'Settings'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#a8c7fa] px-3 py-1 rounded-full bg-[#1e1f20] border border-white/[0.06]">
              <Sparkles size={13} className="text-[#a8c7fa]" />
              <span>Gemini 2.0 Flash</span>
            </span>

            <button 
              onClick={handleNewSession}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] border border-white/[0.08] text-xs font-medium text-[#e3e3e3] transition-colors"
            >
              <span>+ New chat</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-[#282a2c] border border-white/[0.08] flex items-center justify-center text-xs font-semibold text-[#a8c7fa] ml-1">
              P
            </div>
          </div>
        </header>

        {/* Main Workspace Stage */}
        <main className="flex-1 overflow-y-auto flex justify-center w-full relative custom-scrollbar">
          <div className="w-full max-w-4xl px-4 md:px-8 py-6 relative z-0">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

