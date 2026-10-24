import React, { useState } from 'react';
import { Briefcase, Calendar, Clock, DollarSign, CheckCircle2, AlertCircle, FileText, User, Camera } from 'lucide-react';
import { Appointment, Stylist } from '../types';

interface ProfessionalScreenProps {
  appointments: Appointment[];
  stylists: Stylist[];
  currentUser?: { id?: string; name: string; email?: string; stylistId?: string } | null;
  onUpdateStatus: (stylistId: string, status: Stylist['status']) => void;
  onCustomizeAvatar: (id: string, name: string, avatar: string) => void;
}

export const ProfessionalScreen: React.FC<ProfessionalScreenProps> = ({
  appointments,
  stylists,
  currentUser,
  onUpdateStatus,
  onCustomizeAvatar,
}) => {
  // Bind view dynamically to the authenticated professional
  const currentStylist = (currentUser?.stylistId ? stylists.find(s => s.id === currentUser.stylistId) : null) ||
    (currentUser?.name ? stylists.find(s => s.name.toLowerCase().includes(currentUser.name.toLowerCase())) : null) ||
    stylists[0];
  const [clientNotesInput, setClientNotesInput] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(appointments[0]?.id || '');

  const todayAppointments = appointments.filter(a => a.status === 'confirmado');
  const totalCommissionToday = todayAppointments.reduce((acc, curr) => acc + (curr.price * 0.4), 0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveNotes = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

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
            <p className="text-xs text-slate-400">{currentStylist.role} · ID: #ST-8092</p>
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
            <span className="text-xs font-semibold">Agendamentos Hoje</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{todayAppointments.length} clientes</p>
          <p className="text-[11px] text-emerald-400">Próximo às 14:30</p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Comissão Estimada (Hoje)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">R$ {totalCommissionToday.toFixed(2)}</p>
          <p className="text-[11px] text-amber-400">40% taxa padrão</p>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Avaliação Média</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">4.9 / 5.0</p>
          <p className="text-[11px] text-slate-400">Baseado em 142 avaliações</p>
        </div>
      </div>

      {/* Agenda & Client Formulas Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Schedule list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white">Sua Agenda de Hoje</h2>
          
          <div className="space-y-3">
            {todayAppointments.map((app) => (
              <div 
                key={app.id} 
                onClick={() => setSelectedAppointmentId(app.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${selectedAppointmentId === app.id ? 'bg-amber-500/5 border-amber-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {app.time}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm sm:text-base truncate">{app.clientName}</h3>
                      <p className="text-xs text-amber-400 font-medium truncate">{app.serviceName}</p>
                    </div>
                  </div>

                  <span className="shrink-0 text-[11px] sm:text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                    Confirmado
                  </span>
                </div>

                {app.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="line-clamp-2">Nota: {app.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Client Hair Formulas & Notes Editor */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white">Fórmulas & Histórico Técnico</h2>
          
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Cliente Selecionado</label>
              <input 
                type="text" 
                readOnly 
                value="Camila Souza (Corte Modelado)" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fórmula de Coloração / Tratamento</label>
              <textarea 
                rows={4}
                value={clientNotesInput || "Raiz: Tonalizante 7.1 (60ml) + Ox 20V. Pontas: Gloss perolado por 10 min. Escova modelada com spray térmico argan."}
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
    </div>
  );
};
