import React, { useState } from 'react';
import { Menu, Search, Database, ChevronRight, Plus, Settings, TerminalSquare, History } from 'lucide-react';
import { Session } from '../App';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  sessions: Session[];
  activeSessionId: string;
  onSessionSelect: (id: string) => void;
  onNewSession: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAgentSpecs: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  sessions, 
  activeSessionId, 
  onSessionSelect, 
  onNewSession,
  collapsed,
  onToggleCollapse,
  onOpenAgentSpecs
}) => {
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [missionsOpen, setMissionsOpen] = useState<boolean>(true);
  const [agentsOpen, setAgentsOpen] = useState<boolean>(true);

  const menuItems: MenuItem[] = [
    { id: 'synthesis', name: 'New Synthesis', icon: <TerminalSquare size={18} />, color: '#00D1FF' },
    { id: 'knowledge', name: 'Knowledge Base', icon: <Database size={18} />, color: '#9ca3af' },
  ];

  // Filter sessions by search query
  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`h-screen bg-[#121316] flex flex-col text-[#e3e3e3] text-[14px] overflow-y-auto border-l border-white/5 hidden md:flex transition-all duration-300 ${
      collapsed ? 'w-[72px]' : 'w-[280px]'
    }`}>
      {/* Top controls */}
      <div className={`flex items-center p-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <Menu 
          size={20} 
          onClick={onToggleCollapse}
          className="text-[#9ca3af] hover:text-[#00D1FF] cursor-pointer transition-colors" 
        />
        {!collapsed && (
          <Search 
            size={20} 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
            className={`cursor-pointer transition-colors ${showSearch ? 'text-[#00D1FF]' : 'text-[#9ca3af] hover:text-[#00D1FF]'}`} 
          />
        )}
      </div>

      {/* Real-time Search Input */}
      {!collapsed && showSearch && (
        <div className="px-3 mb-2 animate-in slide-in-from-top-2 duration-200">
          <input 
            type="text" 
            placeholder="Filter sessions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs font-mono outline-none text-[#e3e3e3] placeholder:text-[#9ca3af]/40 focus:border-[#BC00FF]/50"
          />
        </div>
      )}

      {/* Main Menu Navigation */}
      <div className="px-3 space-y-1 mt-2">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => {
              onViewChange(item.id);
            }}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
              activeView === item.id 
              ? 'bg-white/5 border-white/10 text-white' 
              : 'border-transparent hover:bg-white/5 text-[#9ca3af] hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.name : undefined}
          >
            <div style={{ color: activeView === item.id ? item.color : '#9ca3af' }}>
              {item.icon}
            </div>
            {!collapsed && <span className="font-medium">{item.name}</span>}
          </div>
        ))}
      </div>

      {/* Missions Accordion */}
      <div className="mt-6 px-3">
        {!collapsed ? (
          <>
            <div 
              onClick={() => setMissionsOpen(!missionsOpen)}
              className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#9ca3af] group-hover:text-white">Missions</span>
              <ChevronRight size={16} className={`text-[#9ca3af] transition-transform ${missionsOpen ? 'rotate-90' : ''}`} />
            </div>
            {missionsOpen && (
              <div 
                onClick={onNewSession}
                className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer mt-1 transition-colors text-[#9ca3af] hover:text-white border border-transparent hover:border-white/5"
              >
                <Plus size={18} />
                <span>New Mission Node</span>
              </div>
            )}
          </>
        ) : (
          <div 
            onClick={onNewSession}
            className="flex items-center justify-center p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-[#9ca3af] hover:text-[#00D1FF]"
            title="New Mission Node"
          >
            <Plus size={18} />
          </div>
        )}
      </div>

      {/* Agents Accordion */}
      <div className="mt-6 px-3">
        {!collapsed ? (
          <>
            <div 
              onClick={() => setAgentsOpen(!agentsOpen)}
              className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#9ca3af] group-hover:text-white">Agents</span>
              <ChevronRight size={16} className={`text-[#9ca3af] transition-transform ${agentsOpen ? 'rotate-90' : ''}`} />
            </div>
            {agentsOpen && (
              <div 
                onClick={onOpenAgentSpecs}
                className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer mt-1 transition-colors text-[#9ca3af] hover:text-white border border-transparent hover:border-white/5"
              >
                <img src="/app-ai.svg" alt="Agent" className="w-5 h-5 opacity-70 grayscale group-hover:grayscale-0" />
                <span>Pathfinder Agent</span>
              </div>
            )}
          </>
        ) : (
          <div 
            onClick={onOpenAgentSpecs}
            className="flex items-center justify-center p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-[#9ca3af] hover:text-[#BC00FF]"
            title="Pathfinder Agent Details"
          >
            <img src="/app-ai.svg" alt="Agent" className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Session Logs Section */}
      {!collapsed && (
        <div className="mt-6 px-3 flex-1 overflow-y-auto max-h-[30vh] custom-scrollbar">
          <div className="flex items-center gap-2 p-3">
              <History size={14} className="text-[#9ca3af]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#9ca3af]">Session Logs</span>
          </div>
          <div className="space-y-1">
            {filteredSessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => {
                  onSessionSelect(session.id);
                  onViewChange('synthesis');
                }}
                className={`truncate px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm ${
                  activeSessionId === session.id && activeView === 'synthesis'
                  ? 'bg-white/5 text-[#00D1FF] border border-white/5'
                  : 'text-[#9ca3af] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={session.name}
              >
                {session.name}
              </div>
            ))}
            {filteredSessions.length === 0 && (
              <div className="px-3 py-2 text-xs font-mono text-[#9ca3af]/40 uppercase tracking-widest">
                No logs found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sitemap, Settings & Bottom Sections */}
      <div className="p-3 mb-2 space-y-1 mt-auto">
        <div 
            onClick={() => onViewChange('sitemap')}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                activeView === 'sitemap'
                ? 'bg-white/5 border-white/10 text-white'
                : 'border-transparent hover:bg-white/5 text-[#9ca3af] hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? "Subdomain Sitemap" : undefined}
        >
          <div className="flex items-center gap-3">
            <Database size={18} className={activeView === 'sitemap' ? 'text-[#bd00ff]' : ''} />
            {!collapsed && <span style={{ fontWeight: 'bold', color: '#bd00ff' }}>Subdomain Sitemap</span>}
          </div>
          {!collapsed && (
            <div className={`w-1.5 h-1.5 rounded-full ${activeView === 'sitemap' ? 'bg-[#bd00ff]' : 'bg-transparent'} shadow-[0_0_8px_currentColor]`}></div>
          )}
        </div>

        <div 
            onClick={() => onViewChange('settings')}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                activeView === 'settings'
                ? 'bg-white/5 border-white/10 text-white'
                : 'border-transparent hover:bg-white/5 text-[#9ca3af] hover:text-white'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? "Lab Settings" : undefined}
        >
          <div className="flex items-center gap-3">
            <Settings size={18} />
            {!collapsed && <span>Lab Settings</span>}
          </div>
          {!collapsed && (
            <div className={`w-1.5 h-1.5 rounded-full ${activeView === 'settings' ? 'bg-[#00D1FF]' : 'bg-transparent'} shadow-[0_0_8px_currentColor]`}></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
