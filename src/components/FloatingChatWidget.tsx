import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Calendar, MessageCircle, Bot, User, Camera, Sparkles, ShieldCheck } from 'lucide-react';
import { ChatMessage, ScreenId, UserRole, Appointment } from '../types';

interface FloatingChatWidgetProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, customBotReply?: string) => void;
  onNavigateBooking: () => void;
  currentScreen: ScreenId;
  currentRole: UserRole;
  appointments: Appointment[];
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  messages,
  onSendMessage,
  onNavigateBooking,
  currentScreen,
  currentRole,
  appointments,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'bot' | 'human'>('bot');
  const [inputText, setInputText] = useState('');
  const [chatAvatar, setChatAvatar] = useState<string>(() => {
    return localStorage.getItem('eliter_chat_avatar') || '/src/assets/images/stylist_avatar_1792861532780.jpg';
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Allowed screens for floating chat: home, client, professional
  const allowedScreens: ScreenId[] = ['home', 'client', 'professional'];
  const isScreenAllowed = allowedScreens.includes(currentScreen);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setChatAvatar(url);
      localStorage.setItem('eliter_chat_avatar', url);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    if (currentRole === 'professional') {
      // Professional intelligent schedule assistant query
      const lower = userText.toLowerCase();
      const isAgendaQuery = lower.includes('agenda') || lower.includes('horário') || lower.includes('cliente') || lower.includes('hoje') || lower.includes('próximo') || lower.includes('cancel') || lower.includes('ajuda');

      if (isAgendaQuery) {
        // Filter appointments authorized for this professional (e.g. st1 - Juliana Vance)
        const myAppointments = appointments.filter(a => a.stylistId === 'st1');
        
        let botReply = '';
        if (myAppointments.length === 0) {
          botReply = "Olá! Verifiquei sua agenda autorizada para hoje e não há nenhum agendamento cadastrado no momento.";
        } else {
          const activeList = myAppointments.filter(a => a.status === 'confirmado');
          const cancelledList = myAppointments.filter(a => a.status === 'cancelado');

          botReply = `📋 *Resumo da sua Agenda Autorizada (Juliana Vance):*\n\n`;
          if (activeList.length > 0) {
            botReply += `*Agendamentos Confirmados (${activeList.length}):*\n`;
            activeList.forEach((app, idx) => {
              botReply += `${idx + 1}. *${app.time}* - ${app.clientName} (${app.serviceName}) [Status: ${app.status}]\n`;
            });
            botReply += `\n`;
          } else {
            botReply += `Nenhum agendamento confirmado no momento.\n\n`;
          }

          if (cancelledList.length > 0) {
            botReply += `❌ *Agendamentos Cancelados (${cancelledList.length}):*\n`;
            cancelledList.forEach((app, idx) => {
              botReply += `${idx + 1}. *${app.time}* - ${app.clientName} (${app.serviceName}) [Status: Cancelado]\n`;
            });
          }
        }

        onSendMessage(userText, botReply);
        return;
      }
    }

    onSendMessage(userText);
  };

  const getWhatsAppQuickLink = () => {
    const text = encodeURIComponent("Olá! Vim pelo chat do aplicativo L'Élite Salon & Spa e gostaria de tirar dúvidas sobre os atendimentos.");
    return `https://wa.me/5511999999999?text=${text}`;
  };

  if (!isScreenAllowed) return null;

  return (
    <>
      {/* Floating Circular Button */}
      {!isOpen && (
        <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end">
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-2xl shadow-amber-500/40 flex items-center justify-center text-slate-950 hover:scale-105 active:scale-95 transition-all border-2 border-slate-950"
            title="Abrir Chat"
          >
            <img 
              src={chatAvatar} 
              alt="Chat Avatar" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </button>
        </div>
      )}

      {/* Chat Panel Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[520px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={chatAvatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center text-[10px] shadow"
                  title="Alterar Foto"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-white text-sm">
                    {currentRole === 'professional' ? 'Assistente de Agenda' : "L'Élite Concierge"}
                  </h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${chatMode === 'bot' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {chatMode === 'bot' ? '🤖 Robô IA' : '👤 Humano'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {currentRole === 'professional' ? 'Consulta em tempo real da agenda' : (chatMode === 'bot' ? 'Atendimento Automático 24h' : 'Atendimento com Recepcionista')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setChatMode('bot')}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${chatMode === 'bot' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  IA
                </button>
                <button
                  onClick={() => setChatMode('human')}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${chatMode === 'human' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Humano
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Fechar Conversa"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto text-[11px]">
            {currentRole !== 'professional' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateBooking();
                }}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Agendar Horário</span>
              </button>
            )}

            <a
              href={getWhatsAppQuickLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-xl font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Direto</span>
            </a>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-center">
              <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full whitespace-pre-wrap">
                {currentRole === 'professional' ? 'Digite "agenda", "horários" ou "cancelamentos" para consultar os dados reais' : (chatMode === 'bot' ? 'Atendimento automatizado iniciado por IA' : 'Você está conectado com a recepção humana')}
              </span>
            </div>

            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isUser ? 'bg-amber-500 text-slate-950 font-bold text-[10px]' : 'bg-slate-800 text-amber-400'}`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'}`}>
                    <p>{msg.text}</p>
                    <span className={`block text-[8px] mt-1 text-right ${isUser ? 'text-slate-800' : 'text-slate-500'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentRole === 'professional' ? "Ex: Quais meus horários e cancelamentos hoje?" : (chatMode === 'bot' ? "Pergunte algo para a IA..." : "Fale com a atendente humana...")}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center transition-all shadow shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
