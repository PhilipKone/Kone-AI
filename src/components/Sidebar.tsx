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
  Network,
  Trash2,
  Bot
} from 'lucide-react';
import { ChatSession } from '../types';
import KoneAILogo from './KoneAILogo';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSessionSelect: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
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
  onDeleteSession,
  collapsed,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectView = (view: string) => {
    onViewChange(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectSession = (id: string) => {
    onSessionSelect(id);
    onViewChange('chat');
    if (onCloseMobile) onCloseMobile();
  };

  const handleCreateNew = () => {
    onNewSession();
    onViewChange('chat');
    if (onCloseMobile) onCloseMobile();
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSession(id);
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

        {(isMobileMode || !collapsed) && (
          <div className="flex items-center gap-2 pr-2">
            <span className="font-semibold text-sm text-white flex items-center gap-2">
              <KoneAILogo size={22} variant="glass" className="drop-shadow-sm" />
              <span>Kone AI</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#a8c7fa]/10 text-[#a8c7fa] font-mono">
              Chatbot
            </span>
          </div>
        )}
      </div>

      {/* New chat button */}
      <div className="px-3 py-1.5">
        <button
          onClick={handleCreateNew}
          className={`w-full py-2.5 rounded-full bg-[#131314] hover:bg-[#282a2c] text-[#e3e3e3] font-medium text-xs md:text-sm transition-all flex items-center border border-white/[0.08] shadow-sm ${
            !isMobileMode && collapsed ? 'justify-center px-0' : 'px-4 gap-3'
          }`}
          title="New chat"
        >
          <Plus size={18} className="text-[#a8c7fa]" />
          {(isMobileMode || !collapsed) && <span>New chat</span>}
        </button>
      </div>

      {/* Search Input Filter */}
      {(isMobileMode || !collapsed) && sessions.length > 2 && (
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

      {/* Navigation Views */}
      <div className="px-3 pt-3 space-y-1">
        <button
          onClick={() => handleSelectView('chat')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full transition-colors text-xs font-medium text-left ${
            activeView === 'chat'
            ? 'bg-[#282a2c] text-white font-semibold'
            : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]/60'
          } ${!isMobileMode && collapsed ? 'justify-center px-0' : ''}`}
          title="AI Assistant"
        >
          <Sparkles size={16} className={activeView === 'chat' ? 'text-[#a8c7fa]' : 'text-[#8e918f]'} />
          {(isMobileMode || !collapsed) && <span>AI Chatbot</span>}
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
          {(isMobileMode || !collapsed) && <span>Hardware Docs</span>}
        </button>
      </div>

      {/* Recent Chats Section */}
      {(isMobileMode || !collapsed) && (
        <div className="mt-4 px-3 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-1 text-[11px] font-semibold text-[#8e918f] tracking-wide flex items-center justify-between">
            <span>Recent Chats</span>
            <span className="text-[10px] text-[#8e918f]/70">{sessions.length}</span>
          </div>

          <div className="space-y-0.5 mt-1">
            {filteredSessions.map((session) => {
              const isActive = activeSessionId === session.id && activeView === 'chat';
              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors text-xs ${
                    isActive
                    ? 'bg-[#282a2c] text-white font-medium'
                    : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]/60'
                  }`}
                  title={session.title}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                    <MessageSquare size={14} className={isActive ? 'text-[#a8c7fa] shrink-0' : 'text-[#8e918f] shrink-0'} />
                    <span className="truncate">{session.title}</span>
                  </div>

                  {/* Delete Session Button */}
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-[#8e918f] transition-opacity shrink-0 rounded"
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-[#8e918f]">
                No chats found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer Section */}
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

        {/* Location / Status Stamp */}
        {(isMobileMode || !collapsed) && (
          <div className="pt-2 px-3 text-[11px] text-[#8e918f] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Kone Academy · AI Engine</span>
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
