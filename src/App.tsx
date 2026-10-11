import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Sitemap from './components/Sitemap';
import MarkdownMessage from './components/MarkdownMessage';
import KoneAILogo from './components/KoneAILogo';
import SubdomainLogo from './components/SubdomainLogo';
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
import { synthesizeEducationalRoadmap, generateClientChat } from './services/aiSynthesizer';
import './index.css';
import { 
  ChatMessage, 
  ChatSession, 
  ModelProvider, 
  ModelOption, 
  SubdomainScope,
  AISettings 
} from './types';

export type Session = any;
export type AIParameters = AISettings;

/* ── Available Model Providers ────────────────────────── */

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Latest · Ultra-Fast',
    description: 'DeepMind flagship high-speed reasoning and synthesis engine',
    speed: 'Ultra-Fast'
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    badge: 'Deep Reasoning',
    description: 'Advanced multi-domain engineering & code intelligence',
    speed: 'Reasoning'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    badge: 'OpenAI',
    description: 'Lightweight rapid response conversational model',
    speed: 'Fast'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    badge: 'OpenAI Pro',
    description: 'Flagship multimodal intelligence & code generation',
    speed: 'Reasoning'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    badge: 'Open Reasoning',
    description: 'Open-weights mathematical logic & algorithm engine',
    speed: 'Reasoning'
  },
  {
    id: 'groq-llama-70b',
    name: 'Llama 3.3 70B (Groq)',
    badge: 'Groq LPU · 14,400 RPD',
    description: 'Blazing fast inference with 14,400 free requests per day',
    speed: 'Ultra-Fast'
  },
  {
    id: 'groq-deepseek-r1',
    name: 'DeepSeek R1 (Groq)',
    badge: 'Groq Reasoning',
    description: 'High-speed DeepSeek R1 deep reasoning and math via Groq',
    speed: 'Reasoning'
  }
];

export const SUBDOMAIN_SCOPES: SubdomainScope[] = [
  { id: 'all', name: 'All Ecosystem', icon: '🌐', logoUrl: '/logos/logo-circle.svg', color: '#38bdf8', url: 'https://koneacademy.io', tagline: 'Unified Academy Intelligence' },
  { id: 'kids', name: 'Kone Kids', icon: '👶', logoUrl: '/logos/mascot.svg', color: '#38bdf8', url: 'https://kids.koneacademy.io', tagline: 'STEM & Robotics for Ages 6-16' },
  { id: 'code', name: 'Kone Code', icon: '💻', logoUrl: '/logos/app-code.svg', color: '#2563eb', url: 'https://code.koneacademy.io', tagline: 'Software Engineering & Tracks' },
  { id: 'consult', name: 'Kone Consult', icon: '💼', logoUrl: '/logos/app-consult.svg', color: '#7b9fb8', url: 'https://consult.koneacademy.io', tagline: 'Enterprise AI & Architecture' },
  { id: 'digital', name: 'Kone Digital', icon: '🎨', logoUrl: '/logos/app-digital.svg', color: '#00ffff', url: 'https://digital.koneacademy.io', tagline: 'UI/UX & Product Design' },
  { id: 'lab', name: 'Kone Lab', icon: '🔬', logoUrl: '/logos/app-lab.svg', color: '#3b82f6', url: 'https://lab.koneacademy.io', tagline: 'Hardware R&D & Embedded Systems' },
  { id: 'shop', name: 'Kone Shop', icon: '🛒', logoUrl: '/logos/app-shop.svg', color: '#ec4899', url: 'https://shop.koneacademy.io', tagline: 'Robotics Kits & Components' },
  { id: 'farms', name: 'Kone Farms', icon: '🌾', logoUrl: '/logos/app-farms.svg', color: '#10b981', url: 'https://farms.koneacademy.io', tagline: 'AgriTech & Smart Irrigation' },
  { id: 'warp', name: 'Kone Warp', icon: '⚡', logoUrl: '/logos/app-warp.svg', color: '#a855f7', url: 'https://warp.koneacademy.io', tagline: 'Cloud Sandboxes & Fast Tooling' }
];

