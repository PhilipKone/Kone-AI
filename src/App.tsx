import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Sitemap from './components/Sitemap';
import MarkdownMessage from './components/MarkdownMessage';
import { 
  Menu, 
  Settings, 
  RefreshCw, 
  Sliders, 
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  ChevronDown,
  Cpu,
  BookOpen,
  ArrowUp,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { synthesizeEducationalRoadmap } from './services/aiSynthesizer';
import './index.css';
import { 
  ChatMessage, 
  ChatSession, 
  ModelProvider, 
  ModelOption, 
  AISettings 
} from './types';

export type Session = any;
export type AIParameters = AISettings;

/* ── Available Model Providers ────────────────────────── */

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gemini-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Recommended',
    description: 'High-speed reasoning & code generation',
    speed: 'Ultra-Fast'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 2.5 Pro',
    badge: 'Advanced',
    description: 'Deep multidisciplinary problem solving',
    speed: 'Reasoning'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    badge: 'OpenAI',
    description: 'Lightweight, rapid response model',
    speed: 'Fast'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    badge: 'OpenAI Pro',
    description: 'Flagship multimodal intelligence',
    speed: 'Reasoning'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    badge: 'Reasoning',
    description: 'Open-weights mathematical logic engine',
    speed: 'Reasoning'
  }
];

const SUGGESTED_PROMPTS = [
  {
    icon: '⚡',
    title: 'Arduino PWM Control',
    prompt: 'Explain how 8-bit PWM speed control works on an Arduino Uno with an L298N motor driver, including code.'
  },
  {
    icon: '🤖',
    title: 'Autonomous State Machine',
    prompt: 'How do I design a clean state machine in C++ for an obstacle-avoiding mobile robot with ultrasonic sensors?'
  },
  {
    icon: '🐍',
    title: 'Python Data Scaffolding',
    prompt: 'Write a clean, idiomatic Python function to process and normalize telemetry sensor data from a serial port.'
  },
  {
    icon: '🔬',
    title: 'ESP32 vs Arduino',
    prompt: 'What are the architectural differences between an ESP32 and Arduino Uno for IoT and robotics projects?'
  }
];

/* ── Default Initial Session ──────────────────────────── */

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `### Welcome to Kone AI! 👋\n\nI am your intelligent educational assistant for **Kone Code Academy**.\n\nI can help you with:\n- **Programming & Web Dev:** Python, TypeScript, React, Node.js, C++\n- **Robotics & Embedded Hardware:** Arduino, ESP32, Raspberry Pi, sensor telemetry, and motor control\n- **AI & Algorithms:** State machines, neural nets, and algorithmic problem-solving\n\nHow can I help you learn or build today? Feel free to ask a question or pick one of the suggestions below!`,
  timestamp: Date.now(),
  provider: 'Gemini 2.5 Flash'
};

const DEFAULT_SESSION: ChatSession = {
  id: 'session-default',
  title: 'New Conversation',
  messages: [INITIAL_WELCOME_MESSAGE],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  provider: 'gemini-flash'
};

/* ── Main App Component ───────────────────────────────── */

