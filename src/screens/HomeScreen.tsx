import React from 'react';
import { Sparkles, Star, Calendar, ArrowRight, Clock, Scissors, Award, Camera, ShoppingBag, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Service, Stylist, Product, ScreenId } from '../types';

interface HomeScreenProps {
  services: Service[];
  stylists: Stylist[];
  products: Product[];
  bannerMedia: { url: string; type: 'image' | 'video' };
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
  onNavigate,
  onSelectService,
  onCustomizeBanner,
  onCustomizeStylist,
}) => {
  return (
    <div className="space-y-16 pb-24">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 p-8 lg:p-14 shadow-2xl group">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          {bannerMedia.type === 'video' ? (
            <video 
              src={bannerMedia.url} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover" 
            />
          ) : (
            <img 
              src={bannerMedia.url} 
              alt="Salon Interior" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />

        {/* Customize Banner Floating Button */}
        <button
          onClick={onCustomizeBanner}
          className="absolute top-4 right-4 z-30 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md transition-all opacity-80 hover:opacity-100"
          title="Personalizar Banner (Imagem ou Vídeo)"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Personalizar Banner</span>
        </button>

        <div className="relative z-20 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            Salão de Beleza Unissex & Barbearia Premium
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight text-balance">
            Estilo, Cuidado & Sofisticação em Cada Detalhe
          </h1>

          <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
            Conheça nossos serviços, profissionais de elite, produtos importados e horários de atendimento. Agende seu horário com segurança e elegância.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('booking')}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Horário Agora</span>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 font-medium text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Chat Público & Dúvidas</span>
            </button>
          </div>
        </div>
      </section>

      {/* Horários de Atendimento Section */}
      <section className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Horários de Atendimento
          </div>
          <h3 className="text-lg font-bold text-white">Sempre Prontos para Você</h3>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Segunda a Sexta-feira</p>
          <p className="text-base font-bold text-white mt-0.5">09:00 — 20:00</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Sábados</p>
          <p className="text-base font-bold text-white mt-0.5">09:00 — 19:00</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
          <p className="text-xs text-slate-400 font-medium">Domingos e Feriados</p>
          <p className="text-base font-bold text-amber-400 mt-0.5">Fechado para Manutenção</p>
        </div>
      </section>

      {/* Services & Registered Prices */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Serviços & Preços Cadastrados</h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore todos os tratamentos unissex disponíveis</p>
          </div>
          <button
            onClick={() => onNavigate('booking')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Agendar serviço <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              onClick={() => {
                onSelectService(service.id);
                onNavigate('booking');
              }}
              className="group bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="h-48 relative overflow-hidden bg-slate-950">
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

              <div className="p-5 space-y-3">
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
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Nossos Profissionais Especialistas</h2>
          <p className="text-xs text-slate-400 mt-0.5">Conheça nossa equipe de mestres em visagismo e estilismo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stylists.map((stylist) => (
            <div key={stylist.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 group">
              <div className="relative">
                <img 
                  src={stylist.avatar} 
                  alt={stylist.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-amber-500/30"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{stylist.rating}</span>
                  <span className="text-slate-500 font-normal">({stylist.reviewsCount})</span>
                </div>
                <h3 className="font-bold text-white text-base">{stylist.name}</h3>
                <p className="text-xs text-slate-400">{stylist.role}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {stylist.specialties.map((spec, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products Showcase Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Vitrine de Produtos Recomendados</h2>
            <p className="text-xs text-slate-400 mt-0.5">Home care profissional disponível no salão</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Ver vitrine completa <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <div 
              key={product.id}
              onClick={() => onNavigate('products')}
              className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all cursor-pointer"
            >
              <div className="h-44 relative overflow-hidden bg-slate-950">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-bold text-amber-400 uppercase border border-slate-800">
                  {product.category}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-white text-sm line-clamp-1">{product.name}</h3>
                <p className="text-sm font-bold text-amber-400">R$ {product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
