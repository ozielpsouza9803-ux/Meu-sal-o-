import React, { useState } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Calendar, Users, Scissors, 
  ImageIcon, ShoppingBag, Camera, Settings, 
  Download, LogOut, ChevronLeft, CheckCircle2, X 
} from 'lucide-react';
import { ScreenId } from '../types';

interface AdminMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onLogout: () => void;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({
  isOpen,
  onToggle,
  currentScreen,
  onSelectScreen,
  onLogout,
}) => {
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity" onClick={onToggle} />
      )}

      {/* Admin Menu Drawer */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-[88vw] max-w-[320px] sm:w-80 h-[100dvh] max-h-[100dvh]
        bg-slate-950 text-slate-100 border-r border-amber-900/30 shadow-2xl
        flex flex-col overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-amber-900/30 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-base truncate">Painel Administrativo</h2>
              <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider truncate">Acesso Master</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 hover:bg-slate-800 active:scale-95 transition-colors shrink-0"
            title="Fechar"
            aria-label="Fechar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {[
            { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'admin', label: 'Agendamentos Gerais', icon: Calendar },
            { id: 'admin', label: 'Clientes', icon: Users },
            { id: 'admin', label: 'Profissionais', icon: Users },
            { id: 'admin', label: 'Serviços', icon: Scissors },
            { id: 'gallery', label: 'Galeria de Serviços', icon: ImageIcon },
            { id: 'products', label: 'Produtos', icon: ShoppingBag },
            { id: 'admin', label: 'Banners', icon: Camera },
            { id: 'admin', label: 'Configurações', icon: Settings },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { onSelectScreen(item.id as ScreenId); onToggle(); }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${currentScreen === item.id ? 'bg-amber-900/20 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <item.icon className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={() => setShowPwaBanner(true)}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-900/10 transition-colors border border-emerald-900/20 mt-3"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Instalar Aplicativo (PWA)</span>
          </button>

          {showPwaBanner && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 mt-2 animate-fadeIn">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PWA no Dispositivo
                </span>
                <button 
                  onClick={() => setShowPwaBanner(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Adicione à tela inicial através do menu do seu navegador (Safari / Chrome).
              </p>
            </div>
          )}
        </nav>

        {/* Separated Sticky Footer */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-amber-900/30 bg-slate-950/98 backdrop-blur-md pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => { onLogout(); onToggle(); }}
            className="w-full min-h-[44px] py-2.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>
    </>
  );
};
