import React from 'react';
import { Home, Calendar, Image as ImageIcon, User, MessageSquare } from 'lucide-react';
import { ScreenId } from '../types';

interface MobileNavProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onToggleChat: () => void;
  isChatOpen?: boolean;
  isInFrame?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentScreen,
  onSelectScreen,
  onToggleChat,
  isChatOpen = false,
  isInFrame = false,
}) => {
  // Exactly 5 options in the requested order:
  // 1. Início
  // 2. Agendar
  // 3. Galeria de Serviços
  // 4. Cliente
  // 5. Chat
  const tabs = [
    {
      id: 'home' as const,
      label: 'Início',
      icon: Home,
      action: () => onSelectScreen('home'),
      isActive: currentScreen === 'home' && !isChatOpen,
    },
    {
      id: 'booking' as const,
      label: 'Agendar',
      icon: Calendar,
      action: () => onSelectScreen('booking'),
      isActive: currentScreen === 'booking' && !isChatOpen,
    },
    {
      id: 'gallery' as const,
      label: 'Galeria de Serviços',
      icon: ImageIcon,
      action: () => onSelectScreen('gallery'),
      isActive: currentScreen === 'gallery' && !isChatOpen,
    },
    {
      id: 'client' as const,
      label: 'Cliente',
      icon: User,
      action: () => onSelectScreen('client'),
      isActive: currentScreen === 'client' && !isChatOpen,
    },
    {
      id: 'chat' as const,
      label: 'Chat',
      icon: MessageSquare,
      action: onToggleChat,
      isActive: isChatOpen || currentScreen === 'chat',
    },
  ];

  const positionClasses = isInFrame
    ? 'absolute bottom-0 left-0 right-0 z-40'
    : 'fixed bottom-0 left-0 right-0 z-40 lg:hidden';

  return (
    <nav
      aria-label="Navegação Inferior"
      className={`
        ${positionClasses}
        bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe
        shadow-[0_-4px_24px_rgba(0,0,0,0.6)] select-none
      `}
    >
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`
                flex flex-col items-center justify-center py-1 transition-all duration-150 min-h-[48px] px-0.5 relative group
                ${tab.isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'}
              `}
              title={tab.label}
              aria-label={tab.label}
            >
              {tab.isActive && (
                <span className="absolute top-1 w-6 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
              <Icon
                className={`w-5 h-5 transition-transform group-active:scale-90 ${
                  tab.isActive
                    ? 'stroke-[2.5] text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'stroke-[1.75]'
                }`}
              />
              <span
                className={`
                  text-[9px] sm:text-[10px] leading-3 font-medium tracking-tight mt-1 text-center truncate max-w-full px-0.5 block
                  ${tab.isActive ? 'text-amber-400 font-semibold' : 'text-slate-400'}
                `}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
