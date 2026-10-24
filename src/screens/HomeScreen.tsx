import React from 'react';
import { Sparkles, Star, Calendar, ArrowRight, Clock, Scissors, Award, Camera, ShoppingBag, MessageSquare } from 'lucide-react';
import { Service, Stylist, Product, ScreenId } from '../types';
import { MediaCarousel, MediaItem } from '../components/MediaCarousel';

interface HomeScreenProps {
  services: Service[];
  stylists: Stylist[];
  products: Product[];
  bannerMedia: { url: string; type: 'image' | 'video' };
  homeCarouselItems: MediaItem[];
  onNavigate: (screen: ScreenId) => void;
  onSelectService: (serviceId: string) => void;
  onCustomizeBanner: () => void;
  onCustomizeStylist: (id: string, name: string, avatar: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  services,
  stylists,
  products,
  bannerMedia,
  homeCarouselItems,
  onNavigate,
  onSelectService,
  onCustomizeBanner,
  onCustomizeStylist,
}) => {
  return (
    <div className="space-y-10 sm:space-y-14 lg:space-y-16 pb-16 sm:pb-24">
      {/* HomeScreen Carousel (Carrossel da Tela Inicial) */}
      <section className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl">
        <MediaCarousel 
          items={homeCarouselItems.length > 0 ? homeCarouselItems : [
            { id: '1', url: bannerMedia.url, type: bannerMedia.type, title: "L'Élite Salon & Spa — Estilo & Sofisticação" },
            { id: '2', url: '/src/assets/images/service_haircut_1792861533533.jpg', type: 'image', title: "Tratamentos Capilares de Alta Performance" },
            { id: '3', url: '/src/assets/images/salon_hero_banner_1792861532508.jpg', type: 'image', title: "Ambiente Futurista e Confortável" }
          ]}
          heightClass="h-56 sm:h-72 md:h-80 lg:h-[400px] max-h-[55vh]"
          onCustomize={onCustomizeBanner}
          showCustomizeButton={true}
          customizeButtonLabel="Gerenciar Mídias"
        />
      </section>

      {/* Hero Action Bar */}
      <section className="p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Salão de Beleza Unissex & Barbearia Premium
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Pronto para transformar seu visual?</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">Agende seu horário com nossos profissionais especialistas ou tire dúvidas com nosso assistente inteligente.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate('booking')}
            className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Horário</span>
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Chat Público</span>
          </button>
        </div>
      </section>

      {/* Horários de Atendimento Section */}
      <section className="p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-6 items-stretch">
        <div className="space-y-1 sm:col-span-2 lg:col-span-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Horários de Atendimento
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">Sempre Prontos para Você</h3>
        </div>

        <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Segunda a Sexta-feira</p>
          <p className="text-base font-bold text-white mt-0.5">09:00 — 20:00</p>
        </div>

        <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Sábados</p>
          <p className="text-base font-bold text-white mt-0.5">09:00 — 19:00</p>
        </div>

        <div className="p-4 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Domingos e Feriados</p>
          <p className="text-base font-bold text-amber-400 mt-0.5">Fechado para Manutenção</p>
        </div>
      </section>

      {/* Services & Registered Prices */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Serviços & Preços Cadastrados</h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore todos os tratamentos unissex disponíveis</p>
          </div>
          <button
            onClick={() => onNavigate('booking')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto py-1"
          >
            Agendar serviço <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={() => {
                onSelectService(service.id);
                onNavigate('booking');
              }}
              className="group bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="h-44 sm:h-48 relative overflow-hidden bg-slate-950">
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-slate-800">
                  R$ {service.price.toFixed(2)}
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{service.durationMinutes} minutos</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{service.category}</span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                  {service.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {service.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-amber-400">
                  <span>Selecionar e agendar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Professionals Showcase */}
      <section className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Nossos Profissionais Especialistas</h2>
          <p className="text-xs text-slate-400 mt-0.5">Conheça nossa equipe de mestres em visagismo e estilismo</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stylists.map((stylist) => (
            <div key={stylist.id} className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 group">
              <div className="relative shrink-0">
                <img 
                  src={stylist.avatar} 
                  alt={stylist.name} 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-amber-500/30"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{stylist.rating}</span>
                  <span className="text-slate-500 font-normal">({stylist.reviewsCount})</span>
                </div>
                <h3 className="font-bold text-white text-base truncate">{stylist.name}</h3>
                <p className="text-xs text-slate-400 truncate">{stylist.role}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {stylist.specialties.map((spec, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md truncate max-w-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