export const PROMPTS_BY_SUBDOMAIN: Record<string, Array<{ icon: string; title: string; prompt: string }>> = {
  all: [
    { icon: '🌐', title: 'Academy Ecosystem Overview', prompt: 'Give me an overview of all divisions in the Kone Academy ecosystem and how they connect.' },
    { icon: '👶', title: 'Kids Robotics Programs', prompt: 'What robotics and coding programs does Kone Kids offer for beginners?' },
    { icon: '💻', title: 'Full-Stack Software Track', prompt: 'What is the recommended software engineering roadmap on Kone Code?' },
    { icon: '🛒', title: 'Shop Hardware Kits', prompt: 'What educational robotics kits and microcontroller packs are available in the Kone Shop?' }
  ],
  kids: [
    { icon: '🤖', title: 'Robotics for Age 8-12', prompt: 'What hands-on robotics courses and projects are available on kids.koneacademy.io for ages 8-12?' },
    { icon: '🎮', title: 'Scratch to Python Path', prompt: 'How does Kone Kids transition young learners from block programming to text-based Python?' },
    { icon: '🚗', title: 'Obstacle-Avoidance Rover', prompt: 'Explain the obstacle-avoidance robot car project taught in the Kone Kids robotics curriculum.' },
    { icon: '🧠', title: 'AI for Kids Basics', prompt: 'How does Kone Kids teach artificial intelligence and computer vision to young students?' }
  ],
  code: [
    { icon: '⚡', title: 'TypeScript & React Roadmap', prompt: 'What is the full-stack TypeScript and React curriculum roadmap on code.koneacademy.io?' },
    { icon: '🏗️', title: 'Backend APIs & Systems', prompt: 'How does Kone Code teach backend REST/GraphQL microservices architecture?' },
    { icon: '🎯', title: 'Technical Interview Prep', prompt: 'Can you give me an algorithm practice problem from the Kone Code interview curriculum?' },
    { icon: '🐳', title: 'Docker & CI/CD Mastery', prompt: 'Explain the containerization and automated deployment pipeline modules on Kone Code.' }
  ],
  consult: [
    { icon: '💼', title: 'Enterprise AI Advisory', prompt: 'What custom generative AI and LLM consulting services does consult.koneacademy.io provide?' },
    { icon: '☁️', title: 'Cloud Architecture Modernization', prompt: 'How does Kone Consult handle enterprise cloud migrations and digital transformation?' },
    { icon: '🛡️', title: 'IoT Architecture Audits', prompt: 'What does a security and scalability audit for industrial IoT look like at Kone Consult?' },
    { icon: '📊', title: 'Data Strategy & Pipelines', prompt: 'How does Kone Consult design real-time data streaming architectures for enterprises?' }
  ],
  digital: [
    { icon: '🎨', title: 'UI/UX Design Process', prompt: 'What is the product design and user journey methodology used by digital.koneacademy.io?' },
    { icon: '✨', title: 'Design Systems & Tokens', prompt: 'How does Kone Digital construct scalable Figma design systems and frontend tokens?' },
    { icon: '📱', title: 'Responsive Mobile Experience', prompt: 'What are the principles Kone Digital uses for high-conversion responsive web interfaces?' },
    { icon: '🚀', title: 'Brand Identity Design', prompt: 'What brand identity deliverables does Kone Digital produce for tech startups?' }
  ],
  lab: [
    { icon: '🔬', title: 'ESP32 Real-Time Telemetry', prompt: 'How do I build an asynchronous sensor telemetry loop on an ESP32 in Kone Lab?' },
    { icon: '🏎️', title: 'PID Trajectory Steering', prompt: 'Explain the mathematical PID steering logic used for mobile robots in Kone Lab.' },
    { icon: '📡', title: 'LoRa & ESP-NOW Mesh', prompt: 'How does Kone Lab implement off-grid RF sensor communication using ESP-NOW?' },
    { icon: '🔌', title: 'Custom PCB Schematic Review', prompt: 'What design rules are required for custom motor driver PCB layouts in Kone Lab?' }
  ],
  shop: [
    { icon: '📦', title: 'Kone Robotics Starter Kit', prompt: 'What components and documentation are included in the Kone Robotics Starter Kit on shop.koneacademy.io?' },
    { icon: '🎛️', title: 'Sensor Packs & Shields', prompt: 'Which sensor expansion packs and microcontroller shields are available in the Kone Shop?' },
    { icon: '🔋', title: 'Power & Battery Safety', prompt: 'What 18650 LiPo battery holders with BMS protection are sold in the Kone Shop?' },
    { icon: '🚚', title: 'Ordering & School Bundles', prompt: 'How do schools and clubs purchase bulk classroom kits from the Kone Shop?' }
  ],
  farms: [
    { icon: '🌱', title: 'Smart Irrigation Telemetry', prompt: 'How does farms.koneacademy.io monitor soil moisture and automate irrigation valves?' },
    { icon: '☀️', title: 'Solar Powered Off-Grid IoT', prompt: 'Explain the solar power management and battery telemetry used by Kone Farms.' }
  ],
  warp: [
    { icon: '⚡', title: 'Virtual Hardware Simulator', prompt: 'Can I simulate Arduino and ESP32 code on warp.koneacademy.io without physical hardware?' },
    { icon: '🚀', title: 'Instant Cloud Compilers', prompt: 'How does Kone Warp run zero-configuration browser code sandboxes for students?' }
  ]
};

