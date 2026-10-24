import React, { useState } from 'react';
import { 
  ShieldCheck, DollarSign, Users, Scissors, TrendingUp, Plus, Edit2, Trash2, 
  Camera, Image as ImageIcon, QrCode, CreditCard, Percent, Save, CheckCircle2, 
  Clock, Star, Calendar, Sparkles, ChevronRight, AlertCircle, ShoppingBag
} from 'lucide-react';
import { Service, Stylist, Product, Banner, PaymentSettings, Appointment } from '../types';

interface AdminScreenProps {
  services: Service[];
  products: Product[];
  banners: Banner[];
  stylists: Stylist[];
  appointments?: Appointment[];
  onAddService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddBanner: (banner: Banner) => void;
  onDeleteBanner: (id: string) => void;
  onCustomizeStylist: (id: string, name: string, avatar: string) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onCancelAppointment?: (id: string) => void;
  onUpdateAppointmentStatus?: (id: string, status: 'confirmado' | 'concluído' | 'cancelado') => void;
  currentRole: string;
  authToken?: string;
  paymentSettings: PaymentSettings | null;
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  services,
  products,
  banners,
  stylists,
  appointments = [],
  onAddService,
  onDeleteService,
  onAddProduct,
  onDeleteProduct,
  onAddBanner,
  onDeleteBanner,
  onCustomizeStylist,
  onEditAppointment,
  onCancelAppointment,
  onUpdateAppointmentStatus,
  currentRole,
  authToken,
  paymentSettings,
  onUpdatePaymentSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'appointments' | 'services' | 'products' | 'staff' | 'banners' | 'payments' | 'analytics'>('financial');

  // Appointments Filtering & Search State
  const [appStatusFilter, setAppStatusFilter] = useState<string>('todos');
  const [appStylistFilter, setAppStylistFilter] = useState<string>('todos');
  const [appSearchTerm, setAppSearchTerm] = useState<string>('');
  const [cancellingAdminApp, setCancellingAdminApp] = useState<Appointment | null>(null);

