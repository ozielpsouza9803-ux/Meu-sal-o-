import React, { useState } from 'react';
import { Image as ImageIcon, Video, Sparkles, Scissors, Eye } from 'lucide-react';
import { ScreenId } from '../types';

interface GalleryScreenProps {
  onNavigateBooking: () => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ onNavigateBooking }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'cabelo' | 'coloracao' | 'barba'>('all');

  const galleryItems = [
    {
      id: 'g1',
      title: 'Balayage Mel & Iluminação Profissional',
      category: 'coloracao',
      type: 'image',
      url: '/src/assets/images/service_haircut_1792861533533.jpg',
      stylist: 'Juliana Vance',
    },
    {
      id: 'g2',
      title: 'Corte Moderno Bob Layered',
      category: 'cabelo',
      type: 'image',
      url: '/src/assets/images/service_haircut_1792861533533.jpg',
      stylist: 'Mariana Costa',
    },
    {
      id: 'g3',
      title: 'Barba Terapia com Acabamento Navalha',
      category: 'barba',
      type: 'image',
      url: '/src/assets/images/salon_hero_banner_1792861532508.jpg',
      stylist: 'Carlos Mendes',
    },
    {
      id: 'g4',
      title: 'Reconstrução Térmica & Escova Modelada',
      category: 'cabelo',
      type: 'image',
      url: '/src/assets/images/service_haircut_1792861533533.jpg',
      stylist: 'Juliana Vance',
    },
  ];

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-8 pb-24">
      {/* Gallery Header */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-xl">
        <div className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Portfólio L'Élite
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Galeria de Serviços Realizados</h1>
          <p className="text-xs text-slate-400 max-w-xl">Explore fotos e vídeos reais dos trabalhos executados por nossos mestres estilistas e barbeiros.</p>
        </div>

        <button
          onClick={onNavigateBooking}
          className="w-full md:w-auto justify-center min-h-[44px] px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Scissors className="w-4 h-4" />
          <span>Quero Agendar Este Estilo</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          Todos os Trabalhos
        </button>
        <button
          onClick={() => setActiveCategory('cabelo')}
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeCategory === 'cabelo' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          Cortes de Cabelo
        </button>
        <button
          onClick={() => setActiveCategory('coloracao')}
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeCategory === 'coloracao' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          Coloração & Mechas
        </button>
        <button
          onClick={() => setActiveCategory('barba')}
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeCategory === 'barba' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          Barba & Visagismo
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/40 transition-all">
            <div className="h-60 sm:h-64 relative overflow-hidden bg-slate-950">
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 uppercase border border-slate-800 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span>Trabalho Real</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Profissional: <span className="text-amber-400 font-medium">{item.stylist}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