function App() {
  const API_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5000';

  // Navigation Views: 'chat' | 'knowledge' | 'settings' | 'sitemap'
  const [activeView, setActiveView] = useState<string>('chat');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Model Provider Selection
  const [activeProvider, setActiveProvider] = useState<ModelProvider>('gemini-flash');

  // Chat Sessions State (Persisted in localStorage)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('kone_ai_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not restore chat sessions from localStorage', e);
    }
    return [DEFAULT_SESSION];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || DEFAULT_SESSION.id;
  });

  // AI Parameters State
  const [parameters, setParameters] = useState<AISettings>({
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "You are Kone AI, an advanced, friendly, and knowledgeable educational AI assistant for Kone Code Academy. You assist students, creators, and engineers with programming, robotics, electronics, web development, and AI. Provide clear, accurate, and supportive answers with markdown formatting and well-commented code snippets where helpful."
  });

  // Chat Input Text
  const [inputQuery, setInputQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Knowledge base state
  const [selectedDocId, setSelectedDocId] = useState<string>('pwm');
  const [activeCodeLang, setActiveCodeLang] = useState<'cpp' | 'python'>('cpp');
  const [copiedDocCode, setCopiedDocCode] = useState<boolean>(false);

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kone_ai_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage', e);
    }
  }, [sessions]);

  // Auto-scroll logic: only scroll to bottom if there is an active ongoing conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeView === 'chat') {
      const currentSession = sessions.find(s => s.id === activeSessionId);
      const messageCount = currentSession?.messages.length || 0;
      if (messageCount > 1 || isGenerating) {
        scrollToBottom();
      } else {
        // Reset scroll position to top on fresh welcome view
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 0;
        }
      }
    }
  }, [sessions, activeSessionId, isGenerating, activeView]);

  // Focus textarea on load or new session
  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeSessionId, activeView]);

  // Current Active Session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || DEFAULT_SESSION;

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Chat Actions ───────────────────────────────────── */

  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      messages: [INITIAL_WELCOME_MESSAGE],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: activeProvider
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveView('chat');
    showToast('Started new chat conversation', 'info');
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      // Don't delete last session, just clear it
      setSessions([DEFAULT_SESSION]);
      setActiveSessionId(DEFAULT_SESSION.id);
      showToast('Chat history reset', 'info');
      return;
    }

    const nextSessions = sessions.filter(s => s.id !== id);
    setSessions(nextSessions);
    if (activeSessionId === id) {
      setActiveSessionId(nextSessions[0].id);
    }
    showToast('Chat deleted', 'info');
  };

  const handleClearCurrentChat = () => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [INITIAL_WELCOME_MESSAGE],
          title: 'New Conversation',
          updatedAt: Date.now()
        };
      }
      return s;
    }));
    showToast('Cleared conversation history', 'info');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!query || isGenerating) return;

    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Append User Message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    // Calculate updated title if this is the first real user message
    const isFirstUserMessage = activeSession.messages.filter(m => m.role === 'user').length === 0;
    const newTitle = isFirstUserMessage 
      ? (query.length > 28 ? query.substring(0, 28) + '...' : query) 
      : activeSession.title;

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMsg],
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    setIsGenerating(true);

    try {
      // Build past turn history for context
      const history = activeSession.messages
        .filter(m => !m.isError)
        .map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user' as 'assistant' | 'user',
          content: m.content
        }));

      let assistantContent = '';
      let returnedProvider = activeProvider;

      // 1. If a live remote backend is explicitly configured (not localhost), try it first
      const hasLiveRemoteBackend = API_URL && !API_URL.includes('localhost') && !API_URL.includes('127.0.0.1');

      if (hasLiveRemoteBackend) {
        try {
          const response = await axios.post(`${API_URL}/api/chat`, {
            message: query,
            history,
            provider: activeProvider,
            temperature: parameters.temperature,
            maxTokens: parameters.maxTokens,
            systemPrompt: parameters.systemPrompt
          });
          const data = response.data;
          assistantContent = data.content || data.message || '';
          returnedProvider = (data.provider as ModelProvider) || activeProvider;
        } catch (backendErr) {
          console.warn('Backend call failed, falling back to direct client-side Gemini:', backendErr);
        }
      }

      // 2. Direct Client-Side Gemini Edge Synthesis (Zero Backend needed)
      if (!assistantContent) {
        const synthesisResult = await synthesizeEducationalRoadmap({
          query,
          history,
          provider: activeProvider,
          temperature: parameters.temperature,
          maxTokens: parameters.maxTokens,
          systemPrompt: parameters.systemPrompt
        });

        let formatted = synthesisResult.message;
        if (synthesisResult.roadmap && synthesisResult.roadmap.length > 0) {
          formatted += `\n\n### 🛠️ Projected Technical Milestones\n` + 
            synthesisResult.roadmap.map((m) => `* **${m.tag}: ${m.name}**\n  _${m.reason}_`).join('\n\n');
        }
        if (synthesisResult.logicTrace && synthesisResult.logicTrace.length > 0) {
          formatted += `\n\n> 🔍 **Logic Trace:**\n> ` + synthesisResult.logicTrace.join('\n> ');
        }
        assistantContent = formatted;
        returnedProvider = (synthesisResult.provider as ModelProvider) || activeProvider;
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        provider: returnedProvider,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, aiMsg],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } catch (err: any) {
      console.error('Chat generation error:', err);

      // Graceful error message
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Notice:** Unable to reach the AI synthesis service right now. Please check your internet connection or try again shortly.`,
        timestamp: Date.now(),
        isError: true,
        provider: 'System'
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMsg],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const activeModelInfo = MODEL_OPTIONS.find(m => m.id === activeProvider) || MODEL_OPTIONS[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#e3e3e3]">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#1e1f20] border border-white/10 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={setActiveSessionId}
        onNewSession={handleCreateNewSession}
        onDeleteSession={handleDeleteSession}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 z-20 bg-[#131314]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 md:hidden text-[#c4c7c5] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Open sidebar"
            >
              <Menu size={18} />
            </button>

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] border border-white/10 text-xs text-white transition-all shadow-sm"
              >
                <Sparkles size={14} className="text-[#a8c7fa]" />
                <span className="font-medium">{activeModelInfo.name}</span>
                <span className="text-[10px] text-[#8e918f] font-mono hidden sm:inline">({activeModelInfo.speed})</span>
                <ChevronDown size={14} className={`text-[#8e918f] transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Model Dropdown Menu */}
              {modelDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setModelDropdownOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-72 bg-[#1e1f20] border border-white/10 rounded-2xl shadow-2xl z-40 p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8e918f] tracking-wider uppercase">
                      Select Intelligence Engine
                    </div>
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setActiveProvider(model.id);
                          setModelDropdownOpen(false);
                          showToast(`Switched to ${model.name}`, 'info');
                        }}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors ${
                          activeProvider === model.id 
                            ? 'bg-[#282a2c] text-white' 
                            : 'hover:bg-white/5 text-[#c4c7c5] hover:text-white'
                        }`}
                      >
                        <Bot size={16} className={`mt-0.5 shrink-0 ${activeProvider === model.id ? 'text-[#a8c7fa]' : 'text-[#8e918f]'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium truncate">{model.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-[#a8c7fa] font-mono">{model.speed}</span>
                          </div>
                          <p className="text-[11px] text-[#8e918f] truncate mt-0.5">{model.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCurrentChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#c4c7c5] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors"
              title="Clear current conversation"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>

            <button
              onClick={() => setActiveView(activeView === 'settings' ? 'chat' : 'settings')}
              className={`p-2 rounded-full transition-colors ${
                activeView === 'settings' 
                  ? 'bg-white/10 text-white' 
                  : 'text-[#c4c7c5] hover:text-white hover:bg-white/5'
              }`}
              title="AI Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* ── View 1: Main Chatbot Stream ──────────────────── */}
        {activeView === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Messages Scroll Area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 max-w-4xl w-full mx-auto"
            >
              
              {activeSession.messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={msg.id}
                    className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-md">
                        <Bot size={18} className="text-white" />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[78%] ${
                      isUser 
                        ? 'bg-[#282a2c] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md' 
                        : 'bg-[#18191a]/90 text-[#e3e3e3] rounded-2xl rounded-tl-sm px-5 py-4 border border-white/[0.06] shadow-sm'
                    }`}>
                      {/* Message Meta Info */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mb-2 text-[11px] text-[#8e918f]">
                          <span className="font-medium text-white">Kone AI</span>
                          {msg.provider && (
                            <>
                              <span>·</span>
                              <span className="px-1.5 py-0.2 rounded bg-white/5 font-mono text-[10px] text-[#a8c7fa]">
                                {msg.provider}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Content rendering */}
                      {isUser ? (
                        <p className="text-sm sm:text-[15px] whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      ) : (
                        <MarkdownMessage content={msg.content} />
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-[#282a2c] border border-white/10 flex items-center justify-center shrink-0">
                        <User size={16} className="text-[#a8c7fa]" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Generating / Thinking Indicator */}
              {isGenerating && (
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 animate-pulse">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="bg-[#18191a] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a8c7fa] animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-[#a8c7fa] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#a8c7fa] animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-xs text-[#8e918f] ml-1 font-mono">Thinking with {activeModelInfo.name}...</span>
                  </div>
                </div>
              )}

              {/* Suggested Prompt Chips on Empty/Fresh Chat */}
              {activeSession.messages.length <= 1 && (
                <div className="mt-8 pt-4 border-t border-white/[0.06]">
                  <p className="text-xs font-medium text-[#8e918f] mb-3 text-center">
                    Try asking one of these questions to get started:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SUGGESTED_PROMPTS.map((promptItem, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(promptItem.prompt)}
                        className="p-3.5 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-white/[0.06] text-left transition-all hover:border-[#8ab4f8]/30 group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{promptItem.icon}</span>
                          <span className="text-xs font-semibold text-white group-hover:text-[#a8c7fa] transition-colors">
                            {promptItem.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8e918f] line-clamp-2">
                          {promptItem.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Sticky Chat Input Bar */}
            <div className="p-4 md:pb-6 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
              <div className="max-w-4xl w-full mx-auto">
                <div className="relative gemini-capsule px-3 py-2 flex items-center gap-2 border border-white/10 bg-[#1e1f20] focus-within:border-[#8ab4f8]/60 transition-all">
                  
                  {/* Multi-line auto-resizing textarea */}
                  <textarea
                    ref={textareaRef}
                    value={inputQuery}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Kone AI anything... (Press Enter to send, Shift+Enter for newline)"
                    rows={1}
                    className="flex-1 max-h-44 bg-transparent border-0 outline-none text-sm text-white placeholder:text-[#8e918f] resize-none px-2 py-1.5 no-scrollbar leading-normal min-h-[36px]"
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputQuery.trim() || isGenerating}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      inputQuery.trim() && !isGenerating
                        ? 'bg-[#a8c7fa] hover:bg-white text-black shadow-md cursor-pointer'
                        : 'bg-white/5 text-[#8e918f] cursor-not-allowed'
                    }`}
                    title="Send message"
                  >
                    {isGenerating ? (
                      <RefreshCw size={16} className="animate-spin text-black" />
                    ) : (
                      <ArrowUp size={18} />
                    )}
                  </button>
                </div>

                {/* Footer disclaimer */}
                <div className="flex items-center justify-between mt-2 px-3 text-[11px] text-[#8e918f]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>Kone Code Academy Educational AI</span>
                  </span>
                  <span>Model: {activeModelInfo.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── View 2: Hardware Schematics & Docs ───────────── */}
        {activeView === 'knowledge' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Cpu size={24} className="text-[#a8c7fa]" />
                Hardware Schematics & Code Snippets
              </h1>
              <p className="text-sm text-[#8e918f] mt-1">
                Verified hardware wiring pinouts and production-grade microcontroller firmware routines.
              </p>
            </div>

            {/* Module Selector Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[
                { id: 'pwm', title: 'PWM Speed Control', subtitle: 'L298N Dual H-Bridge' },
                { id: 'ultrasonic', title: 'Ultrasonic Pulse Telemetry', subtitle: 'HC-SR04 Flight-time' },
                { id: 'pid', title: 'PID Steering Controller', subtitle: 'Closed-Loop Control Theory' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDocId(tab.id)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    selectedDocId === tab.id
                      ? 'bg-[#282a2c] border-[#8ab4f8] text-white shadow-lg'
                      : 'bg-[#1e1f20] border-white/5 text-[#c4c7c5] hover:bg-[#282a2c]/60'
                  }`}
                >
                  <p className="text-xs font-bold">{tab.title}</p>
                  <p className="text-[11px] text-[#8e918f] mt-1">{tab.subtitle}</p>
                </button>
              ))}
            </div>

            {/* Code & Hardware Schematics View */}
            <div className="p-6 rounded-2xl bg-[#1e1f20] border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="text-[#a8c7fa]" />
                  <span className="text-sm font-semibold text-white">Firmware Implementation</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#131314] p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setActiveCodeLang('cpp')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                      activeCodeLang === 'cpp' ? 'bg-[#a8c7fa] text-black font-semibold' : 'text-[#c4c7c5] hover:text-white'
                    }`}
                  >
                    Arduino C++
                  </button>
                  <button
                    onClick={() => setActiveCodeLang('python')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                      activeCodeLang === 'python' ? 'bg-[#a8c7fa] text-black font-semibold' : 'text-[#c4c7c5] hover:text-white'
                    }`}
                  >
                    MicroPython
                  </button>
                </div>
              </div>

              {/* Sample Code Display */}
              <pre className="p-4 rounded-xl bg-[#0d0d0e] border border-white/10 text-xs font-mono text-[#e3e3e3] overflow-x-auto leading-relaxed">
                {activeCodeLang === 'cpp' ? (
                  `// Kone Code Academy - Production Microcontroller Firmware\n` +
                  `#define PIN_PWM_MOTOR 9\n` +
                  `#define PIN_DIR_1 8\n` +
                  `#define PIN_DIR_2 7\n\n` +
                  `void setup() {\n` +
                  `  pinMode(PIN_PWM_MOTOR, OUTPUT);\n` +
                  `  pinMode(PIN_DIR_1, OUTPUT);\n` +
                  `  pinMode(PIN_DIR_2, OUTPUT);\n` +
                  `  Serial.begin(115200);\n` +
                  `}\n\n` +
                  `void loop() {\n` +
                  `  // Drive Forward at 50% Duty Cycle\n` +
                  `  digitalWrite(PIN_DIR_1, HIGH);\n` +
                  `  digitalWrite(PIN_DIR_2, LOW);\n` +
                  `  analogWrite(PIN_PWM_MOTOR, 128); // 128 / 255\n` +
                  `  delay(1000);\n` +
                  `}`
                ) : (
                  `# MicroPython Firmware Example\n` +
                  `from machine import Pin, PWM\n` +
                  `import time\n\n` +
                  `pwm_pin = PWM(Pin(9), freq=1000)\n` +
                  `dir_1 = Pin(8, Pin.OUT)\n` +
                  `dir_2 = Pin(7, Pin.OUT)\n\n` +
                  `dir_1.value(1)\n` +
                  `dir_2.value(0)\n` +
                  `pwm_pin.duty_u16(32768)  # 50% duty cycle\n` +
                  `time.sleep(1)`
                )}
              </pre>
            </div>
          </div>
        )}

        {/* ── View 3: Settings Panel ───────────────────────── */}
        {activeView === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sliders size={24} className="text-[#a8c7fa]" />
                Kone AI Engine Configuration
              </h1>
              <p className="text-sm text-[#8e918f] mt-1">
                Customize model parameters, system prompt behaviors, and default AI engines.
              </p>
            </div>

            <div className="space-y-6">
              {/* Temperature Slider */}
              <div className="p-5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white">Temperature (Creativity vs Determinism)</label>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-[#a8c7fa]">
                    {parameters.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={parameters.temperature}
                  onChange={(e) => setParameters({ ...parameters, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-[#a8c7fa] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#8e918f]">
                  <span>Precise & Factual (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative & Divergent (1.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="p-5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white">Max Output Tokens</label>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-[#a8c7fa]">
                    {parameters.maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="4096"
                  step="256"
                  value={parameters.maxTokens}
                  onChange={(e) => setParameters({ ...parameters, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-[#a8c7fa] cursor-pointer"
                />
              </div>

              {/* System Prompt */}
              <div className="p-5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-2">
                <label className="text-sm font-medium text-white">Base System Prompt</label>
                <textarea
                  value={parameters.systemPrompt}
                  onChange={(e) => setParameters({ ...parameters, systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full bg-[#131314] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#8ab4f8] leading-relaxed resize-y"
                />
              </div>

              {/* Reset to Defaults button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setParameters({
                      temperature: 0.7,
                      maxTokens: 2048,
                      systemPrompt: "You are Kone AI, an advanced, friendly, and knowledgeable educational AI assistant for Kone Code Academy. You assist students, creators, and engineers with programming, robotics, electronics, web development, and AI. Provide clear, accurate, and supportive answers with markdown formatting and well-commented code snippets where helpful."
                    });
                    showToast('Reset parameters to academy defaults', 'info');
                  }}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#c4c7c5] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => {
                    setActiveView('chat');
                    showToast('Settings saved successfully', 'success');
                  }}
                  className="px-5 py-2 rounded-full bg-[#a8c7fa] text-black font-semibold text-xs hover:bg-white transition-colors"
                >
                  Save & Return to Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── View 4: Academy Sitemap ──────────────────────── */}
        {activeView === 'sitemap' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Sitemap 
              onBack={() => setActiveView('chat')} 
              onNavigate={(view: string) => setActiveView(view)} 
            />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
