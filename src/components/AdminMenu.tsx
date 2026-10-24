import React from 'react';
import { 
  ShieldCheck, LayoutDashboard, Calendar, Users, Scissors, 
  ImageIcon, ShoppingBag, Camera, MessageSquare, Settings, 
  Download, LogOut, ChevronLeft, X 
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
  const handleInstallPWA = () => {
    alert("Instalação do PWA: Adicione esta página à tela inicial pelo seu navegador.");
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-3 bg-slate-950 border border-amber-500/30 text-amber-500 rounded-2xl shadow-xl flex items-center justify-center hover:bg-slate-900 transition-colors"
          title="Abrir Menu Admin"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onToggle} />
      )}

      {/* Admin Menu Drawer */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-80 bg-slate-950 text-slate-100 border-r border-amber-900/30 p-6 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between border-b border-amber-900/30 pb-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Painel Administrativo</h2>
              <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">Acesso Master</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 pr-2">
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
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentScreen === item.id ? 'bg-amber-900/20 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleInstallPWA}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-900/10 transition-colors border border-emerald-900/20 mt-4"
          >
            <Download className="w-5 h-5" />
            <span>Instalar Aplicativo</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-amber-900/30">
          <button
            onClick={() => { onLogout(); onToggle(); }}
            className="w-full py-3.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
