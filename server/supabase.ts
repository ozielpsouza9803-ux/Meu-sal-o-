import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Server-side only environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_SERVICE_KEY && 
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (isSupabaseConfigured) {
  console.log('[Supabase] Conexão configurada com sucesso para:', SUPABASE_URL);
} else {
  console.log('[Supabase] Variáveis SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas. Servidor operando com cache resiliente em memória.');
}

// Data models for the database
export interface DbUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'client' | 'professional' | 'admin';
  stylist_id?: string;
  password_hash: string;
  salt: string;
  created_at?: string;
}

export interface DbService {
  id: string;
  name: string;
  category: 'cabelo' | 'barba' | 'tratamento' | 'coloracao' | 'estetica';
  price: number;
  duration_minutes: number;
  description: string;
  image: string;
  popular?: boolean;
}

export interface DbStylist {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviews_count: number;
  specialties: string[];
  status: 'disponível' | 'em atendimento' | 'pausa';
}

export interface DbProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  in_stock: boolean;
}

export interface DbAppointment {
  id: string;
  service_id: string;
  service_name: string;
  stylist_id: string;
  stylist_name: string;
  client_id?: string;
  client_email?: string;
  client_name: string;
  date: string;
  time: string;
  price: number;
  status: 'confirmado' | 'concluído' | 'cancelado';
  notes?: string;
  created_at?: string;
}

export interface DbPaymentSettings {
  id?: number;
  pix_enabled: boolean;
  pix_key: string;
  pix_recipient: string;
  card_manual_enabled: boolean;
  deposit_required: boolean;
  deposit_type: 'fixed' | 'percentage';
  deposit_value: number;
}

export interface DbBanner {
  id: string;
  url: string;
  type: 'image' | 'video';
  active: boolean;
}

// ============================================================================
// AUTOMATIC SEED: Popula o banco Supabase na primeira conexão caso esteja vazio
// ============================================================================
export async function seedSupabaseIfNeeded(
  defaultUsers: any[],
  defaultServices: any[],
  defaultStylists: any[],
  defaultProducts: any[],
  defaultBanners: any[],
  defaultPayment: any,
  defaultAppointments: any[]
) {
  if (!supabase) return;

  try {
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (error) {
      console.warn('[Supabase Seed] Aviso ao verificar tabela users:', error.message);
      return;
    }

    if (count === 0) {
      console.log('[Supabase Seed] Banco Supabase vazio detectado. Populando dados iniciais com segurança...');

      // 1. Users
      const mappedUsers = defaultUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        phone: u.phone,
        role: u.role,
        stylist_id: u.stylistId,
        password_hash: u.passwordHash,
        salt: u.salt,
      }));
      await supabase.from('users').upsert(mappedUsers);

      // 2. Stylists
      const mappedStylists = defaultStylists.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        avatar: s.avatar,
        rating: s.rating,
        reviews_count: s.reviewsCount,
        specialties: s.specialties,
        status: s.status,
      }));
      await supabase.from('stylists').upsert(mappedStylists);

      // 3. Services
      const mappedServices = defaultServices.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        price: s.price,
        duration_minutes: s.durationMinutes,
        description: s.description,
        image: s.image,
        popular: s.popular || false,
      }));
      await supabase.from('services').upsert(mappedServices);

      // 4. Products
      const mappedProducts = defaultProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        rating: p.rating,
        image: p.image,
        description: p.description,
        in_stock: p.inStock,
      }));
      await supabase.from('products').upsert(mappedProducts);

      // 5. Payment Settings
      await supabase.from('payment_settings').upsert([{
        id: 1,
        pix_enabled: defaultPayment.pixEnabled,
        pix_key: defaultPayment.pixKey,
        pix_recipient: defaultPayment.pixRecipient,
        card_manual_enabled: defaultPayment.cardManualEnabled,
        deposit_required: defaultPayment.depositRequired,
        deposit_type: defaultPayment.depositType,
        deposit_value: defaultPayment.depositValue,
      }]);

      // 6. Banners
      await supabase.from('banners').upsert(defaultBanners);

      // 7. Appointments
      const mappedAppointments = defaultAppointments.map(a => ({
        id: a.id,
        service_id: a.serviceId,
        service_name: a.serviceName,
        stylist_id: a.stylistId,
        stylist_name: a.stylistName,
        client_id: a.clientId,
        client_email: a.clientEmail,
        client_name: a.clientName,
        date: a.date,
        time: a.time,
        price: a.price,
        status: a.status,
        notes: a.notes,
      }));
      await supabase.from('appointments').upsert(mappedAppointments);

      console.log('[Supabase Seed] Carga inicial concluída com sucesso!');
    }
  } catch (err: any) {
    console.error('[Supabase Seed] Erro ao sincronizar seed inicial:', err?.message || err);
  }
}
