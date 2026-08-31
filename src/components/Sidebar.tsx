import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Database, 
  Plus, 
  Settings, 
  History, 
  X,
  Compass,
  Cpu,
  Sliders,
  Sparkles,
  Layers,
  Network
} from 'lucide-react';
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
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
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
  onOpenAgentSpecs,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter sessions by search query
  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectView = (view: string) => {
    onViewChange(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectSession = (id: string) => {
    onSessionSelect(id);
    onViewChange('synthesis');
    if (onCloseMobile) onCloseMobile();
  };

  const handleCreateNew = () => {
    onNewSession();
    onViewChange('synthesis');
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarBody = (isMobileMode = false) => (
    <div className="flex flex-col h-full text-white text-xs select-none">
      
      {/* Top Header / Collapse Control */}
      <div className={`p-4 flex items-center ${!isMobileMode && collapsed ? 'justify-center' : 'justify-between'} border-b border-white/[0.06]`}>
        {isMobileMode ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Compass size={16} className="text-indigo-400" />
              </div>
              <span className="font-semibold text-white tracking-tight text-sm">Kone AI Navigation</span>
            </div>
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            {!collapsed && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                Workspace
              </span>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Primary Action Button (+ New Trajectory) */}
      <div className="p-3">
        <button
          onClick={handleCreateNew}
          className={`w-full py-2 px-3 rounded-xl bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition-all flex items-center ${
            !isMobileMode && collapsed ? 'justify-center p-2' : 'justify-center gap-2'
          } shadow-sm active:scale-98`}
          title="Start New Trajectory"
        >
          <Plus size={15} />
          {(isMobileMode || !collapsed) && <span>New Trajectory</span>}
        </button>
      </div>

      {/* Search Input (Linear style) */}
      {(isMobileMode || !collapsed) && (
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-[#64748b]" />
            <input 
              type="text" 
              placeholder="Search trajectories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-indigo-500/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#64748b] outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Main Views Navigation */}
      <div className="px-3 space-y-0.5 mt-1">
        <button
          onClick={() => handleSelectView('synthesis')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left ${
            activeView === 'synthesis'
            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
            : 'text-[#94a3b8] hover:text-white hover:bg-white/5 border border-transparent'
          } ${!isMobileMode && collapsed ? 'justify-center px-2' : ''}`}
          title="AI Pathfinder"
        >
          <Compass size={16} className={activeView === 'synthesis' ? 'text-indigo-400' : 'text-[#64748b]'} />
          {(isMobileMode || !collapsed) && <span>AI Pathfinder</span>}
        </button>

        <button
          onClick={() => handleSelectView('knowledge')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left ${
            activeView === 'knowledge'
            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
            : 'text-[#94a3b8] hover:text-white hover:bg-white/5 border border-transparent'
          } ${!isMobileMode && collapsed ? 'justify-center px-2' : ''}`}
          title="Hardware Schematics & Docs"
        >
          <Cpu size={16} className={activeView === 'knowledge' ? 'text-indigo-400' : 'text-[#64748b]'} />
          {(isMobileMode || !collapsed) && <span>Hardware Knowledge</span>}
        </button>
      </div>

      {/* Trajectories History Section (Grouped by Date) */}
      {(isMobileMode || !collapsed) && (
        <div className="mt-4 px-3 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b] flex items-center gap-1.5">
            <History size={12} />
            <span>Recent Trajectories</span>
          </div>

          <div className="space-y-0.5 mt-1">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`w-full text-left truncate px-3 py-2 rounded-xl transition-colors text-xs ${
                  activeSessionId === session.id && activeView === 'synthesis'
                  ? 'bg-white/[0.08] text-white font-medium border border-white/[0.08]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
                title={session.name}
              >
                {session.name}
              </button>
            ))}

            {filteredSessions.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-[#64748b]">
                No matching trajectories
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer Section: Sitemap & Settings */}
      <div className="p-3 mt-auto border-t border-white/[0.06] space-y-0.5">
        <button
          onClick={() => handleSelectView('sitemap')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left ${
            activeView === 'sitemap'
            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
            : 'text-[#94a3b8] hover:text-white hover:bg-white/5 border border-transparent'
          } ${!isMobileMode && collapsed ? 'justify-center px-2' : ''}`}
          title="Academy Network Sitemap"
        >
          <Network size={16} className={activeView === 'sitemap' ? 'text-indigo-400' : 'text-[#64748b]'} />
          {(isMobileMode || !collapsed) && <span>Academy Sitemap</span>}
        </button>

        <button
          onClick={() => handleSelectView('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors font-medium text-left ${
            activeView === 'settings'
            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
            : 'text-[#94a3b8] hover:text-white hover:bg-white/5 border border-transparent'
          } ${!isMobileMode && collapsed ? 'justify-center px-2' : ''}`}
          title="Lab Settings"
        >
          <Settings size={16} className={activeView === 'settings' ? 'text-indigo-400' : 'text-[#64748b]'} />
          {(isMobileMode || !collapsed) && <span>Lab Settings</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`h-screen bg-[#0d0e14] hidden md:flex flex-col border-r border-white/[0.06] overflow-y-auto transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}>
        {sidebarBody(false)}
      </aside>

      {/* Mobile Drawer Slide-over */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-start">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-[280px] max-w-[85vw] h-full bg-[#0d0e14] border-r border-white/10 shadow-2xl z-10 animate-in slide-in-from-left duration-300 overflow-y-auto">
            {sidebarBody(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

