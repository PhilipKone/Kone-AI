import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MissionSimulator from './components/MissionSimulator';
import { MoreVertical, Database, Settings, ShieldCheck, Zap } from 'lucide-react';
import './index.css';

interface PlaceholderViewProps {
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon: Icon, description }) => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#BC00FF]/20 to-[#00D1FF]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Icon size={40} className="text-[#BC00FF] relative z-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{title}</h2>
        <p className="text-[#9ca3af] max-w-md font-mono text-sm uppercase tracking-wider">{description}</p>
        <div className="mt-8 flex gap-3">
            <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono transition-all">Initialize Module</button>
            <button className="px-6 py-2 bg-[#BC00FF]/20 hover:bg-[#BC00FF]/30 border border-[#BC00FF]/50 rounded-lg text-xs font-mono text-[#BC00FF] transition-all">Sync Core</button>
        </div>
    </div>
);

function App() {
  const [activeView, setActiveView] = useState<string>('synthesis');

  const renderContent = () => {
    switch (activeView) {
      case 'knowledge':
        return (
            <PlaceholderView 
                title="Knowledge Base" 
                icon={Database} 
                description="Core repository for hardware schematics and mission logic." 
            />
        );
      case 'settings':
        return (
            <PlaceholderView 
                title="Lab Settings" 
                icon={Settings} 
                description="Configure hardware offsets, API routing, and AI safety protocols." 
            />
        );
      case 'synthesis':
      default:
        return <MissionSimulator />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden text-[#e3e3e3] font-sans selection:bg-purple-500/30 flex-row-reverse">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex-1 flex flex-col h-full relative">
        <header className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#BC00FF] to-[#00D1FF] p-[1px]">
               <div className="w-full h-full bg-[#0a0a0c] rounded-[11px] flex items-center justify-center">
                 <img src="/app-ai.svg" alt="Kone AI" className="w-5 h-5" />
               </div>
             </div>
             <div className="text-[20px] font-semibold tracking-tight bg-gradient-to-r from-[#BC00FF] to-[#00D1FF] bg-clip-text text-transparent cursor-pointer" onClick={() => setActiveView('synthesis')}>Kone AI</div>
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
                <MoreVertical size={20} className="text-[#9ca3af] hover:text-white cursor-pointer" />
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
