import React from 'react';
import { Menu, Search, Database, ChevronRight, Plus, Settings, TerminalSquare, History } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems: MenuItem[] = [
    { id: 'synthesis', name: 'New Synthesis', icon: <TerminalSquare size={18} />, color: '#00D1FF' },
    { id: 'knowledge', name: 'Knowledge Base', icon: <Database size={18} />, color: '#9ca3af' },
  ];

  return (
    <div className="w-[280px] h-screen bg-[#121316] flex flex-col text-[#e3e3e3] text-[14px] overflow-y-auto border-l border-white/5 hidden md:flex">
      {/* Top controls */}
      <div className="flex justify-between items-center p-4">
        <Menu size={20} className="text-[#9ca3af] hover:text-[#00D1FF] cursor-pointer transition-colors" />
        <Search size={20} className="text-[#9ca3af] hover:text-[#00D1FF] cursor-pointer transition-colors" />
      </div>

      <div className="px-3 space-y-1 mt-2">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                activeView === item.id 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'border-transparent hover:bg-white/5 text-[#9ca3af] hover:text-white'
            }`}
          >
            <div style={{ color: activeView === item.id ? item.color : '#9ca3af' }}>
              {item.icon}
            </div>
            <span className="font-medium">{item.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 px-3">
        <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#9ca3af] group-hover:text-white">Missions</span>
          <ChevronRight size={16} className="text-[#9ca3af]" />
        </div>
        <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer mt-1 transition-colors text-[#9ca3af] hover:text-white">
          <Plus size={18} />
          <span>New Mission Node</span>
        </div>
      </div>

      <div className="mt-6 px-3">
        <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#9ca3af] group-hover:text-white">Agents</span>
          <ChevronRight size={16} className="text-[#9ca3af]" />
        </div>
        <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer mt-1 transition-colors text-[#9ca3af] hover:text-white">
          <img src="/app-ai.svg" alt="Agent" className="w-5 h-5 opacity-70 grayscale group-hover:grayscale-0" />
          <span>Pathfinder Agent</span>
        </div>
      </div>

      <div className="mt-6 px-3 flex-1">
        <div className="flex items-center gap-2 p-3">
            <History size={14} className="text-[#9ca3af]" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#9ca3af]">Session Logs</span>
        </div>
        <div className="space-y-1">
          <div className="truncate px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-sm text-[#9ca3af] hover:text-white">
            Alex - Level 2 Trajectory
          </div>
          <div className="truncate px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-sm text-[#9ca3af] hover:text-white">
            Optimizing 'Motor Master' Loop
          </div>
          <div className="truncate px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-sm text-[#9ca3af] hover:text-white">
            Neural Gap Detection - Sensors
          </div>
        </div>
      </div>

      <div className="p-3 mb-2">
        <div 
            onClick={() => onViewChange('settings')}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                activeView === 'settings'
                ? 'bg-white/5 border-white/10 text-white'
                : 'border-transparent hover:bg-white/5 text-[#9ca3af] hover:text-white'
            }`}
        >
          <div className="flex items-center gap-3">
            <Settings size={18} />
            <span>Lab Settings</span>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${activeView === 'settings' ? 'bg-[#00D1FF]' : 'bg-[#BC00FF]'} shadow-[0_0_8px_currentColor]`}></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
