import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { ScreenId, UserRole } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  currentRole: UserRole;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentScreen,
  onSelectScreen,
  currentRole,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Brand / Menu Toggle */}
      <div className="flex items-center gap-3 shrink-0 pl-12 sm:pl-16">
        <div>
          <span className="text-base font-bold text-white tracking-tight whitespace-nowrap block">
            L'Élite Salon & Spa
          </span>
          <span className="text-[11px] text-amber-400 capitalize font-medium">
            Perfil: {currentRole === 'client' ? 'Cliente' : currentRole === 'professional' ? 'Profissional' : 'Administrador'}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (4-5 single-line items) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button 
          onClick={() => onSelectScreen('home')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${currentScreen === 'home' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Início
        </button>
        <button 
          onClick={() => onSelectScreen('booking')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${currentScreen === 'booking' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Agendar
        </button>
        <button 
          onClick={() => onSelectScreen('products')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${currentScreen === 'products' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Produtos
        </button>
        <button 
          onClick={() => onSelectScreen('chat')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${currentScreen === 'chat' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Assistente IA
        </button>
      </nav>

      {/* Zone 3: View Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMobileFrame}
          className={`
            hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors
            ${isMobileFrame 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }
          `}
          title={isMobileFrame ? "Mudar para Tela Cheia" : "Simular Dispositivo 9:16"}
        >
          {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          <span className="hidden xl:inline">{isMobileFrame ? "Tela Cheia" : "Modo 9:16 PWA"}</span>
        </button>
      </div>
    </header>
  );
};
