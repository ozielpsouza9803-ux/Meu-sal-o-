import React from 'react';
import { 
  Scissors, 
  Home, 
  User, 
  Briefcase, 
  ShieldCheck, 
  CalendarPlus, 
  ShoppingBag, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';
import { ScreenId, UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentScreen,
  onSelectScreen,
  currentRole,
  onChangeRole,
}) => {
  const navItems = [
    { id: 'home' as ScreenId, label: 'Início', icon: Home, roles: ['client', 'professional', 'admin'] },
    { id: 'booking' as ScreenId, label: 'Agendamentos', icon: CalendarPlus, roles: ['client', 'professional', 'admin'] },
    { id: 'client' as ScreenId, label: 'Área do Cliente', icon: User, roles: ['client', 'admin'] },
    { id: 'professional' as ScreenId, label: 'Painel Profissional', icon: Briefcase, roles: ['professional', 'admin'] },
    { id: 'admin' as ScreenId, label: 'Painel Administrativo', icon: ShieldCheck, roles: ['admin'] },
    { id: 'products' as ScreenId, label: 'Vitrine de Produtos', icon: ShoppingBag, roles: ['client', 'professional', 'admin'] },
    { id: 'chat' as ScreenId, label: 'Chat & Suporte', icon: MessageSquare, roles: ['client', 'professional', 'admin'] },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-950 text-slate-100 border-r border-slate-800/80
        transform transition-transform duration-300 ease-in-out flex flex-col justify-between
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 hover:lg:w-72 group'}
      `}>
        {/* Top Header / Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shrink-0 font-bold shadow-lg shadow-amber-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div className={`transition-opacity duration-200 ${!isOpen && 'lg:opacity-0 lg:group-hover:opacity-100'}`}>
              <h1 className="font-bold tracking-tight text-white whitespace-nowrap">L'Élite Salon</h1>
              <p className="text-[11px] text-amber-400 font-medium tracking-wide">PWA UNISSEX</p>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title={isOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className={`px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-opacity ${!isOpen && 'lg:hidden lg:group-hover:block'}`}>
            Navegação PWA
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectScreen(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`
                  w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className={`truncate transition-opacity duration-200 ${!isOpen && 'lg:hidden lg:group-hover:inline'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Role Switcher Section */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className={`mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-opacity ${!isOpen && 'lg:hidden lg:group-hover:block'}`}>
            Perfil de Acesso
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['client', 'professional', 'admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => onChangeRole(role)}
                className={`
                  py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all text-center truncate
                  ${currentRole === role 
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow' 
                    : 'text-slate-400 hover:text-white'
                  }
                `}
                title={`Mudar para ${role}`}
              >
                {role === 'client' ? 'Cliente' : role === 'professional' ? 'Prof.' : 'Admin'}
              </button>
            ))}
          </div>

          <div className={`mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 transition-opacity ${!isOpen && 'lg:hidden lg:group-hover:flex'}`}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              v2.4 PWA Ready
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">● Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};