export const SUGGESTED_PROMPTS = PROMPTS_BY_SUBDOMAIN['all'];

/* ── Default Initial Session ──────────────────────────── */

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `### Welcome to Kone AI! 👋\n\nI am your intelligent educational assistant fine-tuned on the **Kone Academy Ecosystem**.\n\nI have complete knowledge across our academy subdomains:\n- **Kone Kids (kids.koneacademy.io):** STEM, robotics, and creative coding for ages 6–16\n- **Kone Code (code.koneacademy.io):** Professional software engineering, React, TypeScript, and full-stack tracks\n- **Kone Consult (consult.koneacademy.io):** Enterprise AI deployment, architecture audits, and digital transformation\n- **Kone Digital (digital.koneacademy.io):** UI/UX product design, branding, and creative interactive web\n- **Kone Lab (lab.koneacademy.io):** Hardware R&D, embedded firmware, IoT sensor telemetry, and PID control\n- **Kone Shop (shop.koneacademy.io):** Educational robotics kits, microcontroller boards, and electronics\n- **Kone Farms & Kone Warp:** Smart agriculture and instant browser sandboxes\n\nSelect any subdomain above to focus your inquiries, or ask me anything directly!`,
  timestamp: Date.now(),
  provider: 'Gemini 3.8 Flash'
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
  const API_URL = import.meta.env.VITE_API_ENDPOINT || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

  // Navigation Views: 'chat' | 'knowledge' | 'settings' | 'sitemap'
  const [activeView, setActiveView] = useState<string>('chat');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Model Provider Selection & Active Subdomain Scope
  const [activeProvider, setActiveProvider] = useState<ModelProvider>('gemini-3.8-flash');
  const [activeSubdomain, setActiveSubdomain] = useState<string>('all');
  const [subdomainDropdownOpen, setSubdomainDropdownOpen] = useState<boolean>(false);

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

  // AI Parameters State (Persisted in localStorage)
  const [parameters, setParameters] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('kone_ai_parameters');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          temperature: parsed.temperature ?? 0.7,
          maxTokens: parsed.maxTokens ?? 2048,
          systemPrompt: parsed.systemPrompt || "You are Kone AI, an advanced, friendly, and knowledgeable AI assistant for Kone Academy. You assist students, creators, and engineers with programming, robotics, electronics, web development, and AI across all academy divisions. Provide clear, accurate, and supportive answers with markdown formatting and well-commented code snippets where helpful.",
          geminiApiKey: parsed.geminiApiKey || localStorage.getItem('kone_gemini_api_key') || '',
          groqApiKey: parsed.groqApiKey || localStorage.getItem('kone_groq_api_key') || ''
        };
      }
    } catch (e) {
      console.warn('Could not restore AI parameters from localStorage', e);
    }
    return {
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: "You are Kone AI, an advanced, friendly, and knowledgeable AI assistant for Kone Academy. You assist students, creators, and engineers with programming, robotics, electronics, web development, and AI across all academy divisions. Provide clear, accurate, and supportive answers with markdown formatting and well-commented code snippets where helpful.",
      geminiApiKey: typeof localStorage !== 'undefined' ? localStorage.getItem('kone_gemini_api_key') || '' : '',
      groqApiKey: typeof localStorage !== 'undefined' ? localStorage.getItem('kone_groq_api_key') || '' : ''
    };
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

  // Persist AI parameters and custom API key to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kone_ai_parameters', JSON.stringify(parameters));
      if (parameters.geminiApiKey !== undefined) {
        localStorage.setItem('kone_gemini_api_key', parameters.geminiApiKey);
      }
      if (parameters.groqApiKey !== undefined) {
        localStorage.setItem('kone_groq_api_key', parameters.groqApiKey);
      }
    } catch (e) {
      console.warn('Failed to save parameters to localStorage', e);
    }
  }, [parameters]);

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

      // 1. Try backend API first (handles Gemini, Groq, DeepSeek, and subdomain knowledge grounding)
      if (API_URL) {
        try {
          const response = await axios.post(`${API_URL}/api/chat`, {
            message: query,
            history,
            provider: activeProvider,
            subdomain: activeSubdomain,
            temperature: parameters.temperature,
            maxTokens: parameters.maxTokens,
            systemPrompt: parameters.systemPrompt,
            geminiApiKey: parameters.geminiApiKey,
            apiKey: parameters.geminiApiKey,
            groqApiKey: parameters.groqApiKey
          });
          const data = response.data;
          assistantContent = data.content || data.message || '';
          returnedProvider = (data.provider as ModelProvider) || activeProvider;
        } catch (backendErr) {
          console.warn('Backend call failed, falling back to direct client-side AI edge:', backendErr);
        }
      }

      // 2. Direct Client-Side AI Edge Synthesis (Gemini API & Groq LPU API directly from browser)
      if (!assistantContent) {
        const clientChatResult = await generateClientChat({
          query,
          history,
          provider: activeProvider,
          temperature: parameters.temperature,
          maxTokens: parameters.maxTokens,
          systemPrompt: parameters.systemPrompt,
          apiKey: parameters.geminiApiKey,
          groqApiKey: parameters.groqApiKey,
          subdomain: activeSubdomain
        });

        assistantContent = clientChatResult.content;
        returnedProvider = (clientChatResult.provider as ModelProvider) || activeProvider;
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
  const activeScopeInfo = SUBDOMAIN_SCOPES.find(s => s.id === activeSubdomain) || SUBDOMAIN_SCOPES[0];

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
                onClick={() => {
                  setModelDropdownOpen(!modelDropdownOpen);
                  setSubdomainDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] border border-white/10 text-xs text-white transition-all shadow-sm"
              >
                <KoneAILogo size={15} variant="glass" />
                <span className="font-medium text-[11px] sm:text-xs max-w-[70px] sm:max-w-none truncate">{activeModelInfo.name}</span>
                <span className="text-[10px] text-[#8e918f] font-mono hidden md:inline">({activeModelInfo.speed})</span>
                <ChevronDown size={13} className={`text-[#8e918f] transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
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
                        <KoneAILogo size={18} variant="glass" className="mt-0.5 shrink-0" />
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

            {/* Subdomain Scope Selector Dropdown with Official Logos */}
            <div className="relative">
              <button
                onClick={() => {
                  setSubdomainDropdownOpen(!subdomainDropdownOpen);
                  setModelDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] border border-white/10 text-xs text-white transition-all shadow-sm"
                title={`Active Scope: ${activeScopeInfo.name} (${activeScopeInfo.url})`}
              >
                <SubdomainLogo subdomainId={activeSubdomain} size={15} />
                <span className="font-medium text-[11px] sm:text-xs max-w-[65px] sm:max-w-[120px] truncate">{activeScopeInfo.name}</span>
                <ChevronDown size={13} className={`text-[#8e918f] transition-transform duration-200 ${subdomainDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {subdomainDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setSubdomainDropdownOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 max-h-[75vh] overflow-y-auto bg-[#1e1f20] border border-white/10 rounded-2xl shadow-2xl z-40 p-2 space-y-1 no-scrollbar">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8e918f] tracking-wider uppercase flex items-center justify-between">
                      <span>Ecosystem Knowledge Scope</span>
                      <span className="text-[10px] text-[#a8c7fa] font-mono">9 divisions</span>
                    </div>
                    {SUBDOMAIN_SCOPES.map((scope) => {
                      const isSelected = activeSubdomain === scope.id;
                      return (
                        <button
                          key={scope.id}
                          onClick={() => {
                            setActiveSubdomain(scope.id);
                            setSubdomainDropdownOpen(false);
                            showToast(`Scoping knowledge to ${scope.name}`, 'info');
                          }}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                            isSelected 
                              ? 'bg-[#282a2c] text-white border border-[#8ab4f8]/30' 
                              : 'hover:bg-white/5 text-[#c4c7c5] hover:text-white'
                          }`}
                        >
                          <SubdomainLogo subdomainId={scope.id} size={22} className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium truncate">{scope.name}</span>
                              {isSelected && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">Active</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#8e918f] truncate mt-0.5">{scope.tagline}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleClearCurrentChat}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full text-xs text-[#c4c7c5] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors"
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
                    <div className={`max-w-[88%] sm:max-w-[82%] ${
                      isUser 
                        ? 'bg-[#282a2c] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md' 
                        : 'bg-[#18191a]/95 text-[#e3e3e3] rounded-2xl rounded-tl-sm px-5 py-4 border border-white/[0.06] shadow-sm'
                    }`}>
                      {/* Message Meta Info */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mb-2 text-[11px] text-[#8e918f]">
                          <span className="font-medium text-white flex items-center gap-1.5">
                            <KoneAILogo size={14} variant="glass" />
                            <span>Kone AI</span>
                          </span>
                          {msg.provider && (
                            <>
                              <span>·</span>
                              <span className="px-1.5 py-0.2 rounded bg-white/5 font-mono text-[10px] text-[#a8c7fa]">
                                {msg.provider}
                              </span>
                            </>
                          )}
                          {activeSubdomain !== 'all' && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-white/5 text-[10px] text-[#c4c7c5]">
                                <SubdomainLogo subdomainId={activeSubdomain} size={11} />
                                <span>{activeScopeInfo.name}</span>
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
                <div className="flex items-start">
                  <div className="bg-[#18191a] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                    <KoneAILogo size={15} variant="glass" className="animate-spin" />
                    <span className="w-2 h-2 rounded-full bg-[#a8c7fa] animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-[#a8c7fa] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#a8c7fa] animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-xs text-[#8e918f] ml-1 font-mono">
                      Thinking with {activeModelInfo.name}
                      {activeSubdomain !== 'all' && ` [${activeScopeInfo.name}]`}...
                    </span>
                  </div>
                </div>
              )}

              {/* Suggested Prompt Chips on Empty/Fresh Chat */}
              {activeSession.messages.length <= 1 && (
                <div className="mt-8 pt-4 border-t border-white/[0.06] space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#c4c7c5] flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#a8c7fa]" />
                        <span>Filter Prompts by Academy Division:</span>
                      </p>
                      <span className="text-[11px] text-[#8e918f] font-mono hidden sm:inline">
                        Active: {activeScopeInfo.name}
                      </span>
                    </div>

                    {/* Subdomain Filter Pills with Official Logos */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {SUBDOMAIN_SCOPES.map((scope) => {
                        const isSelected = activeSubdomain === scope.id;
                        return (
                          <button
                            key={scope.id}
                            onClick={() => {
                              setActiveSubdomain(scope.id);
                              showToast(`Focused on ${scope.name}`, 'info');
                            }}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                              isSelected
                                ? 'bg-[#a8c7fa] text-[#131314] font-semibold shadow-md'
                                : 'bg-[#1e1f20] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white border border-white/5'
                            }`}
                          >
                            <SubdomainLogo subdomainId={scope.id} size={15} />
                            <span>{scope.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#8e918f] mb-2.5">
                      {activeSubdomain === 'all' 
                        ? 'Curated questions across the academy ecosystem:'
                        : `Questions tailored for ${activeScopeInfo.name}:`}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(PROMPTS_BY_SUBDOMAIN[activeSubdomain] || PROMPTS_BY_SUBDOMAIN['all']).map((promptItem, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(promptItem.prompt)}
                          className="p-3.5 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-white/[0.06] text-left transition-all hover:border-[#8ab4f8]/30 group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <SubdomainLogo subdomainId={activeSubdomain} size={16} />
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
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Sticky Chat Input Bar */}
            <div className="p-3 sm:p-4 md:pb-6 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
              <div className="max-w-4xl w-full mx-auto">
                <div className="relative gemini-capsule px-2 sm:px-3 py-2 flex items-center gap-2 border border-white/10 bg-[#1e1f20] focus-within:border-[#8ab4f8]/60 transition-all">
                  
                  {/* Quick Scope Switcher inside Input Capsule */}
                  <button
                    type="button"
                    onClick={() => setSubdomainDropdownOpen(prev => !prev)}
                    className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-[#c4c7c5] hover:text-white transition-all shrink-0 select-none"
                    title={`Active Scope: ${activeScopeInfo.name} (${activeScopeInfo.url}) • Tap to switch division`}
                  >
                    <SubdomainLogo subdomainId={activeSubdomain} size={15} />
                    <span className="hidden sm:inline font-medium text-xs">{activeScopeInfo.name}</span>
                    <ChevronDown size={11} className="text-[#8e918f]" />
                  </button>

                  {/* Multi-line auto-resizing textarea */}
                  <textarea
                    ref={textareaRef}
                    value={inputQuery}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask Kone AI (${activeScopeInfo.name})... (Press Enter to send)`}
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
                    <span>Kone AI</span>
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

              {/* Custom Groq API Key Card (Recommended) */}
              <div className="p-5 rounded-2xl bg-[#1e1f20] border border-[#a8c7fa]/20 space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Zap size={16} className="text-[#a8c7fa]" />
                    Groq API Key (Recommended · 14,400 Free Requests/Day)
                  </label>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    High Capacity
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="gsk_... (paste your Groq key here)"
                  value={parameters.groqApiKey || ''}
                  onChange={(e) => setParameters({ ...parameters, groqApiKey: e.target.value })}
                  className="w-full bg-[#131314] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#8ab4f8] font-mono leading-relaxed"
                />
                <p className="text-[11px] text-[#8e918f]">
                  Get your free high-speed Groq key (no credit card required) at{' '}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-[#8ab4f8] underline hover:text-white">
                    console.groq.com/keys
                  </a>
                  . Powers Llama 3.3 70B & DeepSeek R1 at ~500 tokens/sec with 14,400 free requests per day.
                </p>
              </div>

              {/* Custom Gemini API Key Card */}
              <div className="p-5 rounded-2xl bg-[#1e1f20] border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-[#a8c7fa]" />
                    Google Gemini API Key (Optional)
                  </label>
                  <span className="text-[11px] text-[#8e918f]">Browser Storage</span>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy... (leave blank to use smart offline engine or Groq)"
                  value={parameters.geminiApiKey || ''}
                  onChange={(e) => setParameters({ ...parameters, geminiApiKey: e.target.value })}
                  className="w-full bg-[#131314] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#8ab4f8] font-mono leading-relaxed"
                />
                <p className="text-[11px] text-[#8e918f]">
                  Get a free key from{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#8ab4f8] underline hover:text-white">
                    Google AI Studio
                  </a>
                  . Note: Google limits free accounts to 20 requests/day per project.
                </p>
              </div>

              {/* Reset to Defaults button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setParameters({
                      temperature: 0.7,
                      maxTokens: 2048,
                      systemPrompt: "You are Kone AI, an advanced, friendly, and knowledgeable AI assistant for Kone Academy. You assist students, creators, and engineers with programming, robotics, electronics, web development, and AI across all academy divisions. Provide clear, accurate, and supportive answers with markdown formatting and well-commented code snippets where helpful.",
                      geminiApiKey: ''
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
