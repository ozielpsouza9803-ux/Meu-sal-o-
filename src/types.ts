export type UserRole = 'client' | 'professional' | 'admin';

export type ScreenId = 'home' | 'client' | 'professional' | 'admin' | 'booking' | 'products' | 'chat' | 'gallery';

export interface Service {
  id: string;
  name: string;
  category: 'cabelo' | 'barba' | 'tratamento' | 'coloracao' | 'estetica';
  price: number;
  durationMinutes: number;
  description: string;
  image: string;
  popular?: boolean;
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  status: 'disponível' | 'em atendimento' | 'pausa';
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  stylistId: string;
  stylistName: string;
  clientName: string;
  date: string;
  time: string;
  price: number;
  status: 'confirmado' | 'concluído' | 'cancelado';
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'stylist';
  text: string;
  timestamp: string;
}
