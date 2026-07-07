import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MissionSimulator from './components/MissionSimulator';
import { 
  MoreVertical, 
  Database, 
  Settings, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Sliders, 
  FileCode, 
  Play, 
  Check, 
  ShieldAlert, 
  Cpu, 
  Globe 
} from 'lucide-react';
import axios from 'axios';
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

interface PlaceholderViewProps {
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  buttonText: string;
  onAction: () => void;
  isLoading: boolean;
  loadingText: string;
}

/* ── Helper Component: PlaceholderView ────────────────── */

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ 
  title, 
  icon: Icon, 
  description, 
  buttonText, 
  onAction, 
  isLoading, 
  loadingText 
}) => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#BC00FF]/20 to-[#00D1FF]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <Icon size={40} className={`text-[#BC00FF] relative z-10 ${isLoading ? 'animate-spin-slow text-[#00D1FF]' : ''}`} />
    </div>
    <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{title}</h2>
    <p className="text-[#9ca3af] max-w-md font-mono text-sm uppercase tracking-wider mb-8">{description}</p>
    
    <button 
      onClick={onAction}
      disabled={isLoading}
      className={`px-6 py-2.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
        isLoading 
        ? 'bg-white/5 border border-white/5 text-[#9ca3af] cursor-not-allowed'
        : 'bg-[#BC00FF]/20 hover:bg-[#BC00FF]/30 border border-[#BC00FF]/50 text-[#e3e3e3] hover:text-white'
      }`}
    >
      {isLoading && <RefreshCw size={14} className="animate-spin" />}
      {isLoading ? loadingText : buttonText}
    </button>
  </div>
);

/* ── Main Component ───────────────────────────────────── */

