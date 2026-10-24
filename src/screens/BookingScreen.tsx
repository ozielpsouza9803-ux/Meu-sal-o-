import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle2, Scissors, ArrowRight, ArrowLeft, 
  AlertCircle, MessageCircle, Star, Search, Sparkles, User, CalendarDays
} from 'lucide-react';
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

// Standard operational slots for salon professionals (Mon-Sat, 09:00 - 19:00)
const SALON_TIMESLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

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
  const [serviceFilter, setServiceFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Initial values (preserve editing appointment or defaults)
  const defaultDate = useMemo(() => {
    if (editingAppointment?.date) return editingAppointment.date;
    const now = new Date();
    // Default to today or tomorrow in YYYY-MM-DD
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [editingAppointment]);

  const [serviceId, setServiceId] = useState<string>(
    editingAppointment?.serviceId || selectedServiceId || services[0]?.id || ''
  );
  const [stylistId, setStylistId] = useState<string>(
    editingAppointment?.stylistId || stylists[0]?.id || ''
  );
  const [date, setDate] = useState<string>(defaultDate);
  const [time, setTime] = useState<string>(editingAppointment?.time || '10:00');
  const [clientName, setClientName] = useState<string>(editingAppointment?.clientName || 'Camila Souza');
  const [notes, setNotes] = useState<string>(editingAppointment?.notes || '');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedApp, setConfirmedApp] = useState<Appointment | null>(editingAppointment || null);

  // Sync serviceId if selectedServiceId prop changes
  useEffect(() => {
    if (selectedServiceId && !editingAppointment) {
      setServiceId(selectedServiceId);
    }
  }, [selectedServiceId, editingAppointment]);

  const selectedService = useMemo(() => {
    return services.find(s => s.id === serviceId) || services[0] || {
      id: 'default',
      name: 'Serviço L\'Élite',
      category: 'cabelo',
      price: 90,
      durationMinutes: 45,
      description: 'Atendimento exclusivo',
      image: '/src/assets/images/service_haircut_1792861533533.jpg'
    };
  }, [services, serviceId]);

  const selectedStylist = useMemo(() => {
    return stylists.find(s => s.id === stylistId) || stylists[0] || {
      id: 'default-st',
      name: 'Profissional L\'Élite',
      role: 'Master Stylist',
      avatar: '/src/assets/images/stylist_avatar_1792861532780.jpg',
      rating: 5.0,
      reviewsCount: 100,
      specialties: ['Corte', 'Penteado'],
      status: 'disponível' as const
    };
  }, [stylists, stylistId]);

  // Check if a specific slot is booked by the selected stylist on the selected date
  // (Excluding the appointment currently being edited so the user doesn't block themselves)
  const isSlotTaken = (stId: string, targetDate: string, targetTime: string) => {
    return appointments.some(app => 
      app.status === 'confirmado' &&
      app.stylistId === stId && 
      app.date === targetDate && 
      app.time === targetTime &&
      (!editingAppointment || app.id !== editingAppointment.id)
    );
  };

  // Compute strictly AVAILABLE timeslots for the chosen stylist & date
  const availableSlots = useMemo(() => {
    return SALON_TIMESLOTS.filter(slot => !isSlotTaken(stylistId, date, slot));
  }, [stylistId, date, appointments, editingAppointment]);

  // Count total booked slots for this stylist & date
  const bookedSlotsCount = SALON_TIMESLOTS.length - availableSlots.length;

  // Auto-adjust selected time if the currently selected time is not in available slots
  useEffect(() => {
    if (availableSlots.length > 0) {
      if (!availableSlots.includes(time)) {
        setTime(availableSlots[0]);
      }
    }
  }, [availableSlots, time]);

  // Filtered services list
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesCategory = serviceFilter === 'todos' || s.category === serviceFilter;
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, serviceFilter, searchTerm]);

  // Quick next-day advance helper
  const handleAdvanceDay = (days: number) => {
    const current = new Date(date + 'T12:00:00');
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextStep2 = () => {
    setErrorMessage('');
    if (availableSlots.length === 0) {
      setErrorMessage(`O(A) profissional ${selectedStylist.name} não possui nenhum horário disponível em ${date}. Por favor, selecione outra data ou outro profissional.`);
      return;
    }
    if (!time || !availableSlots.includes(time)) {
      setErrorMessage(`O horário selecionado não está disponível. Por favor, escolha um dos horários livres indicados.`);
      return;
    }
    if (isSlotTaken(stylistId, date, time)) {
      setErrorMessage(`Conflito: o horário ${time} em ${date} já está reservado para ${selectedStylist.name}.`);
      return;
    }
    setStep(3);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    if (isSlotTaken(stylistId, date, time)) {
      setErrorMessage(`Conflito detectado: ${selectedStylist.name} acabou de ser agendado(a) para ${date} às ${time}. Por favor, escolha outro horário.`);
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
      notes: notes.trim(),
    };

    if (editingAppointment && onUpdateAppointment) {
      onUpdateAppointment(appData);
    } else {
      onConfirmBooking(appData);
    }

    setConfirmedApp(appData);
    setStep(4);
  };

  const getWhatsAppLink = (app: Appointment) => {
    const text = encodeURIComponent(
      `Olá! Gostaria de confirmar meu agendamento no L'Élite Salon & Spa:\n\n` +
      `✨ *Serviço:* ${app.serviceName}\n` +
      `👤 *Profissional:* ${app.stylistName}\n` +
      `📅 *Data:* ${app.date} às ${app.time}\n` +
      `💰 *Valor:* R$ ${app.price.toFixed(2)}\n` +
      `📝 *Cliente:* ${app.clientName}` +
      (app.notes ? `\n📌 *Obs:* ${app.notes}` : '') +
      `\n\nObrigado(a)!`
    );
    return `https://wa.me/5511999999999?text=${text}`;
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 sm:space-y-8 pb-16 sm:pb-20">
      {/* Wizard Steps Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {editingAppointment ? 'Editar Agendamento' : 'Agendamento Online de Alta Precisão'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Passo {step} de 3 · Horários Reais & Confirmação sem Conflitos
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s 
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-500/30' 
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Select Service from Registered App Data */}
      {step === 1 && (
        <div className="space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">1. Escolha o Serviço Desejado</h2>
              <p className="text-xs text-slate-400">Serviços e valores oficiais do catálogo L'Élite</p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'cabelo', label: 'Cabelo' },
              { id: 'barba', label: 'Barba' },
              { id: 'tratamento', label: 'Tratamentos' },
              { id: 'coloracao', label: 'Coloração' },
              { id: 'estetica', label: 'Estética' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setServiceFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  serviceFilter === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredServices.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
                Nenhum serviço encontrado com os filtros atuais.
              </div>
            ) : (
              filteredServices.map((service) => {
                const isSelected = serviceId === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      setServiceId(service.id);
                      setErrorMessage('');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 sm:gap-4 ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500 shadow-lg ring-1 ring-amber-500/50' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-xs text-amber-400 font-semibold uppercase tracking-wider truncate">
                          {service.category}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-white shrink-0">
                          R$ {service.price.toFixed(2)}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-xs sm:text-sm truncate">{service.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-amber-400">
                          <Clock className="w-3 h-3 shrink-0" /> {service.durationMinutes} min
                        </span>
                        {service.popular && (
                          <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                            Mais Pedido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-3 sm:pt-4">
            <button
              onClick={() => {
                if (!serviceId) {
                  setErrorMessage('Por favor, selecione um serviço para prosseguir.');
                  return;
                }
                setErrorMessage('');
                setStep(2);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Avançar para Profissional & Horário</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Stylist & ONLY Show Truly Available Timeslots */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">2. Escolha o Profissional & Horário Realmente Disponível</h2>
            <p className="text-xs text-slate-400">
              O sistema exibe exclusivamente horários livres para o profissional e a data selecionados.
            </p>
          </div>

          {/* Stylist Selection with Specialties Badge */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-400">Selecione o Profissional</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stylists.map((stylist) => {
                const isSelected = stylistId === stylist.id;
                // Check if stylist specializes in the selected service category
                const hasSpecialtyMatch = stylist.specialties.some(sp => 
                  sp.toLowerCase().includes(selectedService.category.toLowerCase()) ||
                  selectedService.name.toLowerCase().includes(sp.toLowerCase())
                );

                return (
                  <div
                    key={stylist.id}
                    onClick={() => {
                      setStylistId(stylist.id);
                      setErrorMessage('');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={stylist.avatar} 
                        alt={stylist.name} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-xs sm:text-sm truncate">{stylist.name}</h3>
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" /> {stylist.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{stylist.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
                      <span className={`capitalize font-semibold ${
                        stylist.status === 'disponível' ? 'text-emerald-400' :
                        stylist.status === 'em atendimento' ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        ● {stylist.status}
                      </span>
                      {hasSpecialtyMatch && (
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Recomendado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Picker & Quick Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-400">Data do Atendimento</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdvanceDay(1)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20"
                >
                  +1 Dia
                </button>
                <button
                  type="button"
                  onClick={() => handleAdvanceDay(7)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20"
                >
                  +1 Semana
                </button>
              </div>
            </div>
            <div className="relative">
              <input 
                type="date"
                value={date}
                min={defaultDate}
                onChange={(e) => {
                  setDate(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Real-time Available Timeslots Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-400">
                Horários Disponíveis para {selectedStylist.name}
              </label>
              <span className="text-[11px] font-medium text-amber-400">
                {availableSlots.length} horários livres ({bookedSlotsCount} ocupados)
              </span>
            </div>

            {availableSlots.length === 0 ? (
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-2">
                <CalendarDays className="w-8 h-8 text-amber-400/80 mx-auto" />
                <h4 className="text-white font-bold text-xs sm:text-sm">
                  Agenda lotada para esta data
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Todos os horários de <span className="text-white font-medium">{selectedStylist.name}</span> em {date} já foram reservados.
                  Por favor, avance a data ou escolha outro profissional de nossa equipe.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAdvanceDay(1)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                  >
                    Ver Próximo Dia Livre
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setTime(slot);
                        setErrorMessage('');
                      }}
                      className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center min-h-[40px] ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-500/40'
                          : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-850'
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1.5 shrink-0 opacity-70" />
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-3 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              type="button"
              onClick={handleNextStep2}
              disabled={availableSlots.length === 0}
              className={`px-6 py-3.5 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 min-h-[44px] ${
                availableSlots.length > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Revisar Agendamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review, Client Information & Validation */}
      {step === 3 && (
        <form onSubmit={handleFinish} className="space-y-5 sm:space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-white">3. Revisão dos Dados & Confirmação</h2>

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Serviço Selecionado</p>
                <h3 className="font-bold text-white text-sm sm:text-base truncate">{selectedService.name}</h3>
                <p className="text-[11px] text-amber-400 font-medium">Duração: {selectedService.durationMinutes} minutos</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base sm:text-lg font-extrabold text-amber-400">R$ {selectedService.price.toFixed(2)}</span>
                <p className="text-[10px] text-slate-400">Valor com impostos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
                <img 
                  src={selectedStylist.avatar} 
                  alt={selectedStylist.name} 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-slate-500 block text-[11px]">Profissional</span>
                  <span className="font-semibold text-white truncate block">{selectedStylist.name}</span>
                  <span className="text-[10px] text-amber-400">{selectedStylist.role}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-500 block text-[11px]">Data e Horário</span>
                  <span className="font-semibold text-white truncate block">{date} às {time}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Horário Exclusivo Reservado</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nome Completo do Cliente *</label>
                <input 
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome completo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Observações ou Preferências (Opcional)</label>
                <textarea 
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Alergia a cosméticos, preferência de corte, tom de tintura ou cuidados especiais..."
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
              <span>{editingAppointment ? 'Salvar Alterações do Agendamento' : 'Confirmar Agendamento'}</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Success State with WhatsApp integration */}
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
              Seu horário foi garantido sem conflitos para <span className="text-white font-medium">{confirmedApp.date} às {confirmedApp.time}</span> com <span className="text-amber-400 font-medium">{confirmedApp.stylistName}</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Serviço:</span>
              <span className="font-semibold text-white">{confirmedApp.serviceName}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Profissional:</span>
              <span className="font-semibold text-white">{confirmedApp.stylistName}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Data e Hora:</span>
              <span className="font-semibold text-white">{confirmedApp.date} às {confirmedApp.time}</span>
            </div>
            <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
              <span className="text-slate-500">Total:</span>
              <span className="font-bold text-amber-400">R$ {confirmedApp.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
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
