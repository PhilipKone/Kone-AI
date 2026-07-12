import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Settings2, 
  ShieldAlert, 
  Zap, 
  Send, 
  Sparkles, 
  Cpu, 
  Crown, 
  Atom, 
  RefreshCw, 
  Trash2, 
  Check, 
  History 
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
  badge?: string;
}

type DBStatus = 'offline' | 'connecting' | 'online';

interface DebugLog {
  timestamp: string;
  level: 'SYSTEM' | 'INFO' | 'API' | 'DB' | 'USER' | 'ERROR';
  text: string;
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
  const [dbStatus, setDbStatus] = useState<DBStatus>('offline');
  const [showConsoleDebug, setShowConsoleDebug] = useState<boolean>(false);

  // Console Logs State
  const [consoleLogs, setConsoleLogs] = useState<DebugLog[]>([
    { timestamp: '12:00:00', level: 'SYSTEM', text: 'Kone AI OS kernel v1.0.beta initialized.' },
    { timestamp: '12:00:01', level: 'SYSTEM', text: 'Mounting hardware telemetry subsystems...' },
    { timestamp: '12:00:02', level: 'DB', text: 'Offline telemetry cache bound successfully.' },
    { timestamp: '12:00:03', level: 'API', text: 'Core endpoint mapped to http://localhost:5000/api/synthesize' },
    { timestamp: '12:00:04', level: 'INFO', text: 'Initialized Gemini-2.0-Flash engine.' }
  ]);

  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs, showConsoleDebug]);

  // Log session updates
  useEffect(() => {
    if (session.messages.length > 0) {
      const lastMsg = session.messages[session.messages.length - 1];
      const time = new Date().toLocaleTimeString();
      if (lastMsg.role === 'user') {
        addLog('USER', `Query dispatched: "${lastMsg.content.substring(0, 30)}..."`);
      } else {
        addLog('API', `POST /api/synthesize - 200 OK (${lastMsg.activeProvider})`);
        addLog('INFO', `Pathway successfully synthesized with ${lastMsg.roadmap?.length || 0} nodes.`);
      }
    }
  }, [session.messages]);

  const addLog = (level: DebugLog['level'], text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { timestamp, level, text }]);
  };

  const providers: ProviderItem[] = [
    { id: 'gemini-flash', name: 'Gemini Flash', icon: <Sparkles size={14} className="text-[#00D1FF]" />, desc: 'Fast & Lightweight' },
    { id: 'gemini-pro', name: 'Gemini 2.5 Pro', icon: <Crown size={14} className="text-[#BC00FF]" />, desc: 'Complex Reasoning' },
    { id: 'gemini-next', name: 'Gemini 3.1 Pro', icon: <Atom size={14} className="text-[#00FFD1]" />, desc: 'Next-Gen flagship', badge: 'NEW' },
    { id: 'openai-flash', name: 'GPT-4o Mini', icon: <Cpu size={14} className="text-[#10a37f]" />, desc: 'Efficient Intelligence' },
    { id: 'openai-pro', name: 'GPT-4o Pro', icon: <Crown size={14} className="text-[#10a37f]" />, desc: 'Flagship Accuracy' },
    { id: 'openai-next', name: 'GPT 5.5', icon: <Atom size={14} className="text-[#FF00D1]" />, desc: 'Autonomous AGI-Lite', badge: 'LATEST' }
  ];

  const handleGenerate = () => {
    if (!input.trim() || isAnalyzing) return;
    onSendMessage(input, provider);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleGenerate();
    }
  };

  const handleToggleDB = () => {
    if (dbStatus === 'offline') {
      setDbStatus('connecting');
      addLog('DB', 'Initiating live DB handshake sequence...');
      onShowToast("Initiating live database handshake...", "info");
      
      setTimeout(() => {
        setDbStatus('online');
        addLog('DB', 'Handshake completed. Telemetry stream connected.');
        onShowToast("Database connection established!", "success");
      }, 1200);
    } else if (dbStatus === 'online') {
      setDbStatus('offline');
      addLog('DB', 'Telemetry stream disconnected.');
      onShowToast("Database connection terminated.", "warning");
    }
  };

  return (
    <div className="w-full flex flex-col h-full relative">
        <div className="flex-1 space-y-8 pb-32 overflow-y-auto custom-scrollbar pr-2">
            {session.messages.length === 0 && (
                <div className="h-[40vh] flex flex-col items-center justify-center opacity-70">
                    <img src="/app-ai.svg" alt="Kone AI" className="w-20 h-20 mb-6 drop-shadow-[0_0_15px_rgba(0,209,255,0.3)]" />
                    <p className="text-xl font-light tracking-wide text-[#9ca3af] font-mono uppercase text-xs">Awaiting Synthesis Query</p>
                    <p className="text-[11px] text-[#9ca3af]/40 font-mono mt-2 uppercase tracking-widest">Selected Engine: {providers.find(p => p.id === provider)?.name}</p>
                </div>
            )}
            
            {session.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'user' ? (
                        <div className="bg-[#1e1f24] text-[#e3e3e3] px-6 py-4 rounded-xl border border-white/5 max-w-[80%] text-[15px] leading-relaxed font-mono shadow-md">
                            <span className="text-[#00D1FF] mr-2">❯</span>{msg.content}
                        </div>
                    ) : (
                        <div className="w-full max-w-3xl space-y-4 animate-in fade-in duration-300">
                            {/* Thinking Block */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4">
                                    <div 
                                        onClick={() => setShowThinking(!showThinking)}
                                        className="flex items-center gap-2 text-sm text-[#9ca3af] cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-lg w-fit transition-colors border border-transparent hover:border-white/10"
                                    >
                                        <Terminal size={16} className="text-[#BC00FF]" />
                                        <span className="font-mono uppercase tracking-wider text-[11px] font-bold">View Logic Trace</span>
                                        {showThinking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5">
                                        {providers.find(p => p.id === msg.activeProvider)?.icon}
                                        <span className="text-[10px] font-mono uppercase text-[#9ca3af]">{providers.find(p => p.id === msg.activeProvider)?.name}</span>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {showThinking && msg.logicTrace && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-2"
                                        >
                                            <div className="pl-6 text-[#9ca3af] text-[13px] leading-relaxed border-l-[2px] border-[#BC00FF]/30 py-2 my-2 space-y-2 font-mono bg-black/20 p-4 rounded-r-xl">
                                                {msg.logicTrace.map((step, i) => (
                                                    <p key={i} className="flex items-start gap-2">
                                                        <span className="text-[#00D1FF] mt-1">✓</span> {step}
                                                    </p>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Response Content */}
                            <div className="text-[#e3e3e3] text-[16px] leading-relaxed pl-1">
                                <p className="mb-6">{msg.content}</p>
                                
                                {msg.roadmap && msg.roadmap.length > 0 && (
                                    <div className="space-y-4 mt-8">
                                        <h4 className="font-mono text-sm uppercase tracking-widest text-[#00D1FF] mb-4 flex items-center gap-2">
                                            <Zap size={16} /> Projected Pathway
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {msg.roadmap.map((item, i) => (
                                                <div key={i} className="bg-[#121316] border border-white/5 rounded-xl p-5 hover:border-[#BC00FF]/50 transition-colors cursor-default relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#BC00FF] to-[#00D1FF] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="font-mono text-[10px] text-[#9ca3af] mb-2 uppercase">{item.tag}</div>
                                                    <div className="font-semibold text-[#e3e3e3] mb-2 text-[15px]">{i+1}. {item.name}</div>
                                                    <div className="text-[#9ca3af] text-[13px] leading-relaxed">{item.reason}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {isAnalyzing && (
                 <div className="flex justify-start">
                    <div className="w-full max-w-3xl space-y-4">
                        <div className="flex items-center gap-3 px-3 py-1.5 w-fit bg-[#BC00FF]/10 rounded-full border border-[#BC00FF]/30">
                            <RefreshCw size={14} className="animate-spin text-[#BC00FF]" />
                            <span className="font-mono text-[12px] uppercase tracking-wider text-[#BC00FF] animate-pulse">Synthesizing Trajectory...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Console Debug Drawer */}
            <AnimatePresence>
              {showConsoleDebug && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 200, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full max-w-3xl border border-white/10 rounded-xl bg-black/40 overflow-hidden flex flex-col font-mono text-[11px] h-[200px]"
                >
                  <div className="flex justify-between items-center bg-[#121316] px-4 py-2 border-b border-white/5">
                    <span className="text-[#00D1FF] flex items-center gap-1.5"><Terminal size={14} /> Console Debugger</span>
                    <button onClick={() => setShowConsoleDebug(false)} className="text-[#9ca3af] hover:text-white font-sans text-xs">×</button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-1 custom-scrollbar text-left">
                    {consoleLogs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-[#9ca3af]/40">[{log.timestamp}]</span>
                        <span className={`font-bold ${
                          log.level === 'SYSTEM' ? 'text-[#BC00FF]' :
                          log.level === 'API' ? 'text-green-400' :
                          log.level === 'DB' ? 'text-[#00D1FF]' :
                          log.level === 'USER' ? 'text-yellow-500' :
                          'text-white'
                        }`}>[{log.level}]</span>
                        <span className="text-[#e3e3e3]">{log.text}</span>
                      </div>
                    ))}
                    <div ref={logEndRef}></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* Floating Input Box (Terminal Style) */}
        <div className="fixed bottom-0 md:right-[280px] left-0 right-0 p-0 md:p-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent pointer-events-none z-50 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto w-full pointer-events-auto relative">
                
                {/* Parameters Overlay Panel */}
                <AnimatePresence>
                  {showParameters && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute bottom-full left-4 md:left-0 mb-4 w-80 bg-[#121316]/95 border border-white/10 rounded-xl shadow-2xl p-4 z-50 text-left font-mono text-xs space-y-4 backdrop-blur-md"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="font-bold text-[#BC00FF] uppercase tracking-wider flex items-center gap-1.5">
                          <Settings2 size={14} /> Engine Parameters
                        </span>
                        <button onClick={() => setShowParameters(false)} className="text-[#9ca3af] hover:text-white font-sans text-sm">×</button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[#9ca3af]">
                            <span>Temperature</span>
                            <span className="text-[#00D1FF]">{parameters.temperature}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={parameters.temperature}
                            onChange={(e) => onUpdateParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                            className="w-full accent-[#BC00FF] bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[#9ca3af]">
                            <span>Max Tokens</span>
                            <span className="text-[#00D1FF]">{parameters.maxTokens}</span>
                          </div>
                          <input 
                            type="range" 
                            min="256" 
                            max="4096" 
                            step="128"
                            value={parameters.maxTokens}
                            onChange={(e) => onUpdateParameters(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                            className="w-full accent-[#BC00FF] bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="kone-glass md:rounded-xl p-2 flex flex-col shadow-2xl border border-white/10 md:mb-4">
                    <div className="flex items-center justify-between px-4 pt-2 pb-1 border-b border-white/5 mb-2">
                        <div className="flex items-center">
                            <div className="flex gap-1.5 mr-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                            </div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#9ca3af]">Kone Console v1.0</span>
                        </div>
                        {session.messages.length > 0 && (
                          <button 
                            onClick={onClearSession}
                            className="text-[#9ca3af] hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest"
                          >
                            <Trash2 size={12} />
                            <span>Clear console</span>
                          </button>
                        )}
                    </div>
                    <div className="flex items-start px-4 py-2">
                        <span className="text-[#00D1FF] font-mono mt-3 mr-3 text-lg">❯</span>
                        <input 
                            type="text" 
                            placeholder={`Query via ${providers.find(p => p.id === provider)?.name}...`} 
                            className="w-full bg-transparent border-none text-[#e3e3e3] font-mono text-[14px] py-3 outline-none placeholder:text-[#9ca3af]/50"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isAnalyzing}
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={isAnalyzing || !input.trim()}
                            className={`p-3 ml-2 rounded-lg transition-colors flex-shrink-0 ${isAnalyzing || !input.trim() ? 'bg-white/5 text-white/30' : 'bg-[#BC00FF]/20 text-[#BC00FF] hover:bg-[#BC00FF] hover:text-white border border-[#BC00FF]/50'}`}
                        >
                            <Send size={18} className="ml-0.5" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center px-4 pb-2 pt-1">
                        <div className="flex items-center gap-1 md:gap-2 relative">
                            <button 
                                onClick={() => setShowProviderMenu(!showProviderMenu)}
                                className="flex items-center gap-2 px-3 py-1 hover:bg-white/5 rounded-md text-[#9ca3af] transition-colors text-xs font-mono border border-white/5"
                            >
                                {providers.find(p => p.id === provider)?.icon}
                                <span>{providers.find(p => p.id === provider)?.name}</span>
                                <ChevronUp size={14} className={showProviderMenu ? '' : 'rotate-180'} />
                            </button>
                            
                            <AnimatePresence>
                                {showProviderMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-0 mb-2 w-64 bg-[#121316] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 p-1"
                                    >
                                        <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#BC00FF] font-bold border-b border-white/5 mb-1">Select Engine</div>
                                        {providers.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setProvider(p.id);
                                                    setShowProviderMenu(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-xs font-mono ${provider === p.id ? 'bg-[#BC00FF]/20 text-white' : 'text-[#9ca3af] hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {p.icon}
                                                    <div className="flex flex-col items-start">
                                                        <div className="flex items-center gap-2">
                                                            <span>{p.name}</span>
                                                            {p.badge && <span className="bg-[#BC00FF] text-white text-[8px] px-1 rounded-sm leading-none py-0.5">{p.badge}</span>}
                                                        </div>
                                                        <span className="text-[9px] opacity-50">{p.desc}</span>
                                                    </div>
                                                </div>
                                                {p.id.includes('pro') && <Crown size={10} className="text-yellow-500" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button 
                                onClick={() => setShowParameters(!showParameters)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors text-xs font-mono border ${
                                    showParameters 
                                    ? 'bg-[#BC00FF]/10 border-[#BC00FF]/30 text-white' 
                                    : 'hover:bg-white/5 border-transparent text-[#9ca3af]'
                                }`}
                            >
                                <Settings2 size={14} />
                                <span>Parameters</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-1.5 md:gap-2">
                             <button 
                                onClick={() => setShowConsoleDebug(!showConsoleDebug)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors text-xs font-mono border ${
                                    showConsoleDebug 
                                    ? 'bg-[#BC00FF]/10 border-[#BC00FF]/30 text-white animate-pulse' 
                                    : 'hover:bg-white/5 border-transparent text-[#9ca3af]'
                                }`}
                                title="Open Console Debugger"
                             >
                                <Terminal size={14} />
                                <span>Console Debug</span>
                             </button>

                             <button 
                                onClick={handleToggleDB}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all text-xs font-mono border ${
                                    dbStatus === 'online'
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : dbStatus === 'connecting'
                                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse'
                                    : 'bg-white/5 border-white/5 text-[#9ca3af] hover:text-white'
                                }`}
                             >
                                <ShieldAlert size={14} className={
                                    dbStatus === 'online' ? 'text-green-400' :
                                    dbStatus === 'connecting' ? 'text-yellow-400' :
                                    'text-[#9ca3af]'
                                } />
                                <span>
                                    {dbStatus === 'online' ? 'Live DB Connected' :
                                     dbStatus === 'connecting' ? 'Handshaking...' :
                                     'Connect Live DB'}
                                </span>
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
