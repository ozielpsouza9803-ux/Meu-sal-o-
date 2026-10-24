import React from 'react';
import { Home, Scissors, Users, ShoppingBag, Clock, Calendar, LogIn, MessageSquare, ChevronLeft, Download } from 'lucide-react';
import { ScreenId, UserRole } from '../types';

interface PublicMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectScreen: (screen: ScreenId) => void;
  onLoginClick: (role: UserRole) => void;
}

export const PublicMenu: React.FC<PublicMenuProps> = ({
  isOpen,
  onToggle,
  onSelectScreen,
  onLoginClick,
}) => {
  const handleInstallPWA = () => {
    alert("Instalação do PWA: Para instalar o L'Élite Salon & Spa no seu dispositivo, adicione a página à tela inicial pelo navegador (Safari/Chrome).");
  };

  return (
    <>
      {/* Toggle Arrow Button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2.5 bg-slate-900 border border-slate-800 text-amber-400 rounded-xl shadow-xl flex items-center justify-center hover:bg-slate-800 transition-colors"
          title="Abrir Menu Público"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50" onClick={onToggle} />
      )}

      {/* Vertical 9:16 Public Menu Drawer */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-80 bg-slate-950 text-slate-100 border-r border-slate-800 p-6 flex flex-col justify-between shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">L'Élite Salon</h2>
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Menu Público Externo</p>
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
              onClick={() => { onSelectScreen('home'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Home className="w-5 h-5 text-amber-400" />
              <span>Início</span>
            </button>

            <button
              onClick={() => { onSelectScreen('home'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Scissors className="w-5 h-5 text-amber-400" />
              <span>Serviços</span>
            </button>

            <button
              onClick={() => { onSelectScreen('home'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Users className="w-5 h-5 text-amber-400" />
              <span>Profissionais</span>
            </button>

            <button
              onClick={() => { onSelectScreen('products'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>Vitrine de Produtos</span>
            </button>

            <button
              onClick={() => { onSelectScreen('home'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Horários de Atendimento</span>
            </button>

            <button
              onClick={() => { onSelectScreen('booking'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Agendar</span>
            </button>

            <button
              onClick={() => { onSelectScreen('chat'); onToggle(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>Chat</span>
            </button>

            {/* PWA Install Option */}
            <button
              onClick={handleInstallPWA}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-emerald-500/20 mt-4"
            >
              <Download className="w-5 h-5" />
              <span>Instalar Aplicativo</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={() => { onLoginClick('client'); onToggle(); }}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mb-3"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar ou Cadastrar</span>
          </button>
          <button
            onClick={() => { onLoginClick('admin'); onToggle(); }}
            className="w-full py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Acesso Administrador</span>
          </button>
        </div>
      </aside>
    </>
  );
};
