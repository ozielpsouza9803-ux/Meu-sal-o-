import React, { useState } from 'react';
import { 
  Briefcase, Calendar, Clock, DollarSign, CheckCircle2, AlertCircle, 
  FileText, User, Camera, XCircle, Check, Sparkles, Filter
} from 'lucide-react';
import { Appointment, Stylist } from '../types';

interface ProfessionalScreenProps {
  appointments: Appointment[];
  stylists: Stylist[];
  currentUser?: { id?: string; name: string; email?: string; stylistId?: string } | null;
  onUpdateStatus: (stylistId: string, status: Stylist['status']) => void;
  onCustomizeAvatar: (id: string, name: string, avatar: string) => void;
  onUpdateAppointmentStatus?: (appointmentId: string, status: 'confirmado' | 'concluído' | 'cancelado', notes?: string) => void;
}

export const ProfessionalScreen: React.FC<ProfessionalScreenProps> = ({
  appointments,
  stylists,
  currentUser,
  onUpdateStatus,
  onCustomizeAvatar,
  onUpdateAppointmentStatus,
}) => {
  // Bind view dynamically to the authenticated professional
  const currentStylist = (currentUser?.stylistId ? stylists.find(s => s.id === currentUser.stylistId) : null) ||
    (currentUser?.name ? stylists.find(s => s.name.toLowerCase().includes(currentUser.name.toLowerCase())) : null) ||
    stylists[0];

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(appointments[0]?.id || '');
  const [clientNotesInput, setClientNotesInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    app: Appointment;
    newStatus: 'concluído' | 'cancelado';
  } | null>(null);

  // Professional's specific appointments
  const myAppointments = appointments.filter(a => a.stylistId === currentStylist.id || a.stylistName.toLowerCase().includes(currentStylist.name.toLowerCase()));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = myAppointments.filter(a => a.date === todayStr && a.status === 'confirmado');
  const upcomingAppointments = myAppointments.filter(a => a.status === 'confirmado');
  const pastAppointments = myAppointments.filter(a => a.status === 'concluído' || a.status === 'cancelado');

  const selectedAppointment = myAppointments.find(a => a.id === selectedAppointmentId) || myAppointments[0];

  const totalCommissionToday = todayAppointments.reduce((acc, curr) => acc + (curr.price * 0.4), 0);

  const handleSaveNotes = () => {
    if (selectedAppointment && onUpdateAppointmentStatus && clientNotesInput.trim()) {
      onUpdateAppointmentStatus(selectedAppointment.id, selectedAppointment.status, clientNotesInput);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleApplyStatusChange = () => {
    if (confirmModal && onUpdateAppointmentStatus) {
      onUpdateAppointmentStatus(confirmModal.app.id, confirmModal.newStatus);
      setConfirmModal(null);
    }
  };

  const displayList = activeTab === 'today' ? todayAppointments : 
                      activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Professional Header & Status Toggle */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-xl">
        <div className="flex items-center gap-4 sm:gap-5 text-left">
          <div className="relative group shrink-0">
            <img 
              src={currentStylist.avatar} 
              alt={currentStylist.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => onCustomizeAvatar(currentStylist.id, currentStylist.name, currentStylist.avatar)}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow hover:bg-amber-400 transition-colors"
              title="Personalizar Foto"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <Briefcase className="w-3 h-3" />
              Painel do Profissional Mestre
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">{currentStylist.name}</h1>
            <p className="text-xs text-slate-400">{currentStylist.role} · Especialidades: {currentStylist.specialties.join(', ')}</p>
          </div>
        </div>

        {/* Status Switcher */}
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium">Seu Status Atual:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto scrollbar-none">
            {(['disponível', 'em atendimento', 'pausa'] as Stylist['status'][]).map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(currentStylist.id, status)}
                className={`
                  flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all min-h-[38px] flex items-center justify-center
                  ${currentStylist.status === status
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Agendamentos Ativos</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{upcomingAppointments.length} clientes</p>
          <p className="text-[11px] text-emerald-400">{todayAppointments.length} para a data de hoje</p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Comissão Estimada (Hoje)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">R$ {totalCommissionToday.toFixed(2)}</p>
          <p className="text-[11px] text-amber-400">40% taxa de comissão padrão</p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Avaliação & Feedback</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{currentStylist.rating} / 5.0</p>
          <p className="text-[11px] text-slate-400">Baseado em {currentStylist.reviewsCount} avaliações</p>
        </div>
      </div>

      {/* Agenda Consultation & Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Schedule list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-white">Sua Agenda & Gestão de Atendimentos</h2>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'today' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hoje ({todayAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'upcoming' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos Confirmados ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'completed' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Histórico ({pastAppointments.length})
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {displayList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                Nenhum agendamento encontrado nesta categoria.
              </div>
            ) : (
              displayList.map((app) => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedAppointmentId(app.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedAppointmentId === app.id 
                      ? 'bg-amber-500/5 border-amber-500/50 ring-1 ring-amber-500/30' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex flex-col items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20">
                        <span>{app.time}</span>
                        <span className="text-[9px] font-normal text-slate-400">{app.date.split('-').slice(1).join('/')}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">{app.clientName}</h3>
                        <p className="text-xs text-amber-400 font-medium truncate">{app.serviceName} · R$ {app.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`shrink-0 text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-medium border ${
                        app.status === 'confirmado' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        app.status === 'concluído' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {app.status === 'confirmado' ? 'Confirmado' : app.status === 'concluído' ? 'Concluído' : 'Cancelado'}
                      </span>

                      {/* Action buttons if appointment is active */}
                      {app.status === 'confirmado' && onUpdateAppointmentStatus && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({ app, newStatus: 'concluído' });
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 min-h-[34px]"
                            title="Concluir Atendimento"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Concluir</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({ app, newStatus: 'cancelado' });
                            }}
                            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 min-h-[34px]"
                            title="Cancelar / Não compareceu"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cancelar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {app.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="line-clamp-2">Nota do agendamento: "{app.notes}"</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client Hair Formulas & Technical Prontuary */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white">Fórmulas & Prontuário Técnico</h2>
          
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Cliente Selecionado</label>
              <input 
                type="text" 
                readOnly 
                value={selectedAppointment ? `${selectedAppointment.clientName} (${selectedAppointment.serviceName})` : "Nenhum cliente selecionado"} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fórmula de Coloração / Procedimento Realizado</label>
              <textarea 
                rows={4}
                value={clientNotesInput || (selectedAppointment?.notes ? `Obs do cliente: ${selectedAppointment.notes}` : "Raiz: Tonalizante 7.1 (60ml) + Ox 20V. Pontas: Gloss perolado por 10 min. Escova modelada com spray térmico argan.")}
                onChange={(e) => setClientNotesInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                placeholder="Insira as fórmulas de química, tintura ou observações de corte..."
              />
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Prontuário técnico salvo com sucesso!</span>
              </div>
            )}

            <button
              onClick={handleSaveNotes}
              className="w-full min-h-[44px] py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Salvar Prontuário Técnico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Completing or Cancelling */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {confirmModal.newStatus === 'concluído' ? 'Concluir Atendimento?' : 'Cancelar Atendimento?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deseja marcar o agendamento de <span className="text-white font-medium">{confirmModal.app.clientName}</span> ({confirmModal.app.serviceName}) como <span className="text-amber-400 font-bold">{confirmModal.newStatus}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleApplyStatusChange}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white ${
                  confirmModal.newStatus === 'concluído' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
