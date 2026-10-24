import React, { useState } from 'react';
import { 
  Home, Scissors, Users, ShoppingBag, Clock, Calendar, 
  LogIn, MessageSquare, ChevronLeft, Download, ShieldCheck, 
  CheckCircle2, X 
} from 'lucide-react';
import { ScreenId, UserRole } from '../types';

interface PublicMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectScreen: (screen: ScreenId) => void;
  onLoginClick?: (role: UserRole) => void;
  onOpenAuth?: (initialMode?: 'client' | 'register' | 'professional' | 'admin') => void;
}

export const PublicMenu: React.FC<PublicMenuProps> = ({
  isOpen,
  onToggle,
  onSelectScreen,
  onLoginClick,
  onOpenAuth,
}) => {
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  const handleOpenAuth = (mode: 'client' | 'register' | 'professional' | 'admin') => {
    onToggle();
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else if (onLoginClick) {
      onLoginClick(mode === 'admin' ? 'admin' : mode === 'professional' ? 'professional' : 'client');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity" 
          onClick={onToggle} 
        />
      )}

      {/* Vertical Public Menu Drawer - Fixed 100dvh with internal scroll */}
      <aside 
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-[88vw] max-w-[320px] sm:w-80 h-[100dvh] max-h-[100dvh]
          bg-slate-950 text-slate-100 border-r border-slate-800 shadow-2xl
          flex flex-col overflow-hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header - Fixed & Non-collapsible */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-950/95 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold shrink-0 shadow-md shadow-amber-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-base truncate">L'Élite Salon</h2>
              <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider truncate">Menu Público Externo</p>
            </div>
          </div>

          {/* Close Arrow Button */}
          <button
            onClick={onToggle}
            className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 hover:bg-slate-800 active:scale-95 transition-all shrink-0"
            title="Fechar Menu"
            aria-label="Fechar Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          <button
            onClick={() => { onSelectScreen('home'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 active:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Início</span>
          </button>

          <button
            onClick={() => { onSelectScreen('home'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 active:bg-slate-800 transition-colors"
          >
            <Scissors className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Serviços & Especialidades</span>
          </button>

          <button
            onClick={() => { onSelectScreen('home'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 active:bg-slate-800 transition-colors"
          >
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Profissionais da Equipe</span>
          </button>

          <button
            onClick={() => { onSelectScreen('products'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 active:bg-slate-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Vitrine de Produtos</span>
          </button>

          <button
            onClick={() => { onSelectScreen('home'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 active:bg-slate-800 transition-colors"
          >
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Horários de Atendimento</span>
          </button>

          <button
            onClick={() => { onSelectScreen('booking'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 active:bg-slate-800 transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Agendar Atendimento</span>
          </button>

          <button
            onClick={() => { onSelectScreen('chat'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 active:bg-slate-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Chat & Assistente</span>
          </button>

          {/* PWA Install Button */}
          <div className="pt-2">
            <button
              onClick={() => setShowPwaBanner(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors border border-emerald-500/20"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Instalar Aplicativo (PWA)</span>
            </button>
          </div>

          {/* In-drawer PWA instructions card */}
          {showPwaBanner && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 mt-2 animate-fadeIn">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Instalar no Dispositivo
                </span>
                <button 
                  onClick={() => setShowPwaBanner(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                No Safari (iOS) ou Chrome (Android), toque no botão de compartilhar ou menu (⋮) e escolha <strong>"Adicionar à Tela Inicial"</strong>.
              </p>
            </div>
          )}
        </nav>

        {/* Separated Bottom Footer - Fully Visible & Safe Area Aware */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-slate-800/90 bg-slate-950/98 backdrop-blur-md space-y-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {/* Main Button: Entrar ou Cadastrar */}
          <button
            onClick={() => handleOpenAuth('client')}
            className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5"
          >
            <LogIn className="w-4 h-4 stroke-[2.5]" />
            <span>Entrar ou Cadastrar</span>
          </button>

          {/* Secondary Button: Acesso Administrador Autorizado */}
          <button
            onClick={() => handleOpenAuth('admin')}
            className="w-full min-h-[38px] py-2 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Acesso Administrador</span>
          </button>
        </div>
      </aside>
    </>
  );
};
