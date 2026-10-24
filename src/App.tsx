import React, { useState, useEffect } from 'react';
import { PublicMenu } from './components/PublicMenu';
import { ClientMenu } from './components/ClientMenu';
import { ProfessionalMenu } from './components/ProfessionalMenu';
import { AdminMenu } from './components/AdminMenu';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { MediaCustomizerModal } from './components/MediaCustomizerModal';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { MediaItem } from './components/MediaCarousel';

import { HomeScreen } from './screens/HomeScreen';
import { ClientScreen } from './screens/ClientScreen';
import { ProfessionalScreen } from './screens/ProfessionalScreen';
import { AdminScreen } from './screens/AdminScreen';
import { BookingScreen } from './screens/BookingScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { ChatScreen } from './screens/ChatScreen';
import { GalleryScreen } from './screens/GalleryScreen';

import { ScreenId, UserRole, Service, Stylist, Product, Appointment, ChatMessage, PaymentSettings } from './types';
import { INITIAL_SERVICES, INITIAL_STYLISTS, INITIAL_PRODUCTS, INITIAL_APPOINTMENTS, INITIAL_MESSAGES } from './data/mockData';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<'public' | 'client' | 'professional' | 'admin' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const handleToggleChat = () => setIsChatOpen(!isChatOpen);

  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>(INITIAL_STYLISTS);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [bannerMedia, setBannerMedia] = useState<{ url: string; type: 'image' | 'video' }>( { url: '/src/assets/images/salon_hero_banner_1792861532508.jpg', type: 'image' });
  const [homeCarouselItems, setHomeCarouselItems] = useState<MediaItem[]>([]);
  const [productCarouselItems, setProductCarouselItems] = useState<MediaItem[]>([]);
  const [mediaModal, setMediaModal] = useState<{isOpen: boolean, title: string, url: string, type: 'image' | 'video', targetType: 'banner' | 'product_carousel' | 'product' | 'stylist' | 'client', targetId?: string}>({isOpen: false, title: '', url: '', type: 'image', targetType: 'client'});
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(setServices);
    fetch('/api/products').then(res => res.json()).then(setProducts);
    fetch('/api/banners').then(res => res.json()).then(setBanners);
    fetch('/api/appointments', { headers: { 'x-user-role': currentRole } }).then(res => res.json()).then(setAppointments);
    fetch('/api/payment-settings').then(res => res.json()).then(setPaymentSettings);
  }, []);

  const handleNavigateScreen = (screen: ScreenId) => {
    const publicAllowedScreens: ScreenId[] = ['home', 'products', 'booking', 'chat', 'gallery'];
    if (!isAuthenticated && !publicAllowedScreens.includes(screen)) {
      alert("Acesso Restrito: Faça login para acessar esta área.");
      return;
    }
    if (isAuthenticated && currentRole === 'client' && (screen === 'admin' || screen === 'professional')) { alert("Acesso Negado."); return; }
    if (isAuthenticated && currentRole === 'professional' && screen === 'admin') { alert("Acesso Negado."); return; }
    if (screen === 'booking') setEditingAppointment(null);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpenMenu(null);
    setIsChatOpen(false);
  };

  const handleLoginClick = (role: UserRole) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    setOpenMenu(null);
    setCurrentScreen(role === 'professional' ? 'professional' : role === 'admin' ? 'admin' : 'client');
  };

  const handleLogout = () => { setIsAuthenticated(false); setCurrentRole('client'); setCurrentScreen('home'); setOpenMenu(null); };

  const handleOpenMediaCustomizer = (title: string, url: string, type: 'image' | 'video', targetType: 'banner' | 'product_carousel' | 'product' | 'stylist' | 'client', targetId?: string) => {
    if (!isAuthenticated || (currentRole === 'client' && targetType !== 'client')) { alert("Permissão negada."); return; }
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

  const handleConfirmBooking = (app: Appointment) => {
    setAppointments(prev => [...prev, app]);
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
      case 'home': return <HomeScreen services={services} stylists={stylists} products={products} bannerMedia={bannerMedia} homeCarouselItems={homeCarouselItems} onNavigate={handleNavigateScreen} onSelectService={(id) => { setSelectedServiceIdForBooking(id); setCurrentScreen('booking'); }} onCustomizeBanner={() => handleOpenMediaCustomizer("Carrossel Inicial", bannerMedia.url, bannerMedia.type, 'banner')} onCustomizeStylist={(id, name, avatar) => handleOpenMediaCustomizer(`Foto de ${name}`, avatar, 'image', 'stylist', id)} />;
      case 'client': return <ClientScreen appointments={appointments} stylists={stylists} onCancelAppointment={handleCancelAppointment} onEditAppointment={handleEditAppointment} onNewBooking={() => { setEditingAppointment(null); setCurrentScreen('booking'); }} />;
      case 'professional': return <ProfessionalScreen appointments={appointments} stylists={stylists} onUpdateStatus={handleUpdateStylistStatus} onCustomizeAvatar={(id, name, avatar) => handleOpenMediaCustomizer(`Foto de ${name}`, avatar, 'image', 'stylist', id)} />;
      case 'admin': return currentRole === 'admin' ? <AdminScreen services={services} products={products} banners={banners} stylists={stylists} onAddService={handleAddService} onDeleteService={handleDeleteService} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onAddBanner={handleAddBanner} onDeleteBanner={handleDeleteBanner} onCustomizeStylist={(id, name, avatar) => handleOpenMediaCustomizer(`Perfil de ${name}`, avatar, 'image', 'stylist', id)} currentRole={currentRole} paymentSettings={paymentSettings} onUpdatePaymentSettings={async (newSettings) => { await fetch('/api/payment-settings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole }, body: JSON.stringify(newSettings) }); setPaymentSettings(newSettings); }} /> : <div className="p-12 text-center">Acesso Negado</div>;
      case 'booking': return <BookingScreen services={services} stylists={stylists} appointments={appointments} selectedServiceId={selectedServiceIdForBooking} editingAppointment={editingAppointment} onConfirmBooking={handleConfirmBooking} onUpdateAppointment={handleUpdateAppointment} onComplete={() => setCurrentScreen('client')} paymentSettings={paymentSettings} />;
      case 'gallery': return <GalleryScreen onNavigateBooking={() => setCurrentScreen('booking')} />;
      case 'products': return <ProductsScreen products={products} productCarouselItems={productCarouselItems} onCustomizeProduct={(id, name, img) => handleOpenMediaCustomizer(`Produto: ${name}`, img, 'image', 'product', id)} onCustomizeProductCarousel={() => handleOpenMediaCustomizer("Carrossel de Produtos", productCarouselItems[0]?.url || '', 'image', 'product_carousel')} />;
      case 'chat': return <ChatScreen messages={messages} onSendMessage={handleSendMessage} />;
      default: return <div />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {!isAuthenticated ? <PublicMenu isOpen={openMenu === 'public'} onToggle={() => setOpenMenu(openMenu === 'public' ? null : 'public')} onSelectScreen={handleNavigateScreen} onLoginClick={handleLoginClick} /> : null}
      {isAuthenticated && currentRole === 'client' && <ClientMenu isOpen={openMenu === 'client'} onToggle={() => setOpenMenu(openMenu === 'client' ? null : 'client')} currentScreen={currentScreen} onSelectScreen={handleNavigateScreen} onLogout={handleLogout} />}
      {isAuthenticated && currentRole === 'professional' && <ProfessionalMenu isOpen={openMenu === 'professional'} onToggle={() => setOpenMenu(openMenu === 'professional' ? null : 'professional')} currentScreen={currentScreen} onSelectScreen={handleNavigateScreen} onLogout={handleLogout} />}
      {isAuthenticated && currentRole === 'admin' && <AdminMenu isOpen={openMenu === 'admin'} onToggle={() => setOpenMenu(openMenu === 'admin' ? null : 'admin')} currentScreen={currentScreen} onSelectScreen={handleNavigateScreen} onLogout={handleLogout} />}

      <div className="flex-1 flex flex-col pl-16 sm:pl-20">
        <Header onToggleSidebar={() => {}} currentScreen={currentScreen} onSelectScreen={handleNavigateScreen} currentRole={isAuthenticated ? currentRole : 'client'} isMobileFrame={isMobileFrame} onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)} />
        <main className="flex-1 p-4 lg:p-8 relative">
          {isMobileFrame ? (
            <div className="w-[390px] h-[844px] bg-slate-950 border-[10px] border-slate-800 rounded-[50px] shadow-2xl overflow-hidden flex flex-col relative mx-auto my-4">
              <div className="flex-1 overflow-y-auto pt-8 pb-24 px-4 relative"><ScreenComponent /><FloatingChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onToggleChat={handleToggleChat} messages={messages} onSendMessage={handleSendMessage} onNavigateBooking={() => { setEditingAppointment(null); setCurrentScreen('booking'); }} currentScreen={currentScreen} currentRole={isAuthenticated ? currentRole : 'client'} appointments={appointments} /></div>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto"><ScreenComponent /><FloatingChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onToggleChat={handleToggleChat} messages={messages} onSendMessage={handleSendMessage} onNavigateBooking={() => { setEditingAppointment(null); setCurrentScreen('booking'); }} currentScreen={currentScreen} currentRole={isAuthenticated ? currentRole : 'client'} appointments={appointments} /></div>
          )}
        </main>
        <MobileNav currentScreen={currentScreen} onSelectScreen={handleNavigateScreen} onToggleChat={handleToggleChat} />
      </div>
      <MediaCustomizerModal isOpen={mediaModal.isOpen} onClose={() => setMediaModal(prev => ({ ...prev, isOpen: false }))} title={mediaModal.title} currentMediaUrl={mediaModal.url} mediaType={mediaModal.type} onSave={handleSaveMedia} onDelete={handleDeleteMedia} />
    </div>
  );
}
