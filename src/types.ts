export type Role = 'user' | 'assistant' | 'system';

export type ModelProvider = 
  | 'gemini-3.8-flash'
  | 'gemini-3.1-pro'
  | 'gemini-flash' 
  | 'gemini-pro' 
  | 'gpt-4o-mini' 
  | 'gpt-4o' 
  | 'deepseek-r1';

export interface ModelOption {
  id: ModelProvider;
  name: string;
  badge: string;
  description: string;
  speed: 'Ultra-Fast' | 'Fast' | 'Reasoning';
}

export interface SubdomainScope {
  id: string;
  name: string;
  icon: string;
  url: string;
  tagline: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  provider?: string;
  subdomain?: string;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  provider: ModelProvider;
  subdomain?: string;
}

export interface ChatRequest {
  message: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  provider: ModelProvider;
  subdomain?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  role: 'assistant';
  content: string;
  provider: string;
  subdomain?: string;
  timestamp: number;
  logicTrace?: string[];
  roadmap?: any[];
}

export interface AISettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  geminiApiKey?: string;
}
