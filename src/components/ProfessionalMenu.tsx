import React from 'react';
import { Briefcase, Calendar, Users, MessageSquare, User, LogOut, ChevronLeft } from 'lucide-react';
import { ScreenId } from '../types';

interface ProfessionalMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onLogout: () => void;
}

export const ProfessionalMenu: React.FC<ProfessionalMenuProps> = ({
  isOpen,
  onToggle,
  currentScreen,
  onSelectScreen,
  onLogout,
}) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity" onClick={onToggle} />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-[88vw] max-w-[320px] sm:w-80 h-[100dvh] max-h-[100dvh]
        bg-slate-950 text-slate-100 border-r border-slate-800 shadow-2xl
        flex flex-col overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 bg-slate-950/95 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold shrink-0 shadow-md shadow-amber-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-base truncate">Área Profissional</h2>
              <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider truncate">Menu Interno Autenticado</p>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 hover:bg-slate-800 active:scale-95 transition-colors shrink-0"
            title="Fechar Menu"
            aria-label="Fechar Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          <button
            onClick={() => { onSelectScreen('professional'); onToggle(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${currentScreen === 'professional' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
          >
            <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Meu Painel</span>
          </button>

          <button
            onClick={() => { onSelectScreen('professional'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Minha Agenda</span>
          </button>

          <button
            onClick={() => { onSelectScreen('professional'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Meus Clientes Autorizados</span>
          </button>

          <button
            onClick={() => { onSelectScreen('chat'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Chat e Ajuda</span>
          </button>

          <button
            onClick={() => { onSelectScreen('professional'); onToggle(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <User className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Meu Perfil</span>
          </button>
        </nav>

        {/* Separated Sticky Footer */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-slate-800/90 bg-slate-950/98 backdrop-blur-md pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => { onLogout(); onToggle(); }}
            className="w-full min-h-[44px] py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
