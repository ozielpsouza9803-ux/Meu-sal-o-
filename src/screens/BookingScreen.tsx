import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Scissors, ArrowRight, ArrowLeft, AlertCircle, MessageCircle } from 'lucide-react';
import { Service, Stylist, Appointment, PaymentSettings } from '../types';

interface BookingScreenProps {
  services: Service[];
  stylists: Stylist[];
  appointments: Appointment[];
  selectedServiceId?: string;
  editingAppointment?: Appointment | null;
  onConfirmBooking: (appointment: Appointment) => void;
  onUpdateAppointment?: (appointment: Appointment) => void;
  onComplete: () => void;
  paymentSettings: PaymentSettings | null;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  services,
  stylists,
  appointments,
  selectedServiceId,
  editingAppointment,
  onConfirmBooking,
  onUpdateAppointment,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [serviceId, setServiceId] = useState<string>(editingAppointment?.serviceId || selectedServiceId || services[0]?.id || '');
  const [stylistId, setStylistId] = useState<string>(editingAppointment?.stylistId || stylists[0]?.id || '');
  const [date, setDate] = useState<string>(editingAppointment?.date || '2026-10-26');
  const [time, setTime] = useState<string>(editingAppointment?.time || '10:00');
  const [clientName, setClientName] = useState<string>(editingAppointment?.clientName || 'Camila Souza');
  const [notes, setNotes] = useState<string>(editingAppointment?.notes || '');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedApp, setConfirmedApp] = useState<Appointment | null>(editingAppointment || null);

  const selectedService = services.find(s => s.id === serviceId) || services[0];
  const selectedStylist = stylists.find(s => s.id === stylistId) || stylists[0];

  // Available timeslots
  const availableTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:30'];

  // Check if slot is already taken by the same professional on the same date
  const isSlotTaken = (stylist: string, appDate: string, appTime: string) => {
    return appointments.some(app => 
      app.status === 'confirmado' &&
      app.stylistId === stylist && 
      app.date === appDate && 
      app.time === appTime &&
      (!editingAppointment || app.id !== editingAppointment.id)
    );
  };

  const handleNextStep2 = () => {
    setErrorMessage('');
    if (isSlotTaken(stylistId, date, time)) {
      setErrorMessage(`O(A) profissional ${selectedStylist.name} já possui um agendamento confirmado para ${date} às ${time}. Por favor, escolha outro horário ou profissional.`);
      return;
    }
    setStep(3);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Por favor, insira o nome do cliente.');
      return;
    }

    if (isSlotTaken(stylistId, date, time)) {
      setErrorMessage(`Conflito de horário: ${selectedStylist.name} já está ocupado em ${date} às ${time}.`);
      return;
    }

    const appData: Appointment = {
      id: editingAppointment ? editingAppointment.id : 'app-' + Date.now(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      stylistId: selectedStylist.id,
      stylistName: selectedStylist.name,
      clientName: clientName.trim(),
      date,
      time,
      price: selectedService.price,
      status: 'confirmado',
      notes,
    };

    if (editingAppointment && onUpdateAppointment) {
      onUpdateAppointment(appData);
    } else {
      onConfirmBooking(appData);
    }

    setConfirmedApp(appData);
    setStep(4); // Success step
  };

  const getWhatsAppLink = (app: Appointment) => {
    const text = encodeURIComponent(
      `Olá! Gostaria de confirmar meu agendamento no L'Élite Salon & Spa:\n\n*Serviço:* ${app.serviceName}\n*Profissional:* ${app.stylistName}\n*Data:* ${app.date} às ${app.time}\n*Valor:* R$ ${app.price.toFixed(2)}\n\nObrigado(a)!`
    );
    return `https://wa.me/5511999999999?text=${text}`;
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 sm:space-y-8 pb-16 sm:pb-20">
      {/* Wizard Steps Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {editingAppointment ? 'Editar Agendamento' : 'Agendamento Online Funcional'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Passo {step} de 3 · Validação de Conflitos & WhatsApp</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-white">1. Escolha o Serviço Desejado</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setServiceId(service.id)}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 sm:gap-4 ${serviceId === service.id ? 'bg-amber-500/10 border-amber-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
              >
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] sm:text-xs text-amber-400 font-semibold uppercase truncate">{service.category}</span>
                    <span className="text-xs sm:text-sm font-bold text-white shrink-0">R$ {service.price.toFixed(2)}</span>
                  </div>
                  <h3 className="font-bold text-white text-xs sm:text-sm truncate">{service.name}</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400 shrink-0" /> {service.durationMinutes} minutos
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 sm:pt-4">
            <button
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Avançar para Profissional & Horário</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Stylist & Date/Time with Conflict Validation */}
      {step === 2 && (
        <div className="space-y-5 sm:space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-white">2. Escolha o Profissional & Horário Disponível</h2>

          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-400">Profissional Especialista</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {stylists.map((stylist) => (
                <div
                  key={stylist.id}
                  onClick={() => setStylistId(stylist.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${stylistId === stylist.id ? 'bg-amber-500/10 border-amber-500 shadow-md' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                >
                  <img 
                    src={stylist.avatar} 
                    alt={stylist.name} 
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-xs sm:text-sm truncate">{stylist.name}</h3>
                    <p className="text-[10px] text-amber-400 truncate">{stylist.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Data do Atendimento</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Horário (Validação de Conflito)</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
              >
                {availableTimes.map((slot) => {
                  const taken = isSlotTaken(stylistId, date, slot);
                  return (
                    <option key={slot} value={slot} disabled={taken}>
                      {slot} {taken ? '(Ocupado / Indisponível)' : '— Disponível'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={handleNextStep2}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Revisar Agendamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation & Details */}
      {step === 3 && (
        <form onSubmit={handleFinish} className="space-y-5 sm:space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-white">3. Confirmação & Seus Dados</h2>

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Serviço Escolhido</p>
                <h3 className="font-bold text-white text-sm sm:text-base truncate">{selectedService.name}</h3>
              </div>
              <span className="text-base sm:text-lg font-bold text-amber-400 shrink-0">R$ {selectedService.price.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[11px]">Profissional</span>
                <span className="font-semibold text-white">{selectedStylist.name}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[11px]">Data e Hora</span>
                <span className="font-semibold text-white">{date} às {time}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Seu Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Observações Especiais (Opcional)</label>
                <textarea 
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Alergia a algum produto ou preferência de corte..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-3 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingAppointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Success State with WhatsApp Button */}
      {step === 4 && confirmedApp && (
        <div className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 sm:space-y-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {editingAppointment ? 'Agendamento Atualizado com Sucesso!' : 'Agendamento Confirmado com Sucesso!'}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Seu horário foi garantido sem conflitos. Envie a confirmação diretamente para o salão via WhatsApp.
            </p>
          </div>

          {/* WhatsApp Button with Pre-filled Message */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href={getWhatsAppLink(confirmedApp)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2.5 min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enviar Confirmação via WhatsApp</span>
            </a>

            <button
              onClick={onComplete}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center min-h-[44px]"
            >
              Ir para Área do Cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
