import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Settings2, 
  Send, 
  Sparkles, 
  Cpu, 
  Crown, 
  Atom, 
  RefreshCw, 
  Trash2, 
  Check, 
  Layers,
  Clock,
  Wrench,
  Bot,
  User,
  ArrowRight,
  Database,
  SlidersHorizontal,
  CheckCircle2,
  BrainCircuit,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session, AIParameters } from '../App';

interface MissionSimulatorProps {
  session: Session;
  onSendMessage: (text: string, provider: string) => void;
  isAnalyzing: boolean;
  parameters: AIParameters;
  onUpdateParameters: React.Dispatch<React.SetStateAction<AIParameters>>;
  onClearSession: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

interface ProviderItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  desc: string;
  tag: string;
  badge?: string;
}

type DBStatus = 'offline' | 'connecting' | 'online';

const MissionSimulator: React.FC<MissionSimulatorProps> = ({
  session,
  onSendMessage,
  isAnalyzing,
  parameters,
  onUpdateParameters,
  onClearSession,
  onShowToast
}) => {
  const [input, setInput] = useState<string>('');
  const [showThinking, setShowThinking] = useState<boolean>(true);
  const [provider, setProvider] = useState<string>('gemini-flash'); 
  const [showProviderMenu, setShowProviderMenu] = useState<boolean>(false);
  const [showParameters, setShowParameters] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DBStatus>('online');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isAnalyzing]);

  const providers: ProviderItem[] = [
    { id: 'gemini-flash', name: 'Gemini 2.0 Flash', icon: <Sparkles size={14} className="text-amber-400" />, desc: 'Fast multimodal reasoning', tag: 'Fast' },
    { id: 'claude-sonnet', name: 'Claude 3.7 Sonnet', icon: <Crown size={14} className="text-orange-400" />, desc: 'Hybrid reasoning & architecture', tag: 'Reasoning' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', icon: <BrainCircuit size={14} className="text-blue-400" />, desc: 'Open-weight deep thinking', tag: 'Thinking' },
    { id: 'gpt-4o', name: 'GPT-4o', icon: <Cpu size={14} className="text-emerald-400" />, desc: 'Omni intelligence', tag: 'Flagship' },
  ];

  const quickPrompts = [
    {
      title: "Autonomous Robotics Trajectory",
      query: "Design a comprehensive 3-stage robotics roadmap for beginner students with Arduino, PWM motor drivers, and ultrasonic sensors."
    },
    {
      title: "ESP32 Agro-Telemetry Mesh",
      query: "Architect a solar-powered ESP32 sensor node firmware measuring soil volumetric water content and ambient temperature."
    },
    {
      title: "PID Motor Velocity Controller",
      query: "Write a complete PID control algorithm in C++ for dual DC gearmotors with optical encoder feedback."
    }
  ];

  const handleGenerate = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isAnalyzing) return;
    onSendMessage(text, provider);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isAnalyzing) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleToggleDB = () => {
    if (dbStatus === 'offline') {
      setDbStatus('connecting');
      onShowToast("Connecting to local telemetry database...", "info");
      setTimeout(() => {
        setDbStatus('online');
        onShowToast("Local telemetry database online.", "success");
      }, 800);
    } else {
      setDbStatus('offline');
      onShowToast("Local database offline.", "warning");
    }
  };

  return (
    <div className="w-full flex flex-col h-full relative">
      <div className="flex-1 space-y-8 pb-40 overflow-y-auto custom-scrollbar">
        
        {/* Empty State / Welcome Screen */}
        {session.messages.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(99,102,241,0.15)]">
              <Compass size={28} className="text-indigo-400" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              Where would you like to begin?
            </h2>
            <p className="text-sm text-[#94a3b8] max-w-lg mb-10 leading-relaxed font-normal">
              Synthesize tailored STEM trajectories, architect hardware schematics, or simulate IoT agricultural sensor networks.
            </p>

            {/* Quick-Start Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl text-left">
              {quickPrompts.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleGenerate(item.query)}
                  className="p-4 rounded-xl mobbin-card cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors block mb-1.5">
                      {item.title}
                    </span>
                    <p className="text-xs text-[#94a3b8] line-clamp-2 leading-relaxed">
                      {item.query}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-400 font-medium opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>Synthesize path</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversational Stream */}
        {session.messages.map((msg, idx) => (
          <div key={idx} className="space-y-6">
            {msg.role === 'user' ? (
              /* User Query */
              <div className="flex items-start gap-3.5 pt-2">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white">
                  <User size={15} className="text-white/80" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">You</span>
                    <span className="text-[11px] text-[#64748b]">Prompt Query</span>
                  </div>
                  <div className="text-[15px] font-medium text-white leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            ) : (
              /* Assistant Response */
              <div className="flex items-start gap-3.5 pt-2 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-indigo-400">
                  <Bot size={16} />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Kone AI Pathfinder</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[#94a3b8]">
                      {providers.find(p => p.id === msg.activeProvider)?.name || 'Gemini 2.0 Flash'}
                    </span>
                  </div>

                  {/* Thinking & Logic Reasoning Accordion (Claude 3.7 / DeepSeek style) */}
                  {msg.logicTrace && msg.logicTrace.length > 0 && (
                    <div className="border border-white/[0.08] bg-white/[0.02] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowThinking(!showThinking)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-[#94a3b8] hover:text-white hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BrainCircuit size={14} className="text-indigo-400" />
                          <span className="font-medium text-white/90">Reasoning Process</span>
                          <span className="text-[11px] text-[#64748b]">· {msg.logicTrace.length} validation steps</span>
                        </div>
                        {showThinking ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <AnimatePresence>
                        {showThinking && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/[0.06] px-4 py-3 bg-black/20 text-xs text-[#94a3b8] space-y-2 font-mono"
                          >
                            {msg.logicTrace.map((step, i) => (
                              <div key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>{step}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Markdown Response Prose */}
                  <div className="text-[15px] text-[#cbd5e1] leading-relaxed">
                    <p>{msg.content}</p>
                  </div>

                    {/* Linear-Style Synthesized Roadmap Cards */}
                  {msg.roadmap && msg.roadmap.length > 0 && (
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
                          <Layers size={14} className="text-indigo-400" />
                          <span>Curriculum Pathway · {msg.roadmap.length} Milestones</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {msg.roadmap.map((item, i) => (
                          <div 
                            key={i} 
                            className="mobbin-card p-4 rounded-xl flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                  Stage 0{i+1}
                                </span>
                                <span className="text-[11px] text-[#64748b] flex items-center gap-1 font-mono">
                                  <Clock size={11} /> {item.tag}
                                </span>
                              </div>
                              <h4 className="font-semibold text-white text-sm mb-1.5 leading-snug">
                                {item.name}
                              </h4>
                              <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">
                                {item.reason}
                              </p>
                            </div>

                            <button 
                              onClick={() => handleGenerate(`Provide detailed code and step-by-step guidance for Stage 0${i+1}: ${item.name}`)}
                              className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/90 transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                            >
                              <span>Explore Stage</span>
                              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Question Chips (Perplexity / ChatGPT style) */}
                  {idx === session.messages.length - 1 && !isAnalyzing && (
                    <div className="pt-3 flex flex-wrap items-center gap-2 animate-in fade-in duration-300">
                      <span className="text-[11px] text-[#64748b] font-medium mr-1">Suggested Next Steps:</span>
                      {[
                        "⚡ Show full C++ Arduino code routine",
                        "🔌 Show circuit wiring & pinout table",
                        "🧪 How do I test and debug this with hardware?"
                      ].map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleGenerate(promptText)}
                          className="text-[11px] font-medium text-[#94a3b8] hover:text-white bg-white/5 hover:bg-white/10 border border-white/[0.08] hover:border-indigo-500/30 px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-98"
                        >
                          {promptText}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Generating Indicator */}
        {isAnalyzing && (
          <div className="flex items-start gap-3.5 pt-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400">
              <RefreshCw size={14} className="animate-spin" />
            </div>
            <div className="flex items-center gap-2 pt-1.5">
              <span className="text-xs font-medium text-indigo-300 animate-pulse">
                Synthesizing reasoning & trajectory...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Mobbin-Grade Command Dock (Linear / Perplexity Style) */}
      <div className="fixed bottom-0 md:right-[280px] left-0 right-0 p-3 md:p-6 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/90 to-transparent pointer-events-none z-40">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto relative">
          
          {/* Hyperparameters Modal */}
          <AnimatePresence>
            {showParameters && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute bottom-full left-0 mb-3 w-80 mobbin-glass rounded-2xl p-4 z-50 text-left text-xs space-y-4"
              >
                <div className="flex justify-between items-center border-b border-white/[0.08] pb-2.5">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <SlidersHorizontal size={14} className="text-indigo-400" />
                    <span>Engine Parameters</span>
                  </div>
                  <button 
                    onClick={() => setShowParameters(false)}
                    className="text-[#94a3b8] hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[#94a3b8] mb-1">
                      <span>Temperature</span>
                      <span className="font-mono text-white">{parameters.temperature}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={parameters.temperature}
                      onChange={(e) => onUpdateParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[#94a3b8] mb-1">
                      <span>Max Tokens</span>
                      <span className="font-mono text-white">{parameters.maxTokens}</span>
                    </div>
                    <input 
                      type="range" 
                      min="256" 
                      max="4096" 
                      step="128"
                      value={parameters.maxTokens}
                      onChange={(e) => onUpdateParameters(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      className="w-full accent-indigo-500 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Model Selector Dropdown */}
          <AnimatePresence>
            {showProviderMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute bottom-full left-0 mb-3 w-72 mobbin-glass rounded-2xl p-1.5 z-50 overflow-hidden"
              >
                <div className="px-3 py-2 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider border-b border-white/[0.06]">
                  Select AI Model
                </div>
                <div className="py-1 space-y-0.5">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProvider(p.id);
                        setShowProviderMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs ${
                        provider === p.id 
                        ? 'bg-indigo-500/15 text-white border border-indigo-500/30' 
                        : 'text-[#94a3b8] hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {p.icon}
                        <div className="text-left">
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-[11px] text-[#64748b]">{p.desc}</div>
                        </div>
                      </div>
                      {provider === p.id && <Check size={14} className="text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Command Bar Container */}
          <div className="mobbin-glass rounded-2xl p-2.5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
            
            {/* Input Row */}
            <div className="flex items-center px-3 pt-1 pb-2">
              <input 
                id="ai-query-input"
                name="aiQuery"
                aria-label="Ask Kone AI"
                type="text" 
                placeholder={`Ask Kone AI or synthesize trajectory via ${providers.find(p => p.id === provider)?.name}...`} 
                className="w-full bg-transparent border-none text-white text-sm outline-none placeholder:text-[#64748b]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnalyzing}
              />
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between px-2 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                {/* Model Selector Pill */}
                <button 
                  onClick={() => setShowProviderMenu(!showProviderMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors border border-white/[0.06] bg-white/[0.02]"
                >
                  {providers.find(p => p.id === provider)?.icon}
                  <span className="font-medium text-white/90">{providers.find(p => p.id === provider)?.name}</span>
                  <ChevronUp size={13} className={showProviderMenu ? '' : 'rotate-180'} />
                </button>

                {/* Hyperparameters Button */}
                <button 
                  onClick={() => setShowParameters(!showParameters)}
                  className={`p-1.5 rounded-lg text-xs transition-colors border ${
                    showParameters 
                    ? 'bg-indigo-500/20 text-white border-indigo-500/30' 
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/5 border-white/[0.06] bg-white/[0.02]'
                  }`}
                  title="Tune Temperature & Tokens"
                >
                  <SlidersHorizontal size={14} />
                </button>

                {/* Telemetry Database Sync Pill */}
                <button 
                  onClick={handleToggleDB}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                    dbStatus === 'online'
                    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                    : 'text-[#64748b] border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'online' ? 'bg-emerald-400' : 'bg-neutral-500'}`}></div>
                  <span>{dbStatus === 'online' ? 'Local DB Online' : 'DB Offline'}</span>
                </button>
              </div>

              {/* Action Buttons: Clear & Send */}
              <div className="flex items-center gap-1.5">
                {session.messages.length > 0 && (
                  <button 
                    onClick={onClearSession}
                    className="p-1.5 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Clear current session"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <button 
                  onClick={() => handleGenerate()}
                  disabled={isAnalyzing || !input.trim()}
                  aria-label="Send Query"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isAnalyzing || !input.trim()
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-neutral-200 shadow-md scale-100 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Send size={14} className="translate-x-0.5 -translate-y-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSimulator;

