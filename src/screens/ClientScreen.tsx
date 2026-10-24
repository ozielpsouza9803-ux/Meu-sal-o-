import React, { useState } from 'react';
import { 
  User, Award, Calendar, Clock, Heart, Sparkles, CheckCircle2, 
  ChevronRight, Edit2, Trash2, MessageCircle, AlertCircle, X, ArrowRight
} from 'lucide-react';
import { Appointment, Stylist } from '../types';

interface ClientScreenProps {
  appointments: Appointment[];
  stylists: Stylist[];
  currentUser?: { id?: string; name: string; email?: string; phone?: string } | null;
  onCancelAppointment: (id: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onNewBooking: () => void;
}

export const ClientScreen: React.FC<ClientScreenProps> = ({
  appointments,
  stylists,
  currentUser,
  onCancelAppointment,
  onEditAppointment,
  onNewBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'favorites'>('upcoming');
  const [cancellingApp, setCancellingApp] = useState<Appointment | null>(null);

  const clientDisplayName = currentUser?.name || 'Camila Souza';
  const clientDisplayEmail = currentUser?.email || 'camila@lelite.com.br';
  const clientDisplayPhone = currentUser?.phone || '(11) 98765-4321';
  
  const initials = clientDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'CL';

  // Filter client's appointments (confirmados vs histórico)
  const upcomingAppointments = appointments.filter(a => a.status === 'confirmado');
  const pastAppointments = appointments.filter(a => a.status === 'concluído' || a.status === 'cancelado');

  const getWhatsAppLink = (app: Appointment) => {
    const text = encodeURIComponent(
      `Olá! Gostaria de falar sobre meu agendamento no L'Élite Salon & Spa:\n\n` +
      `*Serviço:* ${app.serviceName}\n` +
      `*Profissional:* ${app.stylistName}\n` +
      `*Data:* ${app.date} às ${app.time}\n` +
      `*Valor:* R$ ${app.price.toFixed(2)}\n\n` +
      `Obrigado(a)!`
    );
    return `https://wa.me/5511999999999?text=${text}`;
  };

  const confirmCancel = () => {
    if (cancellingApp) {
      onCancelAppointment(cancellingApp.id);
      setCancellingApp(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 sm:pb-20">
      {/* Client Profile Banner */}
      <div className="p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-xl">
        <div className="flex items-center gap-4 sm:gap-5 text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-bold text-xl sm:text-2xl shrink-0">
            {initials}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <Sparkles className="w-3 h-3" />
              Membro L'Élite VIP Gold
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">{clientDisplayName}</h1>
            <p className="text-xs text-slate-400 truncate">{clientDisplayEmail} · {clientDisplayPhone}</p>
          </div>
        </div>

        {/* Fidelity Points Card */}
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3.5 sm:gap-4 w-full md:w-auto shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Pontos Fidelidade</p>
            <p className="text-lg sm:text-xl font-bold text-white">1.250 pts</p>
            <p className="text-[10px] text-amber-400">Próximo resgate: Hidratação Grátis</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[40px] ${
            activeTab === 'upcoming' 
              ? 'bg-amber-500 text-slate-950 font-bold shadow' 
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Minha Agenda ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[40px] ${
            activeTab === 'history' 
              ? 'bg-amber-500 text-slate-950 font-bold shadow' 
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Histórico de Visitas ({pastAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[40px] ${
            activeTab === 'favorites' 
              ? 'bg-amber-500 text-slate-950 font-bold shadow' 
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Profissionais Favoritos
        </button>
      </div>

      {/* Tab 1: Upcoming Appointments (Active Agenda) */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white">Próximos Atendimentos Confirmados</h2>
            <button
              onClick={onNewBooking}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              + Novo Agendamento
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-white font-bold text-base sm:text-lg">Nenhum agendamento ativo</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Que tal cuidar do seu visual hoje? Escolha um de nossos serviços e garanta seu horário exclusivo.
              </p>
              <button
                onClick={onNewBooking}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all inline-block min-h-[44px]"
              >
                Fazer Agendamento Online
              </button>
            </div>
          ) : (
            upcomingAppointments.map((app) => (
              <div 
                key={app.id} 
                className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Confirmado
                    </span>
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" /> {app.date} às {app.time}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{app.serviceName}</h3>
                  <p className="text-xs text-slate-400">
                    Profissional: <span className="text-slate-200 font-medium">{app.stylistName}</span>
                  </p>
                  {app.notes && (
                    <p className="text-xs italic text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 mt-1">
                      Obs: "{app.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                  <div className="text-left sm:text-right mr-3">
                    <p className="text-[10px] text-slate-400">Valor</p>
                    <p className="text-sm sm:text-base font-extrabold text-amber-400">R$ {app.price.toFixed(2)}</p>
                  </div>

                  {/* WhatsApp Direct Confirmation */}
                  <a
                    href={getWhatsAppLink(app)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 min-h-[40px]"
                    title="Enviar detalhes via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Edit Appointment (Reschedule or Change) */}
                  <button
                    onClick={() => onEditAppointment(app)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 min-h-[40px]"
                    title="Editar ou Reagendar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {/* Cancel with in-app confirmation modal */}
                  <button
                    onClick={() => setCancellingApp(app)}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 min-h-[40px]"
                    title="Cancelar Agendamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Appointment History */}
      {activeTab === 'history' && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-white">Histórico de Atendimentos</h2>
          {pastAppointments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              Nenhum atendimento anterior registrado no histórico.
            </div>
          ) : (
            pastAppointments.map((app) => (
              <div 
                key={app.id} 
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{app.serviceName}</p>
                    <span className="text-xs text-slate-400">· R$ {app.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {app.date} às {app.time} · Profissional: <span className="text-slate-200">{app.stylistName}</span>
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 border ${
                  app.status === 'concluído' 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                }`}>
                  {app.status === 'concluído' ? 'Concluído' : 'Cancelado'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Favorite Stylists */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {stylists.map((stylist) => (
            <div key={stylist.id} className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
              <div className="flex items-center gap-3.5 min-w-0">
                <img 
                  src={stylist.avatar} 
                  alt={stylist.name} 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-amber-500/30 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-base truncate">{stylist.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{stylist.role}</p>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> {stylist.specialties.join(', ')}
                  </div>
                </div>
              </div>
              <button 
                onClick={onNewBooking}
                className="w-full sm:w-auto px-3.5 py-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold rounded-xl transition-colors min-h-[40px] text-center"
              >
                Agendar Horário
              </button>
            </div>
          ))}
        </div>
      )}

      {/* In-app Cancellation Confirmation Modal */}
      {cancellingApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <button 
                onClick={() => setCancellingApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Cancelar Agendamento?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tem certeza que deseja cancelar seu horário para <span className="text-white font-medium">{cancellingApp.serviceName}</span> em <span className="text-white font-medium">{cancellingApp.date} às {cancellingApp.time}</span> com <span className="text-amber-400 font-medium">{cancellingApp.stylistName}</span>?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p>● O horário será liberado imediatamente para outros clientes.</p>
              <p>● Você poderá agendar uma nova data a qualquer momento.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingApp(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors min-h-[40px]"
              >
                Manter Agendamento
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 min-h-[40px]"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
