import React, { useState, useEffect } from 'react';
import { PublicMenu } from './components/PublicMenu';
import { ClientMenu } from './components/ClientMenu';
import { ProfessionalMenu } from './components/ProfessionalMenu';
import { AdminMenu } from './components/AdminMenu';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { MediaCustomizerModal } from './components/MediaCustomizerModal';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { AuthModal } from './components/AuthModal';
import { MediaItem } from './components/MediaCarousel';
import { ShieldCheck } from 'lucide-react';

import { HomeScreen } from './screens/HomeScreen';
import { ClientScreen } from './screens/ClientScreen';
import { ProfessionalScreen } from './screens/ProfessionalScreen';
import { AdminScreen } from './screens/AdminScreen';
import { BookingScreen } from './screens/BookingScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { ChatScreen } from './screens/ChatScreen';
import { GalleryScreen } from './screens/GalleryScreen';

import { ScreenId, UserRole, Service, Stylist, Product, Appointment, ChatMessage, PaymentSettings, Banner } from './types';
import { INITIAL_SERVICES, INITIAL_STYLISTS, INITIAL_PRODUCTS, INITIAL_APPOINTMENTS, INITIAL_MESSAGES } from './data/mockData';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [currentUser, setCurrentUser] = useState<{ name: string; email?: string } | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<'public' | 'client' | 'professional' | 'admin' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('lelite_auth_token');
    } catch {
      return null;
    }
  });

  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'client' | 'register' | 'professional' | 'admin' }>({
    isOpen: false,
    mode: 'client',
  });

  const handleToggleChat = () => setIsChatOpen(!isChatOpen);

  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>(INITIAL_STYLISTS);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [bannerMedia, setBannerMedia] = useState<{ url: string; type: 'image' | 'video' }>({
    url: '/src/assets/images/salon_hero_banner_1792861532508.jpg',
    type: 'image',
  });
  const [homeCarouselItems, setHomeCarouselItems] = useState<MediaItem[]>([]);
  const [productCarouselItems, setProductCarouselItems] = useState<MediaItem[]>([]);
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    type: 'image' | 'video';
    targetType: 'banner' | 'product_carousel' | 'product' | 'stylist' | 'client';
    targetId?: string;
  }>({ isOpen: false, title: '', url: '', type: 'image', targetType: 'client' });
  
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  // Restore authenticated session from cryptographic token on mount
  useEffect(() => {
    if (authToken) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setCurrentRole(data.role);
          setCurrentUser(data.user);
        } else {
          // Token invalid or expired
          try { localStorage.removeItem('lelite_auth_token'); } catch {}
          setAuthToken(null);
          setIsAuthenticated(false);
          setCurrentRole('client');
          setCurrentUser(null);
        }
      })
      .catch(() => {});
    }
  }, [authToken]);

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(setServices).catch(() => setServices(INITIAL_SERVICES));
    fetch('/api/products').then(res => res.json()).then(setProducts).catch(() => setProducts(INITIAL_PRODUCTS));
    fetch('/api/banners').then(res => res.json()).then(setBanners).catch(() => {});
    fetch('/api/payment-settings').then(res => res.json()).then(setPaymentSettings).catch(() => {});
  }, []);

  // Fetch appointments with cryptographic bearer token
  useEffect(() => {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    fetch('/api/appointments', { headers })
      .then(res => {
        if (res.ok) return res.json();
        return [];
      })
      .then(data => {
        setAppointments(data);
      })
      .catch(() => setAppointments(INITIAL_APPOINTMENTS));
  }, [authToken, currentRole]);

  const handleOpenAuth = (mode: 'client' | 'register' | 'professional' | 'admin' = 'client') => {
    setOpenMenu(null);
    setAuthModal({ isOpen: true, mode });
  };

  const handleLoginSuccess = (
    role: UserRole, 
    user?: { id?: string; name: string; email?: string; role?: UserRole; stylistId?: string },
    token?: string
  ) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    if (user) setCurrentUser(user);
    if (token) {
      setAuthToken(token);
      try {
        localStorage.setItem('lelite_auth_token', token);
      } catch {}
    }
    setOpenMenu(null);
    setCurrentScreen(role === 'professional' ? 'professional' : role === 'admin' ? 'admin' : 'client');
  };

  const handleNavigateScreen = (screen: ScreenId) => {
    const publicAllowedScreens: ScreenId[] = ['home', 'products', 'booking', 'chat', 'gallery'];
    if (!isAuthenticated && !publicAllowedScreens.includes(screen)) {
      handleOpenAuth(screen === 'admin' ? 'admin' : screen === 'professional' ? 'professional' : 'client');
      return;
    }
    if (isAuthenticated && currentRole === 'client' && (screen === 'admin' || screen === 'professional')) {
      handleOpenAuth(screen === 'admin' ? 'admin' : 'professional');
      return;
    }
    if (isAuthenticated && currentRole === 'professional' && screen === 'admin') {
      handleOpenAuth('admin');
      return;
    }
    if (screen === 'booking') setEditingAppointment(null);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenMenu(null);
    setIsChatOpen(false);
  };

  const handleLoginClick = (role: UserRole) => {
    handleOpenAuth(role === 'admin' ? 'admin' : role === 'professional' ? 'professional' : 'client');
  };

  const handleLogout = () => { 
    setIsAuthenticated(false); 
    setCurrentRole('client'); 
    setCurrentUser(null);
    setAuthToken(null);
    try {
      localStorage.removeItem('lelite_auth_token');
    } catch {}
    setCurrentScreen('home'); 
    setOpenMenu(null); 
  };

  const handleOpenMediaCustomizer = (title: string, url: string, type: 'image' | 'video', targetType: 'banner' | 'product_carousel' | 'product' | 'stylist' | 'client', targetId?: string) => {
    if (!isAuthenticated || (currentRole === 'client' && targetType !== 'client')) { 
      handleOpenAuth('admin'); 
      return; 
    }
    setMediaModal({ isOpen: true, title, url, type, targetType, targetId });
  };

  const handleSaveMedia = (newUrl: string, newType: 'image' | 'video') => {
    if (mediaModal.targetType === 'banner') {
      setBannerMedia({ url: newUrl, type: newType });
    } else if (mediaModal.targetType === 'product_carousel') {
      setProductCarouselItems(prev => [{ id: 'prod-cust-' + Date.now(), url: newUrl, type: newType, title: "Novo Destaque" }, ...prev]);
    } else if (mediaModal.targetType === 'stylist' && mediaModal.targetId) {
      setStylists(prev => prev.map(s => s.id === mediaModal.targetId ? { ...s, avatar: newUrl } : s));
    }
  };

  const handleDeleteMedia = () => {
    if (mediaModal.targetType === 'banner') setBannerMedia({ url: '/src/assets/images/salon_hero_banner_1792861532508.jpg', type: 'image' });
    else if (mediaModal.targetType === 'product_carousel') setProductCarouselItems(prev => prev.slice(1));
    else if (mediaModal.targetType === 'stylist' && mediaModal.targetId) setStylists(prev => prev.map(s => s.id === mediaModal.targetId ? { ...s, avatar: '/src/assets/images/stylist_avatar_1792861532780.jpg' } : s));
  };

  const handleSendMessage = (text: string, customBotReply?: string) => {
    const userMsg: ChatMessage = { id: 'm-' + Date.now(), sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const botMsg: ChatMessage = { id: 'm-' + (Date.now() + 1), sender: 'assistant', text: customBotReply || "Entendido, nossa equipe entrará em contato.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelado' } : a));
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setCurrentScreen('booking');
  };

  const handleConfirmBooking = async (app: Appointment) => {
    setAppointments(prev => [app, ...prev]);
    if (authToken) {
      try {
        await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(app),
        });
      } catch {}
    }
  };

  const handleUpdateAppointment = (app: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === app.id ? app : a));
    setEditingAppointment(null);
  };

  const handleUpdateStylistStatus = (id: string, status: 'disponível' | 'em atendimento' | 'pausa') => {
    setStylists(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleAddService = (service: Service) => {
    setServices(prev => [...prev, service]);
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleAddProduct = (product: Product) => setProducts(prev => [...prev, product]);
  const handleDeleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const handleAddBanner = (banner: Banner) => setBanners(prev => [...prev, banner]);
  const handleDeleteBanner = (id: string) => setBanners(prev => prev.filter(b => b.id !== id));

  const ScreenComponent = () => {
    switch (currentScreen) {
      case 'home': 
        return (
          <HomeScreen 
            services={services} 
            stylists={stylists} 
            products={products} 
            bannerMedia={bannerMedia} 
            homeCarouselItems={homeCarouselItems} 
            onNavigate={handleNavigateScreen} 
            onSelectService={(id) => { setSelectedServiceIdForBooking(id); setCurrentScreen('booking'); }} 
            onCustomizeBanner={() => handleOpenMediaCustomizer("Carrossel Inicial", bannerMedia.url, bannerMedia.type, 'banner')} 
            onCustomizeStylist={(id, name, avatar) => handleOpenMediaCustomizer(`Foto de ${name}`, avatar, 'image', 'stylist', id)} 
          />
        );
      case 'client': 
        return (
          <ClientScreen 
            appointments={appointments} 
            stylists={stylists} 
            currentUser={currentUser}
            onCancelAppointment={handleCancelAppointment} 
            onEditAppointment={handleEditAppointment} 
            onNewBooking={() => { setEditingAppointment(null); setCurrentScreen('booking'); }} 
          />
        );
      case 'professional': 
        return (
          <ProfessionalScreen 
            appointments={appointments} 
            stylists={stylists} 
            currentUser={currentUser}
            onUpdateStatus={handleUpdateStylistStatus} 
            onCustomizeAvatar={(id, name, avatar) => handleOpenMediaCustomizer(`Foto de ${name}`, avatar, 'image', 'stylist', id)} 
          />
        );
      case 'admin': 
        return currentRole === 'admin' ? (
          <AdminScreen 
            services={services} 
            products={products} 
            banners={banners} 
            stylists={stylists} 
            onAddService={handleAddService} 
            onDeleteService={handleDeleteService} 
            onAddProduct={handleAddProduct} 
            onDeleteProduct={handleDeleteProduct} 
            onAddBanner={handleAddBanner} 
            onDeleteBanner={handleDeleteBanner} 
            onCustomizeStylist={(id, name, avatar) => handleOpenMediaCustomizer(`Perfil de ${name}`, avatar, 'image', 'stylist', id)} 
            currentRole={currentRole} 
            authToken={authToken || undefined}
            paymentSettings={paymentSettings} 
            onUpdatePaymentSettings={async (newSettings) => { 
              await fetch('/api/payment-settings', { 
                method: 'POST', 
                headers: { 
                  'Content-Type': 'application/json',
                  ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                }, 
                body: JSON.stringify(newSettings) 
              }); 
              setPaymentSettings(newSettings); 
            }} 
          />
        ) : (
          <div className="py-16 px-4 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Acesso Restrito ao Painel Master</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Esta área requer credencial e autenticação autorizada da administração do L'Élite Salon & Spa.
            </p>
            <button
              onClick={() => handleOpenAuth('admin')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              Autenticar como Administrador
            </button>
          </div>
        );
      case 'booking': 
        return (
          <BookingScreen 
            services={services} 
            stylists={stylists} 
            appointments={appointments} 
            selectedServiceId={selectedServiceIdForBooking || undefined} 
            editingAppointment={editingAppointment} 
            onConfirmBooking={handleConfirmBooking} 
            onUpdateAppointment={handleUpdateAppointment} 
            onComplete={() => setCurrentScreen('client')} 
            paymentSettings={paymentSettings} 
          />
        );
      case 'gallery': 
        return <GalleryScreen onNavigateBooking={() => setCurrentScreen('booking')} />;
      case 'products': 
        return (
          <ProductsScreen 
            products={products} 
            productCarouselItems={productCarouselItems} 
            onCustomizeProduct={(id, name, img) => handleOpenMediaCustomizer(`Produto: ${name}`, img, 'image', 'product', id)} 
            onCustomizeProductCarousel={() => handleOpenMediaCustomizer("Carrossel de Produtos", productCarouselItems[0]?.url || '', 'image', 'product_carousel')} 
          />
        );
      case 'chat': 
        return <ChatScreen messages={messages} onSendMessage={handleSendMessage} />;
      default: 
        return <div />;
    }
  };

  const handleToggleSidebar = () => {
    if (!isAuthenticated) {
      setOpenMenu(prev => prev === 'public' ? null : 'public');
    } else if (currentRole === 'client') {
      setOpenMenu(prev => prev === 'client' ? null : 'client');
    } else if (currentRole === 'professional') {
      setOpenMenu(prev => prev === 'professional' ? null : 'professional');
    } else if (currentRole === 'admin') {
      setOpenMenu(prev => prev === 'admin' ? null : 'admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-x-hidden">
      {!isAuthenticated ? (
        <PublicMenu 
          isOpen={openMenu === 'public'} 
          onToggle={() => setOpenMenu(openMenu === 'public' ? null : 'public')} 
          onSelectScreen={handleNavigateScreen} 
          onLoginClick={handleLoginClick} 
          onOpenAuth={handleOpenAuth} 
        />
      ) : null}

      {isAuthenticated && currentRole === 'client' && (
        <ClientMenu 
          isOpen={openMenu === 'client'} 
          onToggle={() => setOpenMenu(openMenu === 'client' ? null : 'client')} 
          currentScreen={currentScreen} 
          onSelectScreen={handleNavigateScreen} 
          onLogout={handleLogout} 
        />
      )}

      {isAuthenticated && currentRole === 'professional' && (
        <ProfessionalMenu 
          isOpen={openMenu === 'professional'} 
          onToggle={() => setOpenMenu(openMenu === 'professional' ? null : 'professional')} 
          currentScreen={currentScreen} 
          onSelectScreen={handleNavigateScreen} 
          onLogout={handleLogout} 
        />
      )}

      {isAuthenticated && currentRole === 'admin' && (
        <AdminMenu 
          isOpen={openMenu === 'admin'} 
          onToggle={() => setOpenMenu(openMenu === 'admin' ? null : 'admin')} 
          currentScreen={currentScreen} 
          onSelectScreen={handleNavigateScreen} 
          onLogout={handleLogout} 
        />
      )}

      <div className="flex-1 flex flex-col w-full min-w-0">
        <Header 
          onToggleSidebar={handleToggleSidebar} 
          currentScreen={currentScreen} 
          onSelectScreen={handleNavigateScreen} 
          currentRole={isAuthenticated ? currentRole : 'client'} 
          isAuthenticated={isAuthenticated}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          isMobileFrame={isMobileFrame} 
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)} 
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 relative min-w-0 pb-24 lg:pb-12">
          {isMobileFrame ? (
            <div className="w-full max-w-[390px] h-[calc(100dvh-6rem)] max-h-[844px] bg-slate-950 border-[6px] sm:border-[10px] border-slate-800 rounded-[36px] sm:rounded-[50px] shadow-2xl overflow-hidden flex flex-col relative mx-auto my-2 sm:my-4">
              <div className="flex-1 overflow-y-auto pt-6 pb-24 px-3 sm:px-4 relative">
                <ScreenComponent />
                <FloatingChatWidget 
                  isOpen={isChatOpen} 
                  onClose={() => setIsChatOpen(false)} 
                  onToggleChat={handleToggleChat} 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                  onNavigateBooking={() => { setEditingAppointment(null); setCurrentScreen('booking'); }} 
                  currentScreen={currentScreen} 
                  currentRole={isAuthenticated ? currentRole : 'client'} 
                  appointments={appointments} 
                />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto min-w-0">
              <ScreenComponent />
              <FloatingChatWidget 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                onToggleChat={handleToggleChat} 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                onNavigateBooking={() => { setEditingAppointment(null); setCurrentScreen('booking'); }} 
                currentScreen={currentScreen} 
                currentRole={isAuthenticated ? currentRole : 'client'} 
                appointments={appointments} 
              />
            </div>
          )}
        </main>

        <MobileNav 
          currentScreen={currentScreen} 
          onSelectScreen={handleNavigateScreen} 
          onToggleChat={handleToggleChat} 
        />
      </div>

      <MediaCustomizerModal 
        isOpen={mediaModal.isOpen} 
        onClose={() => setMediaModal(prev => ({ ...prev, isOpen: false }))} 
        title={mediaModal.title} 
        currentMediaUrl={mediaModal.url} 
        mediaType={mediaModal.type} 
        onSave={handleSaveMedia} 
        onDelete={handleDeleteMedia} 
      />

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} 
        initialMode={authModal.mode} 
        onLoginSuccess={handleLoginSuccess} 
      />
    </div>
  );
}