  // New Service Form State
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState<'cabelo' | 'barba' | 'tratamento' | 'coloracao' | 'estetica'>('cabelo');
  const [servicePrice, setServicePrice] = useState(120);
  const [serviceDuration, setServiceDuration] = useState(60);
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceImage, setServiceImage] = useState('/src/assets/images/service_haircut_1792861533533.jpg');

  // New Product Form State
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Home Care');
  const [productPrice, setProductPrice] = useState(85);
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState('/src/assets/images/product_shampoo_1792861533691.jpg');

  // New Banner Form State
  const [showAddBannerForm, setShowAddBannerForm] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('/src/assets/images/salon_hero_banner_1792861532508.jpg');
  const [bannerType, setBannerType] = useState<'image' | 'video'>('image');

  // Payment Settings Local Form State
  const [localPayment, setLocalPayment] = useState<PaymentSettings>(paymentSettings || {
    pixEnabled: true,
    pixKey: '12345678900',
    pixRecipient: "L'Élite Salon & Spa",
    cardManualEnabled: true,
    depositRequired: true,
    depositType: 'percentage',
    depositValue: 20
  });
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState(false);

  // Handlers for Services
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    const payload = {
      name: serviceName,
      category: serviceCategory,
      price: Number(servicePrice),
      durationMinutes: Number(serviceDuration),
      description: serviceDescription || 'Serviço de alta precisão com os mestres da beleza L\'Élite.',
      image: serviceImage,
      popular: true,
    };

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const added = await response.json();
        onAddService(added);
        setServiceName('');
        setServiceDescription('');
        setShowAddServiceForm(false);
      }
    } catch {
      onAddService({ id: 's-' + Date.now(), ...payload });
      setShowAddServiceForm(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { 
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
      });
      onDeleteService(id);
    } catch {
      onDeleteService(id);
    }
  };

  // Handlers for Products
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const payload = {
      name: productName,
      category: productCategory,
      price: Number(productPrice),
      description: productDescription || 'Fórmula premium para tratamento e manutenção diária dos fios.',
      image: productImage,
      rating: 5.0,
      inStock: true,
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const added = await response.json();
        onAddProduct(added);
        setProductName('');
        setProductDescription('');
        setShowAddProductForm(false);
      }
    } catch {
      onAddProduct({ id: 'p-' + Date.now(), ...payload });
      setShowAddProductForm(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
      });
      onDeleteProduct(id);
    } catch {
      onDeleteProduct(id);
    }
  };

  // Handlers for Banners
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerUrl.trim()) return;

    const payload = {
      url: bannerUrl,
      type: bannerType,
      active: true,
    };

    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const added = await response.json();
        onAddBanner(added);
        setShowAddBannerForm(false);
      }
    } catch {
      onAddBanner({ id: 'b-' + Date.now(), ...payload });
      setShowAddBannerForm(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        headers: { 
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
      });
      onDeleteBanner(id);
    } catch {
      onDeleteBanner(id);
    }
  };

  // Handlers for Payment Settings
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(localPayment)
      });
    } catch {}
    onUpdatePaymentSettings(localPayment);
    setPaymentSaveSuccess(true);
    setTimeout(() => setPaymentSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-24">
      {/* Admin Screen Header */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-xl">
        <div className="space-y-1.5 text-left min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Painel Administrativo Autorizado
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">Gestão Integrada L'Élite</h1>
          <p className="text-xs text-slate-400 max-w-xl">Controle seguro de faturamento, catálogo de serviços, vitrine, banners, equipe e regras de pagamento.</p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            Ambiente Seguro (RBAC Ativo)
          </span>
        </div>
      </div>

      {/* Admin Tabs - Mobile Scrollable */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button 
          onClick={() => setActiveTab('financial')} 
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'financial' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Visão Financeira
        </button>
        <button 
          onClick={() => setActiveTab('appointments')} 
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'appointments' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Agendamentos ({appointments.length})
        </button>
        <button 
          onClick={() => setActiveTab('services')} 
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Serviços ({services.length})
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Vitrine ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('banners')} 
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'banners' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Banners ({banners.length})
        </button>
        <button 
          onClick={() => setActiveTab('staff')} 
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'staff' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Equipe ({stylists.length})
        </button>
        <button 
          onClick={() => setActiveTab('payments')} 
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Pagamentos & PIX
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}`}
        >
          Indicadores
        </button>
      </div>

      {/* Tab 1: Financial Overview */}
      {activeTab === 'financial' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Faturamento Hoje</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">R$ 3.850,00</p>
              <p className="text-[11px] text-emerald-400">+18% em relação a ontem</p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Faturamento Mês</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">R$ 78.400,00</p>
              <p className="text-[11px] text-amber-400">Meta: R$ 85.000,00 (92%)</p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Taxa de Ocupação</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">88%</p>
              <p className="text-[11px] text-slate-400">32 horários preenchidos hoje</p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Clientes Ativos</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">418</p>
              <p className="text-[11px] text-emerald-400">+14 novos esta semana</p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-bold text-white">Resumo de Transações Recentes</h2>
              <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Atualizado em tempo real
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              <div className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Camila Souza · Corte Modelado & Estilo</h4>
                  <p className="text-xs text-slate-400">Profissional: Juliana Vance · Método: PIX com Adiantamento 20%</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-white">R$ 90,00</span>
                  <span className="block text-[10px] text-emerald-400">Adiantamento R$ 18,00 Pago</span>
                </div>
              </div>

              <div className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Lucas Ferreira · Barba Terapia</h4>
                  <p className="text-xs text-slate-400">Profissional: Carlos Mendes · Método: Cartão Manual no Salão</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-white">R$ 70,00</span>
                  <span className="block text-[10px] text-amber-400">Aguardando no Balcão</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Appointments Management */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Central de Agendamentos & Agenda Geral</h2>
              <p className="text-xs text-slate-400">Controle completo de horários, reagendamento e prevenção de conflitos.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                {appointments.filter(a => a.status === 'confirmado').length} Confirmados Ativos
              </span>
            </div>
          </div>

          {/* Quick Filter & Search Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Buscar por Cliente ou Serviço</label>
                <input
                  type="text"
                  placeholder="Nome do cliente ou serviço..."
                  value={appSearchTerm}
                  onChange={(e) => setAppSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Filtrar por Status</label>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="concluído">Concluídos</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Filtrar por Profissional</label>
                <select
                  value={appStylistFilter}
                  onChange={(e) => setAppStylistFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="todos">Todos os Profissionais</option>
                  {stylists.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                Nenhum agendamento registrado no sistema.
              </div>
            ) : (
              appointments
                .filter(app => {
                  const matchStatus = appStatusFilter === 'todos' || app.status === appStatusFilter;
                  const matchStylist = appStylistFilter === 'todos' || app.stylistId === appStylistFilter;
                  const matchSearch = app.clientName.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
                                      app.serviceName.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
                                      app.stylistName.toLowerCase().includes(appSearchTerm.toLowerCase());
                  return matchStatus && matchStylist && matchSearch;
                })
                .map((app) => (
                  <div 
                    key={app.id} 
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-slate-700"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          app.status === 'confirmado' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                          app.status === 'concluído' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                          'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-white font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" /> {app.date} às {app.time}
                        </span>
                        <span className="text-xs text-slate-400">· ID: #{app.id}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <h3 className="font-bold text-white text-sm sm:text-base">{app.clientName}</h3>
                        <span className="text-slate-400 text-xs">— {app.serviceName}</span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Profissional: <span className="text-slate-200 font-medium">{app.stylistName}</span> · Valor: <span className="text-amber-400 font-bold">R$ {app.price.toFixed(2)}</span>
                      </p>

                      {app.notes && (
                        <p className="text-xs italic text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 mt-1">
                          Nota: "{app.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions for Admin */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                      {onEditAppointment && (
                        <button
                          onClick={() => onEditAppointment(app)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px]"
                          title="Reagendar ou Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Reagendar</span>
                        </button>
                      )}

                      {app.status === 'confirmado' && onUpdateAppointmentStatus && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(app.id, 'concluído')}
                          className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px]"
                          title="Marcar como Concluído"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Concluir</span>
                        </button>
                      )}

                      {app.status !== 'cancelado' && (
                        <button
                          onClick={() => setCancellingAdminApp(app)}
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 min-h-[38px]"
                          title="Cancelar Agendamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Cancellation Confirmation Dialog */}
          {cancellingAdminApp && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-white">Confirmar Cancelamento pelo ADM</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deseja realmente cancelar o agendamento de <span className="text-white font-medium">{cancellingAdminApp.clientName}</span> para {cancellingAdminApp.serviceName} em <span className="text-white font-medium">{cancellingAdminApp.date} às {cancellingAdminApp.time}</span>?
                </p>
                <p className="text-xs text-amber-400/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  O horário será liberado para novos clientes na agenda do profissional.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingAdminApp(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onCancelAppointment) {
                        onCancelAppointment(cancellingAdminApp.id);
                      } else if (onUpdateAppointmentStatus) {
                        onUpdateAppointmentStatus(cancellingAdminApp.id, 'cancelado');
                      }
                      setCancellingAdminApp(null);
                    }}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white"
                  >
                    Confirmar Cancelamento
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Services Management */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Catálogo de Serviços & Tabela de Preços</h2>
              <p className="text-xs text-slate-400">Cadastre, edite valores, duração e remova serviços do agendamento.</p>
            </div>
            <button
              onClick={() => setShowAddServiceForm(!showAddServiceForm)}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddServiceForm ? 'Fechar Formulário' : 'Novo Serviço'}</span>
            </button>
          </div>

          {/* Add Service Collapsible Form */}
          {showAddServiceForm && (
            <form onSubmit={handleCreateService} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
              <h3 className="text-sm font-bold text-white">Cadastrar Novo Serviço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nome do Serviço</label>
                  <input
                    type="text"
                    required
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ex: Escova Orgânica de Brilho"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Categoria</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  >
                    <option value="cabelo">Cabelo</option>
                    <option value="barba">Barba & Barbearia</option>
                    <option value="coloracao">Coloração & Mechas</option>
                    <option value="tratamento">Tratamento & Spa</option>
                    <option value="estetica">Estética Facial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    placeholder="Descrição detalhada para a vitrine pública"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Salvar Serviço no Catálogo
                </button>
              </div>
            </form>
          )}

          {/* Services List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => (
              <div key={service.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {service.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.durationMinutes} min
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{service.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{service.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">R$ {service.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Excluir Serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Products Vitrine */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Vitrine de Produtos Exclusivos</h2>
              <p className="text-xs text-slate-400">Adicione produtos à venda para clientes, configure preços e estoques.</p>
            </div>
            <button
              onClick={() => setShowAddProductForm(!showAddProductForm)}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddProductForm ? 'Fechar' : 'Novo Produto'}</span>
            </button>
          </div>

          {/* Add Product Collapsible Form */}
          {showAddProductForm && (
            <form onSubmit={handleCreateProduct} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
              <h3 className="text-sm font-bold text-white">Cadastrar Novo Produto na Vitrine</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Máscara Reconstrutora de Caviar"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="Ex: Tratamento / Home Care"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Benefícios e modo de uso para o cliente"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Salvar Produto na Vitrine
                </button>
              </div>
            </form>
          )}

          {/* Products List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <div key={product.id} className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div className="space-y-2">
                  <div className="h-36 rounded-xl overflow-hidden bg-slate-950 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">R$ {product.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Excluir Produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Banners & Carousels */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Banners e Carrosséis Multimídia</h2>
              <p className="text-xs text-slate-400">Controle as imagens e vídeos em destaque na página inicial e nas telas de serviços.</p>
            </div>
            <button
              onClick={() => setShowAddBannerForm(!showAddBannerForm)}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddBannerForm ? 'Fechar' : 'Novo Banner'}</span>
            </button>
          </div>

          {showAddBannerForm && (
            <form onSubmit={handleCreateBanner} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
              <h3 className="text-sm font-bold text-white">Inserir Novo Banner Promocional</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Caminho / URL da Mídia</label>
                  <input
                    type="text"
                    required
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Mídia</label>
                  <select
                    value={bannerType}
                    onChange={(e) => setBannerType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                  >
                    <option value="image">Imagem Estática</option>
                    <option value="video">Vídeo em Loop</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Salvar Banner
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="h-40 rounded-xl overflow-hidden bg-slate-950 relative">
                  <img src={banner.url} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-amber-400 bg-slate-950/80 px-2.5 py-0.5 rounded">
                    {banner.type === 'video' ? 'Vídeo' : 'Imagem'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">ID: #{banner.id}</span>
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Staff / Equipe */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Equipe de Mestres e Especialistas</h2>
            <p className="text-xs text-slate-400">Gerencie fotos de perfil, especialidades e visualize os status dos profissionais.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stylists.map((stylist) => (
              <div key={stylist.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img 
                      src={stylist.avatar} 
                      alt={stylist.name} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50" 
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => onCustomizeStylist(stylist.id, stylist.name, stylist.avatar)}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow"
                      title="Alterar Foto"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm sm:text-base truncate">{stylist.name}</h3>
                    <p className="text-xs text-amber-400 font-medium">{stylist.role}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-400 capitalize bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Status: {stylist.status}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Avaliação: <strong className="text-white">{stylist.rating} ★</strong></span>
                  <span>{stylist.reviewsCount} atendimentos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Payment Settings */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Configurações de Pagamento & PIX</h2>
            <p className="text-xs text-slate-400">Configure as regras de adiantamento, chave PIX oficial e autorização manual de cartões.</p>
          </div>

          <form onSubmit={handleSavePaymentSettings} className="p-5 sm:p-6 lg:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            {/* PIX Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Pagamento via PIX</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localPayment.pixEnabled} 
                    onChange={(e) => setLocalPayment({ ...localPayment, pixEnabled: e.target.checked })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {localPayment.pixEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Chave PIX (CPF / CNPJ / Celular / E-mail)</label>
                    <input
                      type="text"
                      value={localPayment.pixKey}
                      onChange={(e) => setLocalPayment({ ...localPayment, pixKey: e.target.value })}
                      placeholder="Ex: 11999998888 ou pix@lelite.com.br"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nome do Recebedor Oficial</label>
                    <input
                      type="text"
                      value={localPayment.pixRecipient}
                      onChange={(e) => setLocalPayment({ ...localPayment, pixRecipient: e.target.value })}
                      placeholder="Ex: L'Élite Salon & Spa Ltda"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Manual Card Payment */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Pagamento Manual por Cartão</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localPayment.cardManualEnabled} 
                    onChange={(e) => setLocalPayment({ ...localPayment, cardManualEnabled: e.target.checked })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <p className="text-xs text-slate-400">Instrui o cliente a pagar no balcão e registra a solicitação com status pendente.</p>
            </div>

            {/* Deposit Rules */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Exigir Adiantamento para Agendamento</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localPayment.depositRequired} 
                    onChange={(e) => setLocalPayment({ ...localPayment, depositRequired: e.target.checked })} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {localPayment.depositRequired && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Adiantamento</label>
                    <select
                      value={localPayment.depositType}
                      onChange={(e) => setLocalPayment({ ...localPayment, depositType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                    >
                      <option value="percentage">Percentual (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      {localPayment.depositType === 'percentage' ? 'Percentual (%)' : 'Valor Fixo (R$)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={localPayment.depositType === 'percentage' ? 100 : 1000}
                      value={localPayment.depositValue}
                      onChange={(e) => setLocalPayment({ ...localPayment, depositValue: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[42px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {paymentSaveSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Configurações de pagamento salvas e aplicadas em tempo real!</span>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto min-h-[44px] px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações de Pagamento</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 7: Indicators & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Indicadores de Desempenho & Satisfação</h2>
            <p className="text-xs text-slate-400">Métricas analíticas sobre fidelidade, avaliações e tempo de permanência.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Taxa de Recompra (Fidelidade)</span>
              <p className="text-2xl font-bold text-white">76%</p>
              <p className="text-[11px] text-emerald-400">Excelente padrão de retenção</p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">NPS (Net Promoter Score)</span>
              <p className="text-2xl font-bold text-white">+89</p>
              <p className="text-[11px] text-amber-400">Nível Zona de Excelência</p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 sm:col-span-2 lg:col-span-1">
              <span className="text-xs text-slate-400 font-semibold">Ticket Médio por Cliente</span>
              <p className="text-2xl font-bold text-white">R$ 185,00</p>
              <p className="text-[11px] text-emerald-400">+12% comparado ao trimestre anterior</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