function App() {
  const [activeView, setActiveView] = useState<string>('synthesis');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // AI Parameters State
  const [parameters, setParameters] = useState<AIParameters>({
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "You are the Kone AI Pathfinder, an advanced autonomous educational routing engine..."
  });

  // Knowledge Base State
  const [kbInitialized, setKbInitialized] = useState<boolean>(false);
  const [kbLoading, setKbLoading] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Settings State
  const [settingsSynced, setSettingsSynced] = useState<boolean>(false);
  const [settingsSyncing, setSettingsSyncing] = useState<boolean>(false);
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
      name: 'Alex - Level 2 Trajectory',
      messages: [
        { role: 'user', content: 'Design a path for Alex interested in robotics.' },
        { 
          role: 'ai', 
          content: 'I have synthesized a robotics path for Alex. We start with basic motor loops, connect it to sensor inputs, and finish with a remote-controlled capstone.',
          logicTrace: [
            'Parsing student profile: Alex (Robotics, Beginner)',
            'Selecting core module: Arduino IoT',
            'Cross-checking prerequisites: Basic Logic',
            'Structuring capstone: Autonomous Maze Solver',
            'Synthesis output formatted successfully.'
          ],
          roadmap: [
            { tag: 'Logic', name: 'Motor Control Master', reason: 'To understand basic PWM signals and motor driver control.' },
            { tag: 'Engineering', name: 'Ultrasonic Sensor Integration', reason: 'To add distance feedback and collision avoidance.' },
            { tag: 'Intelligence', name: 'Autonomous Maze Solver', reason: 'Final integration of sensor inputs and directional logic.' }
          ],
          activeProvider: 'gemini-flash'
        }
      ]
    },
    {
      id: 'motor-optimization',
      name: "Optimizing 'Motor Master' Loop",
      messages: [
        { role: 'user', content: "Show me the C++ code to run a DC motor at 50% speed." },
        {
          role: 'ai',
          content: "Here is the C++ script to run your DC motor at 50% duty cycle using PWM on pin 9:",
          logicTrace: [
            'Detecting language: C++',
            'Mapping hardware pinout: Pin 9 (PWM)',
            'Calculating duty cycle: 50% = 127/255'
          ],
          roadmap: [
            { tag: 'C/C++', name: 'analogWrite(9, 127)', reason: 'Outputs a 50% duty cycle square wave on pin 9.' }
          ],
          activeProvider: 'gemini-pro'
        }
      ]
    },
    {
      id: 'sensor-calibration',
      name: 'Neural Gap Detection - Sensors',
      messages: []
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('alex-robotics');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  /* ── Handler Actions ──────────────────────────────────── */

  const handleSendMessage = async (text: string, provider: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: MessageItem = { role: 'user', content: text };
    
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    }));

    setIsAnalyzing(true);

    try {
      // 2. Fetch from backend server
      const response = await axios.post('http://localhost:5000/api/synthesize', {
        query: text,
        provider,
        temperature: parameters.temperature,
        maxTokens: parameters.maxTokens
      });

      const data = response.data;
      
      const aiMsg: MessageItem = {
        role: 'ai',
        logicTrace: data.logicTrace,
        content: data.message,
        roadmap: data.roadmap,
        activeProvider: provider
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          // Auto-rename empty session name to match query if it was named generic
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
      console.error("Synthesis failed:", error);
      const errorMsg = error.response?.data?.error || "Connection to AI Core failed. Please verify API keys in server/.env.";
      const aiMsg: MessageItem = {
        role: 'ai',
        logicTrace: ["Connection to AI Core failed.", "Verifying configuration..."],
        content: `Error: ${errorMsg}`,
        roadmap: null,
        activeProvider: provider
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, aiMsg] };
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
      name: `New Session ${sessions.length + 1}`,
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveView('synthesis');
  };

  const handleClearSession = () => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [] };
      }
      return s;
    }));
  };

  const handleInitializeKB = () => {
    setKbLoading(true);
    setTimeout(() => {
      setKbLoading(false);
      setKbInitialized(true);
    }, 1500);
  };

  const handleSyncSettings = () => {
    setSettingsSyncing(true);
    setTimeout(() => {
      setSettingsSyncing(false);
      setSettingsSynced(true);
    }, 1500);
  };

  /* ── Sub-Views Rendering ──────────────────────────────── */

  const renderKnowledgeBase = () => {
    if (!kbInitialized) {
      return (
        <PlaceholderView 
          title="Knowledge Base" 
          icon={Database} 
          description="Core repository for hardware schematics and mission logic." 
          buttonText="Initialize Module"
          onAction={handleInitializeKB}
          isLoading={kbLoading}
          loadingText="Mounting filesystems..."
        />
      );
    }

    const docs = [
      { id: 'pwm', title: 'PWM Speed Control schematics', tag: 'Hardware', desc: 'Wiring diagrams for L298N and Arduino Uno.', code: '// PWM output on pin 9\nint enablePin = 9;\nvoid setup() {\n  pinMode(enablePin, OUTPUT);\n}\nvoid loop() {\n  analogWrite(enablePin, 127); // 50% Speed\n}' },
      { id: 'ultrasonic', title: 'Ultrasonic Distance feedback loops', tag: 'Sensors', desc: 'Triggers pulse on HC-SR04 and reads echo duration.', code: '#define TRIG 8\n#define ECHO 7\nlong readDistance() {\n  digitalWrite(TRIG, LOW); delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH); delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  return pulseIn(ECHO, HIGH) * 0.034 / 2;\n}' },
      { id: 'pid', title: 'Proportional-Integral-Derivative trajectory', tag: 'Algorithms', desc: 'PID loop for path alignment & smooth velocity tuning.', code: 'double kp = 2.0, ki = 0.5, kd = 1.0;\ndouble computePID(double error) {\n  static double integral, lastError;\n  double derivative = error - lastError;\n  integral += error;\n  lastError = error;\n  return kp*error + ki*integral + kd*derivative;\n}' }
    ];

    const activeDoc = docs.find(d => d.id === selectedDoc) || docs[0];

    return (
      <div className="space-y-6 pt-4 animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Core Schematics & Guides</h2>
            <p className="text-xs font-mono text-[#9ca3af] uppercase tracking-wider mt-1">Mounted: /dev/sda1 → /mnt/knowledge</p>
          </div>
          <button 
            onClick={() => setKbInitialized(false)}
            className="text-xs font-mono text-[#BC00FF] hover:underline"
          >
            [Unmount]
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {docs.map(doc => (
            <div 
              key={doc.id}
              onClick={() => setSelectedDoc(doc.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedDoc === doc.id || (!selectedDoc && doc.id === 'pwm')
                ? 'bg-[#BC00FF]/10 border-[#BC00FF]/50 shadow-[0_0_12px_rgba(188,0,255,0.15)]'
                : 'bg-[#121316] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#00D1FF]">{doc.tag}</span>
                {selectedDoc === doc.id && <Check size={14} className="text-[#BC00FF]" />}
              </div>
              <h4 className="font-semibold text-sm mb-1 text-white">{doc.title}</h4>
              <p className="text-[12px] text-[#9ca3af]">{doc.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#121316] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-[#00D1FF] font-mono text-xs uppercase tracking-widest border-b border-white/5 pb-3">
            <FileCode size={16} />
            <span>Target Source Code: {activeDoc.title}</span>
          </div>
          <pre className="text-xs font-mono bg-black/30 p-4 rounded-lg text-green-400 overflow-x-auto leading-relaxed border border-white/5">
            <code>{activeDoc.code}</code>
          </pre>
        </div>
      </div>
    );
  };

  const renderLabSettings = () => {
    if (!settingsSynced) {
      return (
        <PlaceholderView 
          title="Lab Settings" 
          icon={Settings} 
          description="Configure hardware offsets, API routing, and AI safety protocols." 
          buttonText="Sync Core Settings"
          onAction={handleSyncSettings}
          isLoading={settingsSyncing}
          loadingText="Connecting local nodes..."
        />
      );
    }

    return (
      <div className="space-y-6 pt-4 animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Telemetry & API Options</h2>
            <p className="text-xs font-mono text-[#9ca3af] uppercase tracking-wider mt-1">Core Hardware Handshake: ONLINE</p>
          </div>
          <button 
            onClick={() => setSettingsSynced(false)}
            className="text-xs font-mono text-[#BC00FF] hover:underline"
          >
            [Disconnect]
          </button>
        </div>

        <div className="bg-[#121316] border border-white/5 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#00D1FF] flex items-center gap-2 mb-4">
                <Cpu size={16} /> Device Limits
              </h3>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white">Hardware Speed Limiter</div>
                  <div className="text-xs text-[#9ca3af]">Caps motor speed at 75% duty cycle.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={safetyToggles.speedLimiter} 
                  onChange={(e) => setSafetyToggles(prev => ({ ...prev, speedLimiter: e.target.checked }))}
                  className="w-4 h-4 accent-[#BC00FF]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white">Telemetry Streaming</div>
                  <div className="text-xs text-[#9ca3af]">Streams live diagnostic loops to UI.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={safetyToggles.telemetryStream} 
                  onChange={(e) => setSafetyToggles(prev => ({ ...prev, telemetryStream: e.target.checked }))}
                  className="w-4 h-4 accent-[#BC00FF]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#00D1FF] flex items-center gap-2 mb-4">
                <Sliders size={16} /> Model Constraints
              </h3>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white">Grounded Search</div>
                  <div className="text-xs text-[#9ca3af]">Forces AI to source from local KB.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={safetyToggles.groundedSearch} 
                  onChange={(e) => setSafetyToggles(prev => ({ ...prev, groundedSearch: e.target.checked }))}
                  className="w-4 h-4 accent-[#BC00FF]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white">Verbose Engine Logging</div>
                  <div className="text-xs text-[#9ca3af]">Prints raw model API output to console.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={safetyToggles.verboseLogs} 
                  onChange={(e) => setSafetyToggles(prev => ({ ...prev, verboseLogs: e.target.checked }))}
                  className="w-4 h-4 accent-[#BC00FF]"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
            <ShieldAlert className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-yellow-500 leading-relaxed font-mono">
              [WARNING] Bypassing limits or enabling verbose output might increase response latency and expose raw hardware instruction structures.
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
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden text-[#e3e3e3] font-sans selection:bg-purple-500/30 flex-row-reverse">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={setActiveSessionId}
        onNewSession={handleNewSession}
      />
      
      <div className="flex-1 flex flex-col h-full relative">
        <header className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#BC00FF] to-[#00D1FF] p-[1px]">
               <div className="w-full h-full bg-[#0a0a0c] rounded-[11px] flex items-center justify-center">
                 <img src="/app-ai.svg" alt="Kone AI" className="w-5 h-5" />
               </div>
             </div>
             <div className="text-[20px] font-semibold tracking-tight bg-gradient-to-r from-[#BC00FF] to-[#00D1FF] bg-clip-text text-transparent cursor-pointer" onClick={() => { setActiveView('synthesis'); }}>Kone AI</div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 text-[#9ca3af] text-[11px] font-mono uppercase tracking-widest border-r border-white/10 pr-6 mr-2">
                <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span>Secure Core</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <Zap size={14} className="text-yellow-500" />
                    <span>98ms Latency</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="text-[#9ca3af] hover:bg-white/10 p-2 rounded-lg transition-colors hidden md:block">
                <span className="text-xs font-mono bg-[#121316] border border-white/10 px-3 py-1.5 rounded-lg text-[#00D1FF]">v1.0.beta</span>
                </button>
                <button className="p-2 text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <MoreVertical size={20} />
                </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto flex justify-center w-full relative custom-scrollbar">
            {/* Animated Mesh Background simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none"></div>
            
            <div className="w-full max-w-4xl px-4 pb-48 pt-24 md:pt-28 relative z-0">
               {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;
