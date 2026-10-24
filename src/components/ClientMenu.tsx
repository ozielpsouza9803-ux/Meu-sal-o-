import React from 'react';
import { User, Calendar, Heart, MessageSquare, LogOut, Scissors, ChevronLeft } from 'lucide-react';
import { ScreenId, UserRole } from '../types';

interface ClientMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onLogout: () => void;
}

export const ClientMenu: React.FC<ClientMenuProps> = ({
  isOpen,
  onToggle,
  currentScreen,
  onSelectScreen,
  onLogout,
}) => {
  return (
    <>
      {/* Toggle Arrow Button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2.5 bg-slate-900 border border-slate-800 text-amber-400 rounded-xl shadow-xl flex items-center justify-center hover:bg-slate-800 transition-colors"
          title="Abrir Menu do Cliente"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50" onClick={onToggle} />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-80 bg-slate-950 text-slate-100 border-r border-slate-800 p-6 flex flex-col justify-between shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">Área do Cliente</h2>
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Menu Interno Autenticado</p>
              </div>
            </div>

            {/* Customized Open/Close Arrow replacing X */}
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 hover:bg-slate-800 transition-colors"
              title="Fechar Menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => { onSelectScreen('client'); onToggle(); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentScreen === 'client' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
            >
              <User className="w-5 h-5 text-amber-400" />
              <span>Meu perfil</span>
            </button>

            <button
              onClick={() => { onSelectScreen('client'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Meus agendamentos</span>
            </button>

            <button
              onClick={() => { onSelectScreen('client'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Heart className="w-5 h-5 text-amber-400" />
              <span>Meus favoritos</span>
            </button>

            <button
              onClick={() => { onSelectScreen('chat'); onToggle(); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentScreen === 'chat' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
            >
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>Chat</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={() => { onLogout(); onToggle(); }}
            className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
