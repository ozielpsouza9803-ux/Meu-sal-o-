import React, { useState, useEffect } from 'react';
import { PublicMenu } from './components/PublicMenu';
import { ClientMenu } from './components/ClientMenu';
import { ProfessionalMenu } from './components/ProfessionalMenu';
import { AdminMenu } from './components/AdminMenu';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { MediaCustomizerModal } from './components/MediaCustomizerModal';
import { FloatingChatWidget } from './components/FloatingChatWidget';

import { HomeScreen } from './screens/HomeScreen';
import { ClientScreen } from './screens/ClientScreen';
import { ProfessionalScreen } from './screens/ProfessionalScreen';
import { AdminScreen } from './screens/AdminScreen';
import { BookingScreen } from './screens/BookingScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { ChatScreen } from './screens/ChatScreen';
import { GalleryScreen } from './screens/GalleryScreen';

import { ScreenId, UserRole, Service, Stylist, Product, Appointment, ChatMessage } from './types';
import { INITIAL_SERVICES, INITIAL_STYLISTS, INITIAL_PRODUCTS, INITIAL_APPOINTMENTS, INITIAL_MESSAGES } from './data/mockData';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Independent Menu Open States
  const [isPublicMenuOpen, setIsPublicMenuOpen] = useState<boolean>(false);
  const [isClientMenuOpen, setIsClientMenuOpen] = useState<boolean>(false);
  const [isProfessionalMenuOpen, setIsProfessionalMenuOpen] = useState<boolean>(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState<boolean>(false);

  // Persistent State via localStorage
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('eliter_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [stylists, setStylists] = useState<Stylist[]>(() => {
    const saved = localStorage.getItem('eliter_stylists');
    return saved ? JSON.parse(saved) : INITIAL_STYLISTS;
  });

  const [products] = useState<Product[]>(() => {
    const saved = localStorage.getItem('eliter_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('eliter_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('eliter_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [bannerMedia, setBannerMedia] = useState<{ url: string; type: 'image' | 'video' }>(() => {
    const saved = localStorage.getItem('eliter_banner');
    return saved ? JSON.parse(saved) : { url: '/src/assets/images/salon_hero_banner_1792861532508.jpg', type: 'image' };
  });

  // Media customizer modal state
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    type: 'image' | 'video';
    targetType: 'banner' | 'product' | 'stylist' | 'client';
    targetId?: string;
  }>({
    isOpen: false,
    title: '',
    url: '',
    type: 'image',
    targetType: 'banner',
  });

  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('eliter_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('eliter_stylists', JSON.stringify(stylists));
  }, [stylists]);

  useEffect(() => {
    localStorage.setItem('eliter_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('eliter_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('eliter_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('eliter_banner', JSON.stringify(bannerMedia));
  }, [bannerMedia]);

  // Route & Role Guard Handler
  const handleNavigateScreen = (screen: ScreenId) => {
    // Public menu restrictions
    const publicAllowedScreens: ScreenId[] = ['home', 'products', 'booking', 'chat', 'gallery'];
    if (!isAuthenticated && !publicAllowedScreens.includes(screen)) {
      alert("Acesso Restrito: Faça login ou cadastre-se para acessar esta área privada.");
      return;
    }

    if (isAuthenticated && currentRole === 'client' && (screen === 'admin' || screen === 'professional')) {
      alert("Acesso Negado: Sua função atual (Cliente) não possui permissão para acessar este painel.");
      return;
    }

    if (isAuthenticated && currentRole === 'professional' && screen === 'admin') {
      alert("Acesso Negado: Apenas Administradores podem acessar o Painel Administrativo.");
      return;
    }

    if (screen === 'booking') setEditingAppointment(null);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginClick = (role: UserRole) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    if (role === 'professional') {
      setCurrentScreen('professional');
    } else if (role === 'admin') {
      setCurrentScreen('admin');
    } else {
      setCurrentScreen('client');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole('client');
    setCurrentScreen('home');
  };

  // Handlers
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceIdForBooking(serviceId);
    setEditingAppointment(null);
    setCurrentScreen('booking');
  };

  const handleConfirmBooking = (newApp: Appointment) => {
    setAppointments(prev => [newApp, ...prev]);
  };

  const handleUpdateAppointment = (updatedApp: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    setEditingAppointment(null);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelado' as const } : a));
  };

  const handleEditAppointment = (app: Appointment) => {
    setEditingAppointment(app);
    setCurrentScreen('booking');
  };

  const handleAddService = (newService: Service) => {
    if (currentRole !== 'admin') {
      alert("Permissão negada: apenas administradores podem adicionar serviços.");
      return;
    }
    setServices(prev => [newService, ...prev]);
  };

  const handleDeleteService = (id: string) => {
    if (currentRole !== 'admin') {
      alert("Permissão negada: apenas administradores podem excluir serviços.");
      return;
    }
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateStylistStatus = (stylistId: string, status: Stylist['status']) => {
    setStylists(prev => prev.map(st => st.id === stylistId ? { ...st, status } : st));
  };

  const handleOpenMediaCustomizer = (
    title: string,
    url: string,
    type: 'image' | 'video',
    targetType: 'banner' | 'product' | 'stylist' | 'client',
    targetId?: string
  ) => {
    if (!isAuthenticated || (currentRole === 'client' && targetType !== 'client')) {
      alert("Permissão negada: faça login com a função apropriada para personalizar mídias.");
      return;
    }
    setMediaModal({
      isOpen: true,
      title,
      url,
      type,
      targetType,
      targetId,
    });
  };

  const handleSaveMedia = (newUrl: string, newType: 'image' | 'video') => {
    if (mediaModal.targetType === 'banner') {
      setBannerMedia({ url: newUrl, type: newType });
    } else if (mediaModal.targetType === 'stylist' && mediaModal.targetId) {
      setStylists(prev => prev.map(s => s.id === mediaModal.targetId ? { ...s, avatar: newUrl } : s));
    }
  };

  const handleDeleteMedia = () => {
    if (mediaModal.targetType === 'banner') {
      setBannerMedia({ url: '/src/assets/images/salon_hero_banner_1792861532508.jpg', type: 'image' });
    } else if (mediaModal.targetType === 'stylist' && mediaModal.targetId) {
      setStylists(prev => prev.map(s => s.id === mediaModal.targetId ? { ...s, avatar: '/src/assets/images/stylist_avatar_1792861532780.jpg' } : s));
    }
  };

  const handleSendMessage = (text: string, customBotReply?: string) => {
    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: 'm-' + (Date.now() + 1),
        sender: 'assistant',
        text: customBotReply || (currentRole === 'professional' 
          ? `Suporte à agenda: Recebemos sua solicitação sobre "${text}". Um gestor operacional entrará em contato em instantes.`
          : `Compreendido! Nossa equipe recebeu sua mensagem sobre "${text}". O agendamento ou dúvida já foi registrado em nosso sistema PWA.`),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col antialiased">
      {/* Completely Separated Menus */}
      {!isAuthenticated && (
        <PublicMenu 
          isOpen={isPublicMenuOpen}
          onToggle={() => setIsPublicMenuOpen(!isPublicMenuOpen)}
          onSelectScreen={handleNavigateScreen}
          onLoginClick={handleLoginClick}
        />
      )}

      {isAuthenticated && currentRole === 'client' && (
        <ClientMenu 
          isOpen={isClientMenuOpen}
          onToggle={() => setIsClientMenuOpen(!isClientMenuOpen)}
          currentScreen={currentScreen}
          onSelectScreen={handleNavigateScreen}
          onLogout={handleLogout}
        />
      )}

      {isAuthenticated && currentRole === 'professional' && (
        <ProfessionalMenu 
          isOpen={isProfessionalMenuOpen}
          onToggle={() => setIsProfessionalMenuOpen(!isProfessionalMenuOpen)}
          currentScreen={currentScreen}
          onSelectScreen={handleNavigateScreen}
          onLogout={handleLogout}
        />
      )}

      {isAuthenticated && currentRole === 'admin' && (
        <AdminMenu 
          isOpen={isAdminMenuOpen}
          onToggle={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
          currentScreen={currentScreen}
          onSelectScreen={handleNavigateScreen}
          onLogout={handleLogout}
        />
      )}

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col pl-16 sm:pl-20">
        <Header 
          onToggleSidebar={() => {
            if (!isAuthenticated) setIsPublicMenuOpen(true);
            else if (currentRole === 'client') setIsClientMenuOpen(true);
            else if (currentRole === 'professional') setIsProfessionalMenuOpen(true);
            else setIsAdminMenuOpen(true);
          }}
          currentScreen={currentScreen}
          onSelectScreen={handleNavigateScreen}
          currentRole={isAuthenticated ? currentRole : 'client'}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        />

        {/* Viewport container */}
        <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
          {isMobileFrame ? (
            <div className="w-[390px] h-[844px] bg-slate-950 border-[10px] border-slate-800 rounded-[50px] shadow-2xl overflow-hidden flex flex-col relative my-4 ring-1 ring-amber-500/20">
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-700 rounded-full" />
              </div>

              <div className="flex-1 overflow-y-auto pt-8 pb-24 px-4 relative">
                {currentScreen === 'home' && (
                  <HomeScreen 
                    services={services} 
                    stylists={stylists} 
                    products={products}
                    bannerMedia={bannerMedia}
                    onNavigate={handleNavigateScreen} 
                    onSelectService={handleSelectService}
                    onCustomizeBanner={() => handleOpenMediaCustomizer("Personalizar Banner Principal", bannerMedia.url, bannerMedia.type, 'banner')}
                    onCustomizeStylist={(id, name, avatar) => handleOpenMediaCustomizer(`Personalizar Foto de ${name}`, avatar, 'image', 'stylist', id)}
                  />
                )}
                {currentScreen === 'client' && isAuthenticated && (
                  <ClientScreen 
                    appointments={appointments} 
                    stylists={stylists} 
                    onCancelAppointment={handleCancelAppointment} 
                    onEditAppointment={handleEditAppointment}
                    onNewBooking={() => {
                      setEditingAppointment(null);
                      setCurrentScreen('booking');
                    }}
                  />
                )}
                {currentScreen === 'professional' && isAuthenticated && (
                  <ProfessionalScreen 
                    appointments={appointments} 
                    stylists={stylists} 
                    onUpdateStatus={handleUpdateStylistStatus}
                    onCustomizeAvatar={(id, name, avatar) => handleOpenMediaCustomizer(`Personalizar Avatar de ${name}`, avatar, 'image', 'stylist', id)}
                  />
                )}
                {currentScreen === 'admin' && isAuthenticated && currentRole === 'admin' && (
                  <AdminScreen 
                    services={services} 
                    stylists={stylists} 
                    onAddService={handleAddService} 
                    onDeleteService={handleDeleteService}
                    onCustomizeStylist={(id, name, avatar) => handleOpenMediaCustomizer(`Personalizar Perfil de ${name}`, avatar, 'image', 'stylist', id)}
                  />
                )}
                {currentScreen === 'booking' && (
                  <BookingScreen 
                    services={services} 
                    stylists={stylists} 
                    appointments={appointments}
                    selectedServiceId={selectedServiceIdForBooking}
                    editingAppointment={editingAppointment}
                    onConfirmBooking={handleConfirmBooking}
                    onUpdateAppointment={handleUpdateAppointment}
                    onComplete={() => setCurrentScreen('client')}
                  />
                )}
                {currentScreen === 'gallery' && (
                  <GalleryScreen onNavigateBooking={() => setCurrentScreen('booking')} />
                )}
                {currentScreen === 'products' && (
                  <ProductsScreen 
                    products={products} 
                    onCustomizeProduct={(id, name, img) => handleOpenMediaCustomizer(`Personalizar Produto: ${name}`, img, 'image', 'product', id)}
                  />
                )}
                {currentScreen === 'chat' && (
                  <ChatScreen messages={messages} onSendMessage={handleSendMessage} />
                )}

                {/* Floating Circular Chat Widget */}
                <FloatingChatWidget 
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onNavigateBooking={() => {
                    setEditingAppointment(null);
                    setCurrentScreen('booking');
                  }}
                  currentScreen={currentScreen}
                  currentRole={isAuthenticated ? currentRole : 'client'}
                  appointments={appointments}
                />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto relative">
              {currentScreen === 'home' && (
                <HomeScreen 
                  services={services} 
                  stylists={stylists} 
                  products={products}
                  bannerMedia={bannerMedia}
                  onNavigate={handleNavigateScreen} 
                  onSelectService={handleSelectService}
                  onCustomizeBanner={() => handleOpenMediaCustomizer("Personalizar Banner Principal", bannerMedia.url, bannerMedia.type, 'banner')}
                  onCustomizeStylist={(id, name, avatar) => handleOpenMediaCustomizer(`Personalizar Foto de ${name}`, avatar, 'image', 'stylist', id)}
                />
              )}
              {currentScreen === 'client' && isAuthenticated && (
                <ClientScreen 
                  appointments={appointments} 
                  stylists={stylists} 
                  onCancelAppointment={handleCancelAppointment} 
                  onEditAppointment={handleEditAppointment}
                  onNewBooking={() => {
                    setEditingAppointment(null);
                    setCurrentScreen('booking');
                  }}
                />
              )}
              {currentScreen === 'professional' && isAuthenticated && (
                <ProfessionalScreen 
                  appointments={appointments} 
                  stylists={stylists} 
                  onUpdateStatus={handleUpdateStylistStatus}
                  onCustomizeAvatar={(id, name, avatar) => handleOpenMediaCustomizer(`Personalizar Avatar de ${name}`, avatar, 'image', 'stylist', id)}
                />
              )}
              {currentScreen === 'admin' && isAuthenticated && currentRole === 'admin' && (
                <AdminScreen 
                  services={services} 
                  stylists={stylists} 
                  onAddService={handleAddService} 
                  onDeleteService={handleDeleteService}
                  onCustomizeStylist={(id, name, avatar) => handleOpenMediaCustomizer(`Personalizar Perfil de ${name}`, avatar, 'image', 'stylist', id)}
                />
              )}
              {((currentScreen === 'client' || currentScreen === 'professional' || currentScreen === 'admin') && !isAuthenticated) && (
                <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
                  <h2 className="text-xl font-bold text-white">Acesso Restrito</h2>
                  <p className="text-xs text-slate-400">Por favor, utilize o menu público e clique em "Entrar ou cadastrar" para acessar esta área.</p>
                </div>
              )}
              {currentScreen === 'booking' && (
                <BookingScreen 
                  services={services} 
                  stylists={stylists} 
                  appointments={appointments}
                  selectedServiceId={selectedServiceIdForBooking}
                  editingAppointment={editingAppointment}
                  onConfirmBooking={handleConfirmBooking}
                  onUpdateAppointment={handleUpdateAppointment}
                  onComplete={() => setCurrentScreen('client')}
                />
              )}
              {currentScreen === 'gallery' && (
                <GalleryScreen onNavigateBooking={() => setCurrentScreen('booking')} />
              )}
              {currentScreen === 'products' && (
                <ProductsScreen 
                  products={products} 
                  onCustomizeProduct={(id, name, img) => handleOpenMediaCustomizer(`Personalizar Produto: ${name}`, img, 'image', 'product', id)}
                />
              )}
              {currentScreen === 'chat' && (
                <ChatScreen messages={messages} onSendMessage={handleSendMessage} />
              )}

              {/* Floating Circular Chat Widget */}
              <FloatingChatWidget 
                messages={messages}
                onSendMessage={handleSendMessage}
                onNavigateBooking={() => {
                  setEditingAppointment(null);
                  setCurrentScreen('booking');
                }}
                currentScreen={currentScreen}
                currentRole={isAuthenticated ? currentRole : 'client'}
                appointments={appointments}
              />
            </div>
          )}
        </main>

        {/* Mobile Thumb-Zone Bottom Tab Bar */}
        <MobileNav 
          currentScreen={currentScreen}
          onSelectScreen={handleNavigateScreen}
        />
      </div>

      {/* Media Customizer Modal */}
      <MediaCustomizerModal 
        isOpen={mediaModal.isOpen}
        onClose={() => setMediaModal(prev => ({ ...prev, isOpen: false }))}
        title={mediaModal.title}
        currentMediaUrl={mediaModal.url}
        mediaType={mediaModal.type}
        onSave={handleSaveMedia}
        onDelete={handleDeleteMedia}
      />
    </div>
  );
}
