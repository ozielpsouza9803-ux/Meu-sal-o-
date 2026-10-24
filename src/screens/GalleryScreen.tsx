import React, { useState } from 'react';
import { 
  Play, Sparkles, Scissors, Clock, DollarSign, X, CheckCircle, 
  ExternalLink, Eye, Film, Filter, ChevronRight
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'cabelo' | 'coloracao' | 'barba' | 'tratamento';
  type: 'image' | 'video';
  mediaUrl: string;
  videoUrl?: string;
  thumbnailUrl: string;
  stylistName: string;
  stylistRole: string;
  duration: string;
  priceEstimate: string;
  description: string;
  serviceId?: string;
  tags: string[];
}

interface GalleryScreenProps {
  onNavigateBooking: (serviceId?: string) => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ onNavigateBooking }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cabelo' | 'coloracao' | 'barba' | 'video'>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'g1',
      title: 'Balayage Mel Dourado & Ondas Glamour',
      category: 'coloracao',
      type: 'image',
      mediaUrl: '/src/assets/images/gallery_balayage_1792880371564.jpg',
      thumbnailUrl: '/src/assets/images/gallery_balayage_1792880371564.jpg',
      stylistName: 'Juliana Vance',
      stylistRole: 'Master Stylist & Colorista',
      duration: '120 min',
      priceEstimate: 'R$ 280',
      description: 'Técnica de iluminação suave com transição gradual da raiz às pontas em tons avelã e mel dourado. Finalizado com ondas desconstruídas e tratamento de brilho intenso com proteção Plex.',
      serviceId: 's3',
      tags: ['Balayage', 'Loiro Dourado', 'Tratamento Plex'],
    },
    {
      id: 'g2',
      title: 'Barba Terapia & Alinhamento Visagista',
      category: 'barba',
      type: 'image',
      mediaUrl: '/src/assets/images/gallery_barber_1792880382650.jpg',
      thumbnailUrl: '/src/assets/images/gallery_barber_1792880382650.jpg',
      stylistName: 'Carlos Mendes',
      stylistRole: 'Barbeiro Visagista & Especialista',
      duration: '30 min',
      priceEstimate: 'R$ 70',
      description: 'Modelagem de barba com vapor de ozônio, toalhas aromáticas aquecidas e navalha tradicional com lâmina descartável. Aplicação de bálsamo hidratante e óleo de sândalo para nutrição profunda.',
      serviceId: 's2',
      tags: ['Barba Terapia', 'Toalha Quente', 'Navalha'],
    },
    {
      id: 'g3',
      title: 'Corte Modelado em Camadas (Bob Layered)',
      category: 'cabelo',
      type: 'image',
      mediaUrl: '/src/assets/images/service_haircut_1792861533533.jpg',
      thumbnailUrl: '/src/assets/images/service_haircut_1792861533533.jpg',
      stylistName: 'Juliana Vance',
      stylistRole: 'Master Stylist & Colorista',
      duration: '45 min',
      priceEstimate: 'R$ 90',
      description: 'Corte unissex texturizado com movimento e leveza. Inclui lavagem com massagem craniana revigorante e finalização com leave-in termoativo L\'Élite.',
      serviceId: 's1',
      tags: ['Corte Unissex', 'Texturização', 'Massagem Craniana'],
    },
    {
      id: 'g4',
      title: 'Transformação Balayage em Movimento',
      category: 'coloracao',
      type: 'video',
      mediaUrl: '/src/assets/images/gallery_balayage_1792880371564.jpg',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stylist-washing-a-clients-hair-in-a-salon-42861-large.mp4',
      thumbnailUrl: '/src/assets/images/gallery_balayage_1792880371564.jpg',
      stylistName: 'Juliana Vance',
      stylistRole: 'Master Stylist & Colorista',
      duration: 'Vídeo 40s',
      priceEstimate: 'R$ 280',
      description: 'Acompanhe o processo de lavagem especial pós-coloração, matização e escova modelada, realçando a vitalidade das mechas sob a iluminação do salão.',
      serviceId: 's3',
      tags: ['Vídeo Real', 'Coloração', 'Finalização'],
    },
    {
      id: 'g5',
      title: 'Ritual Barba Terapia & Navalha Clássica',
      category: 'barba',
      type: 'video',
      mediaUrl: '/src/assets/images/gallery_barber_1792880382650.jpg',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-mans-beard-with-a-straight-razor-42864-large.mp4',
      thumbnailUrl: '/src/assets/images/gallery_barber_1792880382650.jpg',
      stylistName: 'Carlos Mendes',
      stylistRole: 'Barbeiro Visagista & Especialista',
      duration: 'Vídeo 30s',
      priceEstimate: 'R$ 70',
      description: 'Demonstração do acabamento preciso na navalha e toalha aquecida, garantindo pele macia sem irritações e contornos impecáveis.',
      serviceId: 's2',
      tags: ['Vídeo Real', 'Barba', 'Navalha Tradicional'],
    },
    {
      id: 'g6',
      title: 'Experiência & Bem-Estar no Spa L\'Élite',
      category: 'tratamento',
      type: 'image',
      mediaUrl: '/src/assets/images/salon_hero_banner_1792861532508.jpg',
      thumbnailUrl: '/src/assets/images/salon_hero_banner_1792861532508.jpg',
      stylistName: 'Equipe L\'Élite',
      stylistRole: 'Especialistas em Beleza & Relaxamento',
      duration: '60 min',
      priceEstimate: 'R$ 150',
      description: 'Ambiente aconchegante com som ambiente relaxante, café gourmet e atendimento exclusivo com profissionais de referência internacional.',
      serviceId: 's4',
      tags: ['Spa Capilar', 'Ambiente Premium', 'Café & Conforto'],
    },
  ];

  const filteredItems = galleryItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'video') return item.type === 'video';
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-5 sm:p-7 lg:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portfólio Real de Transformações</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Galeria de Serviços Realizados
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Fotos e vídeos reais dos cortes, barboterapias, mechas e tratamentos executados em nosso espaço. Toque em qualquer trabalho para ver detalhes ou agendar o mesmo estilo.
            </p>
          </div>

          <button
            onClick={() => onNavigateBooking()}
            className="w-full md:w-auto min-h-[46px] px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <Scissors className="w-4 h-4" />
            <span>Agendar Novo Atendimento</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs - Mobile scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {[
          { id: 'all', label: 'Todos os Trabalhos', icon: Sparkles },
          { id: 'cabelo', label: 'Cortes & Estilo', icon: Scissors },
          { id: 'coloracao', label: 'Coloração & Mechas', icon: Sparkles },
          { id: 'barba', label: 'Barba & Visagismo', icon: Scissors },
          { id: 'video', label: 'Vídeos de Serviços', icon: Film },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as typeof selectedCategory)}
              className={`
                min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0
                ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Gallery Cards Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition-all duration-200 flex flex-col justify-between"
          >
            {/* Visual Media Container with Aspect Ratio */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-950 overflow-hidden">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
              />

              {/* Type Badge (Image or Video) */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-slate-800/80 flex items-center gap-1.5 shadow-sm">
                {item.type === 'video' ? (
                  <>
                    <Film className="w-3 h-3 text-amber-400" />
                    <span>Vídeo Real</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Trabalho Real</span>
                  </>
                )}
              </div>

              {/* Duration / Price Pill */}
              <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-slate-800/80 flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{item.duration}</span>
              </div>

              {/* Play Button Overlay for Videos */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-amber-400 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Professional & Price Row */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Profissional</span>
                  <span className="font-semibold text-amber-400">{item.stylistName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">A partir de</span>
                  <span className="font-bold text-white">{item.priceEstimate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveItem(item);
                  }}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ver Detalhes</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateBooking(item.serviceId);
                  }}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Agendar</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Lightbox / Video Modal */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveItem(null)}
        >
          <div 
            className="w-full max-w-xl max-h-[90dvh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <h2 className="font-bold text-white text-base sm:text-lg truncate">{activeItem.title}</h2>
                <p className="text-xs text-amber-400 font-medium">Realizado por {activeItem.stylistName}</p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Media Display */}
            <div className="relative bg-slate-950 flex items-center justify-center max-h-[50dvh] overflow-hidden">
              {activeItem.type === 'video' && activeItem.videoUrl ? (
                <video
                  src={activeItem.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  poster={activeItem.thumbnailUrl}
                  className="w-full max-h-[48dvh] object-contain"
                />
              ) : (
                <img
                  src={activeItem.mediaUrl}
                  alt={activeItem.title}
                  className="w-full max-h-[48dvh] object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Modal Details & Action */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeItem.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {activeItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Info Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Tempo estimado</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {activeItem.duration}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Investimento</span>
                  <span className="font-bold text-amber-400 text-sm">{activeItem.priceEstimate}</span>
                </div>
              </div>

              {/* Schedule CTA */}
              <button
                type="button"
                onClick={() => {
                  const sId = activeItem.serviceId;
                  setActiveItem(null);
                  onNavigateBooking(sId);
                }}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-98"
              >
                <Scissors className="w-4 h-4" />
                <span>Agendar Este Estilo com {activeItem.stylistName}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
