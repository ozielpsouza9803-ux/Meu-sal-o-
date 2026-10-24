import React, { useState } from 'react';
import { ShieldCheck, DollarSign, Users, Scissors, TrendingUp, Plus, Edit2, Trash2, Camera, Image as ImageIcon } from 'lucide-react';
import { Service, Stylist, Product, Banner, PaymentSettings } from '../types';

interface AdminScreenProps {
  services: Service[];
  products: Product[];
  banners: Banner[];
  stylists: Stylist[];
  onAddService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddBanner: (banner: Banner) => void;
  onDeleteBanner: (id: string) => void;
  onCustomizeStylist: (id: string, name: string, avatar: string) => void;
  currentRole: string;
  paymentSettings: PaymentSettings | null;
  onUpdatePaymentSettings: (settings: PaymentSettings) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  services,
  products,
  banners,
  stylists,
  onAddService,
  onDeleteService,
  onAddProduct,
  onDeleteProduct,
  onAddBanner,
  onDeleteBanner,
  onCustomizeStylist,
  currentRole,
  paymentSettings,
  onUpdatePaymentSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'services' | 'staff' | 'analytics' | 'banners' | 'products' | 'payments'>('financial');
  
  // ... (keeping existing handlers, adding new handlers)
  
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify({ name: 'Novo Produto', price: 0, category: 'Geral', description: '', image: '' }),
    });
    if (response.ok) {
      const addedProduct = await response.json();
      onAddProduct(addedProduct);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': currentRole },
    });
    if (response.ok) onDeleteProduct(id);
  };
  
  const handleCreateBanner = async () => {
    const response = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': currentRole },
      body: JSON.stringify({ url: '/src/assets/images/placeholder.jpg', type: 'image' }),
    });
    if (response.ok) {
      const addedBanner = await response.json();
      onAddBanner(addedBanner);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    const response = await fetch(`/api/banners/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': currentRole },
    });
    if (response.ok) onDeleteBanner(id);
  };

  // ... (rest of the component)
  return (
    <div className="space-y-8 pb-20">
      {/* ... */}
      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab('financial')} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'financial' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Visão Financeira</button>
        <button onClick={() => setActiveTab('services')} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Catálogo & Preços</button>
        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Vitrine de Produtos</button>
        <button onClick={() => setActiveTab('staff')} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'staff' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Equipe</button>
        <button onClick={() => setActiveTab('banners')} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'banners' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Banners</button>
        <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Pagamentos</button>
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white bg-slate-900'}`}>Indicadores</button>
      </div>

      {/* Render tabs content based on activeTab */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <button onClick={handleCreateBanner} className="px-5 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2"><Plus className="w-4 h-4"/>Adicionar Banner</button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <ImageIcon className="w-10 h-10 text-slate-400" />
                <button onClick={() => handleDeleteBanner(banner.id)} className="text-red-400"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <button onClick={handleCreateProduct} className="px-5 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2"><Plus className="w-4 h-4"/>Adicionar Produto</button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-base">{product.name}</h3>
                  <p className="text-xs text-slate-400">R$ {product.price.toFixed(2)}</p>
                </div>
                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ... keep rest of the tabs ... */}
    </div>
  );
};
