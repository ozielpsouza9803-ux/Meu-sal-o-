import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-12rem)] max-h-[780px] min-h-[380px] flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-3.5 sm:p-5 lg:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm sm:text-base">Assistente Virtual L'Élite & Recepção</h2>
            <p className="text-[11px] text-emerald-400 font-medium">● Online · Responde em segundos</p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isUser ? 'bg-amber-500 text-slate-950 font-bold text-xs' : 'bg-slate-800 text-amber-400'}`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-md p-3.5 sm:p-4 rounded-2xl text-xs leading-relaxed ${isUser ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none'}`}>
                <p>{msg.text}</p>
                <span className={`block text-[9px] mt-1 text-right ${isUser ? 'text-slate-800' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2 sm:gap-3">
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite sua dúvida sobre horários, serviços..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 sm:px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[44px]"
        />
        <button
          type="submit"
          className="w-11 h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-amber-500/20 shrink-0 min-h-[44px] min-w-[44px]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
