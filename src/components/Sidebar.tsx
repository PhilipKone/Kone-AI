import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Settings, 
  MessageSquare, 
  X,
  Sparkles,
  Cpu,
  Compass,
  Network,
  HelpCircle,
  History,
  MoreVertical
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
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <div className="flex flex-col h-full bg-[#1e1f20] text-[#e3e3e3] text-sm select-none">
      
      {/* Top Header & Collapse / Close Trigger */}
      <div className="p-3.5 flex items-center justify-between">
        <button
          onClick={isMobileMode ? onCloseMobile : onToggleCollapse}
          className="p-2 rounded-full text-[#c4c7c5] hover:text-white hover:bg-white/10 transition-colors"
          title={isMobileMode ? "Close menu" : collapsed ? "Expand menu" : "Collapse menu"}
        >
          {isMobileMode ? <X size={20} /> : <Menu size={20} />}
        </button>

        {isMobileMode && (
          <span className="font-medium text-sm text-white flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#a8c7fa]" />
            <span>Kone AI</span>
          </span>
        )}
      </div>

      {/* Gemini Pill: + New chat */}
      <div className="px-3 py-1">
        <button
          onClick={handleCreateNew}
          className={`w-full py-2.5 rounded-full bg-[#131314] hover:bg-[#282a2c] text-[#e3e3e3] font-medium text-xs md:text-sm transition-all flex items-center border border-white/[0.08] ${
            !isMobileMode && collapsed ? 'justify-center px-0' : 'px-4 gap-3'
          }`}
          title="New chat"
        >
          <Plus size={18} className="text-[#a8c7fa]" />
          {(isMobileMode || !collapsed) && <span>New chat</span>}
        </button>
      </div>

      {/* Search Input Filter */}
      {(isMobileMode || !collapsed) && sessions.length > 3 && (
        <div className="px-3 pt-2">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[#8e918f]" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131314]/80 border border-white/[0.06] focus:border-[#8ab4f8] rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-[#8e918f] outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Gemini Navigation Views */}
      <div className="px-3 pt-3 space-y-1">
        <button
          onClick={() => handleSelectView('synthesis')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full transition-colors text-xs font-medium text-left ${
            activeView === 'synthesis'
            ? 'bg-[#282a2c] text-white'
            : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]/60'
          } ${!isMobileMode && collapsed ? 'justify-center px-0' : ''}`}
          title="Gemini Pathfinder"
        >
          <Sparkles size={16} className={activeView === 'synthesis' ? 'text-[#a8c7fa]' : 'text-[#8e918f]'} />
          {(isMobileMode || !collapsed) && <span>Gemini Pathfinder</span>}
        </button>

        <button
          onClick={() => handleSelectView('knowledge')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full transition-colors text-xs font-medium text-left ${
            activeView === 'knowledge'
            ? 'bg-[#282a2c] text-white'
            : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]/60'
          } ${!isMobileMode && collapsed ? 'justify-center px-0' : ''}`}
          title="Hardware Schematics & Docs"
        >
          <Cpu size={16} className={activeView === 'knowledge' ? 'text-[#a8c7fa]' : 'text-[#8e918f]'} />
          {(isMobileMode || !collapsed) && <span>Hardware Schematics</span>}
        </button>
      </div>

      {/* Recent Chats Section */}
      {(isMobileMode || !collapsed) && (
        <div className="mt-4 px-3 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-1 text-[11px] font-semibold text-[#8e918f] tracking-wide">
            Recent
          </div>

          <div className="space-y-0.5 mt-1">
            {filteredSessions.map((session) => {
              const isActive = activeSessionId === session.id && activeView === 'synthesis';
              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-full cursor-pointer transition-colors text-xs ${
                    isActive
                    ? 'bg-[#282a2c] text-white font-medium'
                    : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]/60'
                  }`}
                  title={session.name}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1">
                    <MessageSquare size={14} className={isActive ? 'text-[#a8c7fa]' : 'text-[#8e918f]'} />
                    <span className="truncate">{session.name}</span>
                  </div>
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-[#8e918f]">
                No recent chats
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer Section: Gemini Pro / Settings / Location */}
      <div className="p-3 mt-auto border-t border-white/[0.06] space-y-1">
        <button
          onClick={() => handleSelectView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-full transition-colors text-xs font-medium text-left ${
            activeView === 'settings'
            ? 'bg-[#282a2c] text-white'
            : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]/60'
          } ${!isMobileMode && collapsed ? 'justify-center px-0' : ''}`}
          title="Settings"
        >
          <Settings size={16} className={activeView === 'settings' ? 'text-[#a8c7fa]' : 'text-[#8e918f]'} />
          {(isMobileMode || !collapsed) && <span>Settings</span>}
        </button>

        <button
          onClick={() => handleSelectView('sitemap')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-full transition-colors text-xs font-medium text-left ${
            activeView === 'sitemap'
            ? 'bg-[#282a2c] text-white'
            : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]/60'
          } ${!isMobileMode && collapsed ? 'justify-center px-0' : ''}`}
          title="Academy Sitemap"
        >
          <Network size={16} className={activeView === 'sitemap' ? 'text-[#a8c7fa]' : 'text-[#8e918f]'} />
          {(isMobileMode || !collapsed) && <span>Academy Sitemap</span>}
        </button>

        {/* Gemini Location Stamp */}
        {(isMobileMode || !collapsed) && (
          <div className="pt-2 px-3 text-[11px] text-[#8e918f] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Kone Academy · Gemini 2.0 Flash</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`h-screen bg-[#1e1f20] hidden md:flex flex-col border-r border-white/[0.06] overflow-y-auto transition-all duration-250 ${
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
          <div className="relative w-[280px] max-w-[85vw] h-full bg-[#1e1f20] border-r border-white/10 shadow-2xl z-10 animate-in slide-in-from-left duration-250 overflow-y-auto">
            {sidebarBody(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;


