import React, { useState } from 'react';
import { ShoppingBag, Star, Plus, Minus, CheckCircle2, X, Camera } from 'lucide-react';
import { Product, CartItem } from '../types';
import { MediaCarousel, MediaItem } from '../components/MediaCarousel';

interface ProductsScreenProps {
  products: Product[];
  onCustomizeProduct: (id: string, name: string, image: string) => void;
  productCarouselItems: MediaItem[];
  onCustomizeProductCarousel: () => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  products,
  onCustomizeProduct,
  productCarouselItems,
  onCustomizeProductCarousel,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const totalCartPrice = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleCheckout = () => {
    setCheckoutComplete(true);
    setCart([]);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Products Area Carousel (Carrossel da Área Produtos) */}
      <section className="relative">
        <MediaCarousel 
          items={productCarouselItems.length > 0 ? productCarouselItems : [
            { id: 'p-1', url: products[0]?.image || '/src/assets/images/product_shampoo_1792861533691.jpg', type: 'image', title: "Linha Exclusiva L'Élite Home Care" },
            { id: 'p-2', url: '/src/assets/images/product_shampoo_1792861533691.jpg', type: 'image', title: "Óleos Essenciais & Tratamentos Nutritivos" }
          ]}
          heightClass="h-64 sm:h-80"
          onCustomize={onCustomizeProductCarousel}
          showCustomizeButton={true}
          customizeButtonLabel="Gerenciar Carrossel de Produtos"
        />
      </section>

      {/* Vitrine Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            E-commerce L'Élite
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Vitrine de Produtos Profissionais</h1>
          <p className="text-xs text-slate-400">Leve o tratamento de salão para o seu home care diário com fórmulas exclusivas.</p>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Carrinho ({totalItemsCount})</span>
          {totalItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-950 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500 flex items-center justify-center">
              {totalItemsCount}
            </span>
          )}
        </button>
      </div>

      {/* Products Grid with Customizer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all">
            <div className="h-52 relative overflow-hidden bg-slate-950">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-bold text-amber-400 uppercase border border-slate-800">
                {product.category}
              </div>

              {/* Customize Product Image Button */}
              <button
                onClick={() => onCustomizeProduct(product.id, product.name, product.image)}
                className="absolute top-3 right-3 w-8 h-8 bg-slate-900/90 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                title="Personalizar Imagem do Produto"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{product.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-base font-bold text-white">R$ {product.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${product.inStock ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                  {product.inStock ? 'Comprar' : 'Esgotado'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-white text-lg">Seu Carrinho</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {checkoutComplete ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Pedido Realizado!</h3>
                  <p className="text-xs text-slate-400">Obrigado por sua compra. Seus produtos serão preparados para retirada ou entrega.</p>
                  <button
                    onClick={() => {
                      setCheckoutComplete(false);
                      setIsCartOpen(false);
                    }}
                    className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Continuar Comprando
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-20 text-slate-500 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto opacity-40" />
                  <p className="text-sm">Seu carrinho está vazio.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-xs line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-1">R$ {item.product.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {!checkoutComplete && cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Total do Carrinho:</span>
                  <span className="font-bold text-white text-lg">R$ {totalCartPrice.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Finalizar Compra</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
