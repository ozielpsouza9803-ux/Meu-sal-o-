import React from 'react';
import { Home, Calendar, Image as ImageIcon, User, MessageSquare } from 'lucide-react';
import { ScreenId } from '../types';

interface MobileNavProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onToggleChat: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentScreen, onSelectScreen, onToggleChat }) => {
  const tabs = [
    { id: 'home' as ScreenId, label: 'Início', icon: Home },
    { id: 'booking' as ScreenId, label: 'Agendar', icon: Calendar },
    { id: 'gallery' as ScreenId, label: 'Galeria', icon: ImageIcon },
    { id: 'client' as ScreenId, label: 'Cliente', icon: User },
    { id: 'chat-toggle' as ScreenId, label: 'Chat', icon: MessageSquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 lg:hidden pb-safe shadow-2xl">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => tab.id === 'chat-toggle' ? onToggleChat() : onSelectScreen(tab.id)}
              className={`
                flex flex-col items-center justify-center py-1 transition-colors
                ${isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[9px] font-medium tracking-tight mt-1 truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
