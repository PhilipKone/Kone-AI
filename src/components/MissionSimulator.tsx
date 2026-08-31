import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Sparkles, 
  Cpu, 
  Crown, 
  RefreshCw, 
  Trash2, 
  Check, 
  Layers,
  Clock,
  User,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  BrainCircuit,
  Lightbulb,
  Code2,
  Zap,
  Microscope,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2,
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
}

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
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [likedIdxs, setLikedIdxs] = useState<Record<number, 'up' | 'down'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isAnalyzing]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const providers: ProviderItem[] = [
    { id: 'gemini-flash', name: 'Gemini 2.0 Flash', icon: <Sparkles size={14} className="text-[#a8c7fa]" />, desc: 'Fast multimodal reasoning', tag: 'Default' },
    { id: 'claude-sonnet', name: 'Claude 3.7 Sonnet', icon: <Crown size={14} className="text-orange-400" />, desc: 'Hybrid reasoning & architecture', tag: 'Reasoning' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', icon: <BrainCircuit size={14} className="text-blue-400" />, desc: 'Open-weight deep thinking', tag: 'Thinking' },
    { id: 'gpt-4o', name: 'GPT-4o', icon: <Cpu size={14} className="text-emerald-400" />, desc: 'Omni intelligence', tag: 'Flagship' },
  ];

  const quickPrompts = [
    {
      category: "Brainstorm Trajectory",
      icon: <Lightbulb size={18} className="text-amber-400" />,
      title: "Autonomous Robotics Pathway",
      query: "Design a comprehensive 3-stage robotics roadmap for beginner students with Arduino, PWM motor drivers, and ultrasonic sensors."
    },
    {
      category: "Embedded Firmware",
      icon: <Code2 size={18} className="text-[#a8c7fa]" />,
      title: "PID Motor Velocity Routine",
      query: "Write a complete PID control algorithm in C++ Arduino for dual DC gearmotors with optical encoder feedback."
    },
    {
      category: "Hardware Circuit",
      icon: <Zap size={18} className="text-emerald-400" />,
      title: "ESP32 Agro-Telemetry Mesh",
      query: "Architect a solar-powered ESP32 sensor node firmware measuring soil volumetric water content and ambient temperature."
    },
    {
      category: "Hardware Debug",
      icon: <Microscope size={18} className="text-purple-400" />,
      title: "Motor Back-EMF Protection",
      query: "How do I calculate flyback diode ratings and bypass capacitor values to eliminate motor noise on a 5V microcontroller rail?"
    }
  ];

  const handleGenerate = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isAnalyzing) return;
    onSendMessage(text, provider);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isAnalyzing) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    onShowToast("Response copied to clipboard", "success");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleToggleLike = (idx: number, type: 'up' | 'down') => {
    setLikedIdxs(prev => ({
      ...prev,
      [idx]: prev[idx] === type ? undefined! : type
    }));
    onShowToast(type === 'up' ? "Thanks for your feedback!" : "Feedback recorded", "info");
  };

  return (
    <div className="w-full flex flex-col h-full relative">
      <div className="flex-1 space-y-8 pb-48 overflow-y-auto custom-scrollbar">
        {session.messages.length === 0 && (
          <div className="py-10 md:py-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                <span className="gemini-gradient-text">Hello, Innovator</span>
              </h1>
              <p className="text-2xl md:text-4xl font-semibold text-[#8e918f] tracking-tight">
                How can I help you build today?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full text-left mt-4">
              {quickPrompts.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleGenerate(item.query)}
                  className="p-4 rounded-2xl gemini-card cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] flex-shrink-0 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-medium text-[#8e918f] block mb-0.5">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-semibold text-[#e3e3e3] group-hover:text-[#a8c7fa] transition-colors mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#c4c7c5] line-clamp-2 leading-relaxed">
                        {item.query}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-end gap-1 text-[11px] text-[#a8c7fa] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore with Gemini</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.messages.map((msg, idx) => (
          <div key={idx} className="space-y-6">
            {msg.role === 'user' ? (
              <div className="flex items-start justify-end gap-3 pt-2">
                <div className="max-w-2xl bg-[#282a2c] text-[#e3e3e3] px-4 py-3 rounded-2xl rounded-tr-sm text-sm md:text-[15px] font-normal leading-relaxed border border-white/[0.04]">
                  {msg.content}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#3c4043] flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white">
                  <User size={15} className="text-[#c4c7c5]" />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3.5 pt-2 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285f4]/20 via-[#9b72cb]/20 to-[#d96570]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-[#a8c7fa]" />
                </div>
                <div className="flex-1 space-y-4 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#c4c7c5]">Gemini</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.06] text-[#8e918f]">
                      {providers.find(p => p.id === msg.activeProvider)?.name || 'Gemini 2.0 Flash'}
                    </span>
                  </div>
                  {msg.logicTrace && msg.logicTrace.length > 0 && (
                    <div className="border border-white/[0.08] bg-[#1e1f20]/60 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setShowThinking(!showThinking)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-[#8e918f] hover:text-[#e3e3e3] hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BrainCircuit size={14} className="text-[#a8c7fa]" />
                          <span className="font-medium text-[#e3e3e3]">Thinking Process</span>
                          <span className="text-[11px] text-[#8e918f]">· {msg.logicTrace.length} validation steps</span>
                        </div>
                        {showThinking ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <AnimatePresence>
                        {showThinking && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/[0.06] px-4 py-3 bg-[#131314]/50 text-xs text-[#c4c7c5] space-y-2 font-mono"
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
                  <div className="text-[15px] text-[#e3e3e3] leading-relaxed">
                    <p>{msg.content}</p>
                  </div>
                  {msg.roadmap && msg.roadmap.length > 0 && (
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#8e918f] uppercase tracking-wider">
                        <Layers size={14} className="text-[#a8c7fa]" />
                        <span>Curriculum Trajectory · {msg.roadmap.length} Milestones</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {msg.roadmap.map((item, i) => (
                          <div 
                            key={i} 
                            className="gemini-card p-4 rounded-xl flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#a8c7fa]/10 text-[#a8c7fa] border border-[#a8c7fa]/20">
                                  Stage 0{i+1}
                                </span>
                                <span className="text-[11px] text-[#8e918f] flex items-center gap-1 font-mono">
                                  <Clock size={11} /> {item.tag}
                                </span>
                              </div>
                              <h4 className="font-semibold text-[#e3e3e3] text-sm mb-1.5 leading-snug">
                                {item.name}
                              </h4>
                              <p className="text-xs text-[#c4c7c5] leading-relaxed mb-4">
                                {item.reason}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleGenerate(`Provide detailed code and step-by-step guidance for Stage 0${i+1}: ${item.name}`)}
                              className="w-full py-1.5 px-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-[#e3e3e3] transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                            >
                              <span>Explore Stage</span>
                              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform text-[#a8c7fa]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleLike(idx, 'up')}
                        className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
                          likedIdxs[idx] === 'up' ? 'text-[#a8c7fa] bg-[#a8c7fa]/10' : 'text-[#8e918f]'
                        }`}
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleLike(idx, 'down')}
                        className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
                          likedIdxs[idx] === 'down' ? 'text-red-400 bg-red-400/10' : 'text-[#8e918f]'
                        }`}
                      >
                        <ThumbsDown size={14} />
                      </button>
                      <button
                        onClick={() => handleCopyMessage(msg.content, idx)}
                        className="p-1.5 rounded-full text-[#8e918f] hover:text-[#e3e3e3] hover:bg-white/10 transition-colors"
                      >
                        {copiedIdx === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => onShowToast("Trajectory link copied to share", "info")}
                        className="p-1.5 rounded-full text-[#8e918f] hover:text-[#e3e3e3] hover:bg-white/10 transition-colors"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleGenerate(session.messages[idx - 1]?.content || msg.content)}
                      className="text-[11px] text-[#8e918f] hover:text-[#e3e3e3] flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
                    >
                      <RefreshCw size={12} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  {idx === session.messages.length - 1 && !isAnalyzing && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 animate-in fade-in duration-300">
                      <span className="text-[11px] text-[#8e918f] font-medium mr-1">Suggested:</span>
                      {[
                        "⚡ Show full C++ Arduino code routine",
                        "🔌 Show circuit wiring & pinout table",
                        "🧪 How do I test and debug this with hardware?"
                      ].map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleGenerate(promptText)}
                          className="text-[11px] font-medium text-[#c4c7c5] hover:text-white bg-[#1e1f20] hover:bg-[#282a2c] border border-white/[0.08] hover:border-[#8ab4f8]/40 px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-98"
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

        {isAnalyzing && (
          <div className="flex items-start gap-3.5 pt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285f4]/30 via-[#9b72cb]/30 to-[#d96570]/30 border border-white/10 flex items-center justify-center flex-shrink-0 animate-spin">
              <Sparkles size={16} className="text-[#a8c7fa]" />
            </div>
            <div className="flex items-center gap-2 pt-1.5">
              <span className="text-xs font-medium text-[#a8c7fa] animate-pulse">
                Gemini is thinking...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 md:right-[260px] left-0 right-0 p-3 md:p-6 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent pointer-events-none z-40">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto relative">
          <AnimatePresence>
            {showParameters && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute bottom-full left-0 mb-3 w-80 bg-[#1e1f20] border border-white/[0.08] rounded-2xl p-4 z-50 text-left text-xs space-y-4 shadow-2xl"
              >
                <div className="flex justify-between items-center border-b border-white/[0.08] pb-2.5">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <SlidersHorizontal size={14} className="text-[#a8c7fa]" />
                    <span>Gemini Inference Parameters</span>
                  </div>
                  <button 
                    onClick={() => setShowParameters(false)}
                    className="text-[#8e918f] hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[#8e918f] mb-1">
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
                      className="w-full accent-[#8ab4f8] bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[#8e918f] mb-1">
                      <span>Max Output Tokens</span>
                      <span className="font-mono text-white">{parameters.maxTokens}</span>
                    </div>
                    <input 
                      type="range" 
                      min="256" 
                      max="4096" 
                      step="128"
                      value={parameters.maxTokens}
                      onChange={(e) => onUpdateParameters(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      className="w-full accent-[#8ab4f8] bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gemini Signature Capsule Input */}
          <div className="gemini-capsule p-3.5 flex flex-col gap-2">
            
            {/* Auto-growing Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Kone AI..."
              className="w-full bg-transparent border-0 text-[#e3e3e3] placeholder:text-[#8e918f] text-sm md:text-base outline-none resize-none px-2 max-h-36 custom-scrollbar"
            />

            {/* Bottom Controls Bar inside Capsule */}
            <div className="flex items-center justify-between pt-1">
              
              {/* Left Tools & Model Selector */}
              <div className="flex items-center gap-1.5 relative">
                
                {/* Model Selector Dropdown Pill */}
                <button
                  onClick={() => setShowProviderMenu(!showProviderMenu)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#c4c7c5] hover:text-white px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                >
                  <Sparkles size={13} className="text-[#a8c7fa]" />
                  <span>{providers.find(p => p.id === provider)?.name || 'Gemini 2.0 Flash'}</span>
                  <ChevronDown size={12} className="text-[#8e918f]" />
                </button>

                {/* Model Menu Dropdown */}
                {showProviderMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1e1f20] border border-white/[0.08] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in duration-150">
                    <div className="text-[10px] font-semibold text-[#8e918f] px-2.5 py-1 uppercase tracking-wider">
                      Select AI Model
                    </div>
                    {providers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setProvider(p.id);
                          setShowProviderMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors text-left ${
                          provider === p.id 
                          ? 'bg-[#282a2c] text-white font-medium' 
                          : 'text-[#c4c7c5] hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {p.icon}
                          <div>
                            <div>{p.name}</div>
                            <div className="text-[10px] text-[#8e918f] font-normal">{p.desc}</div>
                          </div>
                        </div>
                        {provider === p.id && <Check size={13} className="text-[#8ab4f8]" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Grounded Docs Button */}
                <button
                  onClick={() => onShowToast("Hardware knowledge base grounded", "info")}
                  className="hidden sm:flex items-center gap-1 text-[11px] text-[#8e918f] hover:text-[#c4c7c5] px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
                  title="Grounded in Kone Hardware Schematics"
                >
                  <Cpu size={12} className="text-[#a8c7fa]" />
                  <span>Hardware Docs</span>
                </button>

                {/* Parameters Toggle Button */}
                <button
                  onClick={() => setShowParameters(!showParameters)}
                  className="p-1.5 rounded-full text-[#8e918f] hover:text-white hover:bg-white/5 transition-colors"
                  title="Adjust temperature & tokens"
                >
                  <SlidersHorizontal size={14} />
                </button>
              </div>

              {/* Right Send Action Buttons */}
              <div className="flex items-center gap-1.5">
                {session.messages.length > 0 && (
                  <button
                    onClick={onClearSession}
                    className="p-2 rounded-full text-[#8e918f] hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Clear current trajectory"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <button
                  onClick={() => handleGenerate()}
                  disabled={!input.trim() || isAnalyzing}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    input.trim() && !isAnalyzing
                    ? 'bg-[#8ab4f8] text-[#131314] hover:bg-[#a8c7fa] shadow-md scale-100'
                    : 'bg-white/5 text-[#8e918f] opacity-40 cursor-not-allowed'
                  }`}
                  title="Send prompt"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Gemini Disclaimer Footer */}
          <div className="text-center mt-2 text-[11px] text-[#8e918f]">
            Kone AI may display inaccurate info, so double-check hardware pinouts and sensor voltages.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSimulator;

