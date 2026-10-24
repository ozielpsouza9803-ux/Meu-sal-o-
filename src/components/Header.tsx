import React from 'react';
import { Monitor, Menu, LogIn, UserCheck, ShieldCheck, LogOut } from 'lucide-react';
import { ScreenId, UserRole } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  currentRole: UserRole;
  isAuthenticated?: boolean;
  onOpenAuth?: (mode?: 'client' | 'register' | 'professional' | 'admin') => void;
  onLogout?: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentScreen,
  onSelectScreen,
  currentRole,
  isAuthenticated = false,
  onOpenAuth,
  onLogout,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6 min-w-0">
      {/* Zone 1: Brand / Menu Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 shrink">
        <button
          onClick={onToggleSidebar}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-slate-800/90 text-amber-400 border border-slate-700/80 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all shadow-sm shrink-0"
          title="Abrir Menu Lateral"
          aria-label="Abrir Menu Lateral"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>
        <div className="min-w-0">
          <span className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate block">
            L'Élite Salon & Spa
          </span>
          <span className="text-[10px] sm:text-[11px] text-amber-400 font-medium capitalize truncate block">
            {isAuthenticated 
              ? `Perfil: ${currentRole === 'client' ? 'Cliente' : currentRole === 'professional' ? 'Profissional' : 'Administrador'}`
              : 'Visitante (Público)'}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Desktop & Tablet landscape) */}
      <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs sm:text-sm font-medium text-slate-300 shrink-0">
        <button 
          onClick={() => onSelectScreen('home')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1.5 ${currentScreen === 'home' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Início
        </button>
        <button 
          onClick={() => onSelectScreen('booking')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1.5 ${currentScreen === 'booking' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Agendar
        </button>
        <button 
          onClick={() => onSelectScreen('gallery')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1.5 ${currentScreen === 'gallery' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Galeria de Serviços
        </button>
        <button 
          onClick={() => onSelectScreen('products')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1.5 ${currentScreen === 'products' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Produtos
        </button>
        <button 
          onClick={() => onSelectScreen('chat')}
          className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1.5 ${currentScreen === 'chat' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Assistente IA
        </button>
      </nav>

      {/* Zone 3: Actions & Auth */}
      <div className="flex items-center gap-2 shrink-0">
        {!isAuthenticated ? (
          <button
            onClick={() => onOpenAuth?.('client')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95 min-h-[40px]"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar / Cadastrar</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onSelectScreen(currentRole === 'admin' ? 'admin' : currentRole === 'professional' ? 'professional' : 'client')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/40 hover:text-amber-400 transition-all min-h-[40px]"
            >
              {currentRole === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
              <span>{currentRole === 'admin' ? 'Painel ADM' : 'Minha Área'}</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center transition-colors"
                title="Sair"
                aria-label="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <button
          onClick={onToggleMobileFrame}
          className={`
            hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all min-h-[40px]
            ${isMobileFrame 
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' 
              : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }
          `}
          title={isMobileFrame ? "Mudar para Tela Cheia" : "Simular Dispositivo 9:16"}
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden lg:inline">{isMobileFrame ? "Tela Cheia" : "Modo 9:16"}</span>
        </button>
      </div>
    </header>
  );
};
