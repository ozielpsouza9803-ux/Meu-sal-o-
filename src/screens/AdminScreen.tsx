import React, { useState } from 'react';
import { ShieldCheck, DollarSign, Users, Scissors, TrendingUp, Plus, Edit2, Trash2, Camera } from 'lucide-react';
import { Service, Stylist } from '../types';

interface AdminScreenProps {
  services: Service[];
  stylists: Stylist[];
  onAddService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onCustomizeStylist: (id: string, name: string, avatar: string) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  services,
  stylists,
  onAddService,
  onDeleteService,
  onCustomizeStylist,
}) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'services' | 'staff' | 'analytics'>('financial');
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;

    const newService: Service = {
      id: 's-' + Date.now(),
      name: newServiceName,
      category: 'cabelo',
      price: parseFloat(newServicePrice),
      durationMinutes: parseInt(newServiceDuration) || 45,
      description: 'Serviço profissional de alta qualidade com produtos L\'Élite.',
      image: '/src/assets/images/service_haircut_1792861533533.jpg',
      popular: false,
    };

    onAddService(newService);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('');
    setShowNewServiceModal(false);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Admin Header */}
      <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-bold text-2xl">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <ShieldCheck className="w-3 h-3" />
              Painel Administrativo Master
            </div>
            <h1 className="text-2xl font-extrabold text-white">Gerenciamento Geral</h1>
            <p className="text-xs text-slate-400">Controle financeiro, equipe, catálogo de serviços e indicadores de desempenho.</p>
          </div>
        </div>

        <button
          onClick={() => setShowNewServiceModal(true)}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Novo Serviço</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'financial' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Visão Financeira
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Catálogo & Preços ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'staff' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Equipe ({stylists.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Indicadores & Métricas
        </button>
      </div>

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Faturamento (Hoje)</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-white">R$ 3.850,00</p>
              <p className="text-[11px] text-emerald-400">+18% comparado à véspera</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Faturamento (Mês)</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-white">R$ 78.400,00</p>
              <p className="text-[11px] text-emerald-400">Meta mensal: 85% atingida</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Ticket Médio</span>
                <Scissors className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-white">R$ 145,00</p>
              <p className="text-[11px] text-amber-400">Por cliente atendido</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Últimas Transações Registradas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <div>
                  <p className="text-sm font-bold text-white">Corte Modelado + Barba Terapia</p>
                  <p className="text-xs text-slate-400">Cliente: Bruno Henrique · Profissional: Carlos Mendes</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">+ R$ 160,00</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <div>
                  <p className="text-sm font-bold text-white">Balayage Completa & Reconstrução</p>
                  <p className="text-xs text-slate-400">Cliente: Patrícia Lima · Profissional: Juliana Vance</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">+ R$ 430,00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Catalog Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {service.category}
                    </span>
                    <span className="text-xs text-slate-400">{service.durationMinutes} min</span>
                  </div>
                  <h3 className="font-bold text-white text-base">{service.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{service.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-base font-bold text-white">R$ {service.price.toFixed(2)}</span>
                  <button
                    onClick={() => onDeleteService(service.id)}
                    className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors"
                    title="Excluir Serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Tab with Photo Customization */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stylists.map((stylist) => (
            <div key={stylist.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-center">
              <div className="relative inline-block">
                <img 
                  src={stylist.avatar} 
                  alt={stylist.name}
                  className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-amber-500"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => onCustomizeStylist(stylist.id, stylist.name, stylist.avatar)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow hover:bg-amber-400 transition-colors"
                  title="Personalizar Foto do Perfil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{stylist.name}</h3>
                <p className="text-xs text-amber-400">{stylist.role}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Avaliação: {stylist.rating}★</span>
                <span className="capitalize text-emerald-400">● {stylist.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <TrendingUp className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Taxa de Ocupação da Agenda</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">O salão opera atualmente com 88% de ocupação nos horários de pico (sextas e sábados).</p>
        </div>
      )}

      {/* New Service Modal */}
      {showNewServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Adicionar Novo Serviço</h3>
            
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nome do Serviço</label>
                <input 
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ex: Escova Definitiva"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Preço (R$)</label>
                  <input 
                    type="number"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="150"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Duração (Min)</label>
                  <input 
                    type="number"
                    required
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    placeholder="60"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewServiceModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                  Criar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
