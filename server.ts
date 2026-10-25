import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
import { createServer as createViteServer } from 'vite';
import { supabase, isSupabaseConfigured, seedSupabaseIfNeeded } from './server/supabase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cryptographic token secret (server-side only, never leaked)
const JWT_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

// Password Hashing with PBKDF2-SHA512 and per-user unique salt
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = hashPassword(password, salt);
    const computedBuf = Buffer.from(computed, 'hex');
    const hashBuf = Buffer.from(hash, 'hex');
    if (computedBuf.length !== hashBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, hashBuf);
  } catch {
    return false;
  }
}

// Cryptographic Token Generation and Signature Verification (HMAC-SHA256)
interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'professional' | 'admin';
  stylistId?: string;
  phone?: string;
  exp: number;
}

function createToken(payload: Omit<TokenPayload, 'exp'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
  };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(encodedPayload).digest('base64url');
    
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'client' | 'professional' | 'admin';
  stylistId?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface AuthRequest extends Request {
  user?: TokenPayload;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize secure users store
  // 1. Administrator Account: preserves the exact provisional credentials (username 'admin' or email 'admin@lelite.com.br' with password 'admin123')
  // Now securely hashed with PBKDF2-SHA512 and salt. No plain text, no backdoor.
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminHash = hashPassword('admin123', adminSalt);

  // 2. Initial Professional Accounts: linked to salon stylists st1 and st2
  const pro1Salt = crypto.randomBytes(16).toString('hex');
  const pro1Hash = hashPassword('pro123', pro1Salt);

  const pro2Salt = crypto.randomBytes(16).toString('hex');
  const pro2Hash = hashPassword('pro123', pro2Salt);

  // 3. Initial Client Account: Camila Souza
  const client1Salt = crypto.randomBytes(16).toString('hex');
  const client1Hash = hashPassword('cliente123', client1Salt);

  const registeredUsers: RegisteredUser[] = [
    {
      id: 'usr-admin-1',
      name: 'Administrador Master',
      email: 'admin@lelite.com.br',
      username: 'admin',
      role: 'admin',
      passwordHash: adminHash,
      salt: adminSalt,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-pro-1',
      name: 'Juliana Vance',
      email: 'juliana@lelite.com.br',
      username: 'juliana',
      role: 'professional',
      stylistId: 'st1',
      passwordHash: pro1Hash,
      salt: pro1Salt,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-pro-2',
      name: 'Carlos Mendes',
      email: 'carlos@lelite.com.br',
      username: 'carlos',
      role: 'professional',
      stylistId: 'st2',
      passwordHash: pro2Hash,
      salt: pro2Salt,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-cli-1',
      name: 'Camila Souza',
      email: 'camila@lelite.com.br',
      username: 'camila',
      phone: '(11) 98765-4321',
      role: 'client',
      passwordHash: client1Hash,
      salt: client1Salt,
      createdAt: new Date().toISOString(),
    },
  ];

  // In-memory persistent data store (resilient fallback if Supabase is offline)
  let services = [
    { id: 's1', name: 'Corte Modelado & Estilo (Unissex)', category: 'cabelo', price: 90, durationMinutes: 45, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
    { id: 's2', name: 'Barba Terapia com Toalha Quente', category: 'barba', price: 70, durationMinutes: 30, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
    { id: 's3', name: 'Coloração & Mechas / Balayage', category: 'coloracao', price: 280, durationMinutes: 120, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
  ];

  let stylists = [
    {
      id: 'st1',
      name: 'Juliana Vance',
      role: 'Master Stylist & Colorista',
      avatar: '/src/assets/images/stylist_avatar_1792861532780.jpg',
      rating: 4.9,
      reviewsCount: 142,
      specialties: ['Balayage', 'Cortes Modernos', 'Noivas'],
      status: 'disponível' as const,
    },
    {
      id: 'st2',
      name: 'Carlos Mendes',
      role: 'Barbeiro & Visagista',
      avatar: '/src/assets/images/stylist_avatar_1792861532780.jpg',
      rating: 4.8,
      reviewsCount: 98,
      specialties: ['Barba Terapia', 'Degradê', 'Cabelo Masculino'],
      status: 'disponível' as const,
    },
    {
      id: 'st3',
      name: 'Mariana Costa',
      role: 'Especialista em Tratamentos',
      avatar: '/src/assets/images/stylist_avatar_1792861532780.jpg',
      rating: 5.0,
      reviewsCount: 115,
      specialties: ['Reconstrução Capilar', 'Alisamento Orgânico', 'Penteados'],
      status: 'em atendimento' as const,
    },
  ];

  let appointments: Array<{
    id: string;
    serviceId: string;
    serviceName: string;
    stylistId: string;
    stylistName: string;
    clientId?: string;
    clientEmail?: string;
    clientName: string;
    date: string;
    time: string;
    price: number;
    status: 'confirmado' | 'concluído' | 'cancelado';
    notes?: string;
  }> = [
    { id: 'app-1', serviceId: 's1', serviceName: 'Corte Modelado & Estilo (Unissex)', stylistId: 'st1', stylistName: 'Juliana Vance', clientId: 'usr-cli-1', clientEmail: 'camila@lelite.com.br', clientName: 'Camila Souza', date: '2026-10-25', time: '14:30', price: 90, status: 'confirmado' },
    { id: 'app-2', serviceId: 's2', serviceName: 'Barba Terapia com Toalha Quente', stylistId: 'st2', stylistName: 'Carlos Mendes', clientId: 'usr-cli-2', clientEmail: 'lucas@exemplo.com', clientName: 'Lucas Ferreira', date: '2026-10-25', time: '16:00', price: 70, status: 'confirmado' },
  ];

  let banners = [{ id: 'b1', url: '/src/assets/images/salon_hero_banner_1792861532508.jpg', type: 'image' as const, active: true }];
  let products = [{ id: 'p1', name: 'Shampoo L\'Élite', price: 50, description: 'Shampoo premium para cabelos tratados.', image: '/src/assets/images/product_shampoo_1792861534000.jpg' }];
  let settings = { salonName: 'L\'Élite Salon & Spa', primaryColor: '#b45309' };
  let paymentSettings = {
    pixEnabled: true,
    pixKey: '12345678900',
    pixRecipient: 'L\'Élite Salon & Spa',
    cardManualEnabled: true,
    depositRequired: true,
    depositType: 'percentage' as const,
    depositValue: 20
  };

  // Safe initial seed execution if Supabase is connected
  if (isSupabaseConfigured) {
    seedSupabaseIfNeeded(registeredUsers, services, stylists, products, banners, paymentSettings, appointments);
  }

  // Database Connection Health & Status Endpoint
  app.get('/api/db-status', async (req: Request, res: Response) => {
    let connected = false;
    let errorMsg: string | null = null;
    let counts: any = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { count: usersCount, error: uErr } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (!uErr) {
          connected = true;
          const { count: appCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
          const { count: srvCount } = await supabase.from('services').select('*', { count: 'exact', head: true });
          counts = { users: usersCount, appointments: appCount, services: srvCount };
        } else {
          errorMsg = uErr.message;
        }
      } catch (e: any) {
        errorMsg = e?.message || 'Falha de conexão com Supabase';
      }
    }

    res.json({
      configured: isSupabaseConfigured,
      connected,
      provider: connected ? 'supabase-postgresql' : 'in-memory-fallback',
      url: isSupabaseConfigured ? process.env.SUPABASE_URL : null,
      counts,
      error: errorMsg,
    });
  });

  // Cryptographic Authentication Middlewares
  const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso não autorizado: token de autenticação ausente.' });
    }

    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada. Por favor, autentique-se novamente.' });
    }

    req.user = payload;
    next();
  };

  const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const payload = verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    }
    next();
  };

  const requireRole = (allowedRoles: ('client' | 'professional' | 'admin')[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Autenticação necessária.' });
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: `Acesso negado: permissões insuficientes para a função ${req.user.role}.` });
      }
      next();
    };
  };

  // --- AUTHENTICATION ROUTES ---

  // 1. Login endpoint with Supabase consultation and PBKDF2 verification
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, username, login, password, role } = req.body;
    const identifier = (email || username || login || '').trim().toLowerCase();

    if (!identifier) {
      return res.status(400).json({ error: 'Informe seu usuário ou e-mail de acesso.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Informe a senha de acesso.' });
    }

    // Try Supabase first if available
    if (supabase) {
      try {
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('*')
          .or(`email.ilike.${identifier},username.ilike.${identifier}`)
          .maybeSingle();

        if (!error && dbUser) {
          if (!verifyPassword(password, dbUser.password_hash, dbUser.salt)) {
            return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu login e senha.' });
          }

          if (role === 'admin' && dbUser.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado: Esta conta não possui privilégios de Administrador.' });
          }
          if (role === 'professional' && dbUser.role !== 'professional') {
            return res.status(403).json({ error: 'Acesso negado: Esta conta não possui credenciais de Profissional.' });
          }

          const token = createToken({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            stylistId: dbUser.stylist_id,
            phone: dbUser.phone,
          });

          return res.json({
            success: true,
            token,
            role: dbUser.role,
            user: {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role,
              stylistId: dbUser.stylist_id,
              phone: dbUser.phone,
            },
          });
        }
      } catch (err) {
        console.warn('[Supabase Auth Fallback to Memory]:', err);
      }
    }

    // Locate user in registered accounts (fallback)
    const user = registeredUsers.find(u => 
      u.email.toLowerCase() === identifier || 
      (u.username && u.username.toLowerCase() === identifier)
    );

    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu login e senha.' });
    }

    // Role-specific verification
    if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: Esta conta não possui privilégios de Administrador.' });
    }
    if (role === 'professional' && user.role !== 'professional') {
      return res.status(403).json({ error: 'Acesso negado: Esta conta não possui credenciais de Profissional.' });
    }

    // Generate cryptographic token
    const token = createToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      stylistId: user.stylistId,
      phone: user.phone,
    });

    return res.json({
      success: true,
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        stylistId: user.stylistId,
        phone: user.phone,
      },
    });
  });

  // 2. Client registration with password hashing and Supabase persistence
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Por favor, informe seu nome completo.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Por favor, informe um endereço de e-mail válido.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists in Supabase or memory
    if (supabase) {
      try {
        const { data: existingDb } = await supabase
          .from('users')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (existingDb) {
          return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login na sua conta.' });
        }
      } catch {}
    }

    const existing = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login na sua conta.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const newUser: RegisteredUser = {
      id: 'usr-cli-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      role: 'client',
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      try {
        await supabase.from('users').insert([{
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: 'client',
          password_hash: newUser.passwordHash,
          salt: newUser.salt,
        }]);
      } catch (err) {
        console.warn('[Supabase Register Error, saved to memory]:', err);
      }
    }

    registeredUsers.push(newUser);

    const token = createToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
    });

    return res.status(201).json({
      success: true,
      token,
      role: 'client',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: 'client',
      },
    });
  });

  // 3. Session restore endpoint (validates token cryptographically on page reload)
  app.get('/api/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
    return res.json({
      success: true,
      role: req.user!.role,
      user: req.user,
    });
  });

  // --- PROTECTED BUSINESS ROUTES ---

  // Payment Settings (PIX & Adiantamento)
  app.get('/api/payment-settings', async (req: Request, res: Response) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('payment_settings').select('*').maybeSingle();
        if (!error && data) {
          return res.json({
            pixEnabled: data.pix_enabled,
            pixKey: data.pix_key,
            pixRecipient: data.pix_recipient,
            cardManualEnabled: data.card_manual_enabled,
            depositRequired: data.deposit_required,
            depositType: data.deposit_type,
            depositValue: Number(data.deposit_value),
          });
        }
      } catch {}
    }
    res.json(paymentSettings);
  });

  app.post('/api/payment-settings', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
    paymentSettings = { ...paymentSettings, ...req.body };
    if (supabase) {
      try {
        await supabase.from('payment_settings').upsert([{
          id: 1,
          pix_enabled: paymentSettings.pixEnabled,
          pix_key: paymentSettings.pixKey,
          pix_recipient: paymentSettings.pixRecipient,
          card_manual_enabled: paymentSettings.cardManualEnabled,
          deposit_required: paymentSettings.depositRequired,
          deposit_type: paymentSettings.depositType,
          deposit_value: paymentSettings.depositValue,
        }]);
      } catch {}
    }
    res.json(paymentSettings);
  });

  // Stylists
  app.get('/api/stylists', async (req: Request, res: Response) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('stylists').select('*').order('rating', { ascending: false });
        if (!error && data && data.length > 0) {
          return res.json(data.map(d => ({
            id: d.id,
            name: d.name,
            role: d.role,
            avatar: d.avatar,
            rating: Number(d.rating),
            reviewsCount: d.reviews_count,
            specialties: d.specialties || [],
            status: d.status,
          })));
        }
      } catch {}
    }
    res.json(stylists);
  });

  app.put('/api/stylists/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, avatar } = req.body;
    if (supabase) {
      try {
        const updates: any = {};
        if (status) updates.status = status;
        if (avatar) updates.avatar = avatar;
        await supabase.from('stylists').update(updates).eq('id', id);
      } catch {}
    }
    stylists = stylists.map(s => s.id === id ? { ...s, ...(status ? { status } : {}), ...(avatar ? { avatar } : {}) } : s);
    const updated = stylists.find(s => s.id === id);
    res.json(updated);
  });

  // Services
  app.get('/api/services', async (req: Request, res: Response) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('services').select('*').order('name');
        if (!error && data && data.length > 0) {
          return res.json(data.map(d => ({
            id: d.id,
            name: d.name,
            category: d.category,
            price: Number(d.price),
            durationMinutes: d.duration_minutes,
            description: d.description,
            image: d.image,
            popular: d.popular,
          })));
        }
      } catch {}
    }
    res.json(services);
  });

  app.post('/api/services', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
    const newService = { id: 's-' + Date.now(), ...req.body };
    if (supabase) {
      try {
        await supabase.from('services').insert([{
          id: newService.id,
          name: newService.name,
          category: newService.category,
          price: newService.price,
          duration_minutes: newService.durationMinutes,
          description: newService.description,
          image: newService.image,
          popular: newService.popular || false,
        }]);
      } catch {}
    }
    services.push(newService);
    res.status(201).json(newService);
  });

  app.delete('/api/services/:id', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (supabase) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch {}
    }
    services = services.filter(s => s.id !== id);
    res.json({ success: true, id });
  });

  // Banners
  app.get('/api/banners', async (req: Request, res: Response) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('banners').select('*').eq('active', true);
        if (!error && data && data.length > 0) {
          return res.json(data);
        }
      } catch {}
    }
    res.json(banners);
  });

  app.post('/api/banners', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
    const newBanner = { id: 'b-' + Date.now(), ...req.body, active: true };
    if (supabase) {
      try {
        await supabase.from('banners').insert([newBanner]);
      } catch {}
    }
    banners.push(newBanner);
    res.status(201).json(newBanner);
  });

  app.delete('/api/banners/:id', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
    if (supabase) {
      try {
        await supabase.from('banners').delete().eq('id', req.params.id);
      } catch {}
    }
    banners = banners.filter(b => b.id !== req.params.id);
    res.json({ success: true });
  });

  // Products
  app.get('/api/products', async (req: Request, res: Response) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (!error && data && data.length > 0) {
          return res.json(data.map(d => ({
            id: d.id,
            name: d.name,
            category: d.category,
            price: Number(d.price),
            rating: Number(d.rating),
            image: d.image,
            description: d.description,
            inStock: d.in_stock,
          })));
        }
      } catch {}
    }
    res.json(products);
  });

  app.post('/api/products', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
    const newProduct = { id: 'p-' + Date.now(), ...req.body };
    if (supabase) {
      try {
        await supabase.from('products').insert([{
          id: newProduct.id,
          name: newProduct.name,
          category: newProduct.category,
          price: newProduct.price,
          rating: newProduct.rating || 5.0,
          image: newProduct.image,
          description: newProduct.description,
          in_stock: newProduct.inStock ?? true,
        }]);
      } catch {}
    }
    products.push(newProduct);
    res.status(201).json(newProduct);
  });

  app.delete('/api/products/:id', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', req.params.id);
      } catch {}
    }
    products = products.filter(p => p.id !== req.params.id);
    res.json({ success: true });
  });

  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(settings);
  });

  app.post('/api/settings', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
    settings = { ...settings, ...req.body };
    res.json(settings);
  });

  // Appointments: strictly scoped according to authenticated identity
  app.get('/api/appointments', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.json([]);
    }

    if (supabase) {
      try {
        let query = supabase.from('appointments').select('*');
        if (req.user.role === 'admin') {
          query = query.order('date', { ascending: false });
        } else if (req.user.role === 'professional') {
          const profStylistId = req.user.stylistId || 'st1';
          query = query.eq('stylist_id', profStylistId).order('date', { ascending: true });
        } else {
          query = query.or(`client_id.eq.${req.user.id},client_email.ilike.${req.user.email},client_name.ilike.${req.user.name}`).order('date', { ascending: true });
        }
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(d => ({
            id: d.id,
            serviceId: d.service_id,
            serviceName: d.service_name,
            stylistId: d.stylist_id,
            stylistName: d.stylist_name,
            clientId: d.client_id,
            clientEmail: d.client_email,
            clientName: d.client_name,
            date: d.date,
            time: d.time,
            price: Number(d.price),
            status: d.status,
            notes: d.notes,
          })));
        }
      } catch {}
    }

    if (req.user.role === 'admin') {
      return res.json(appointments);
    } else if (req.user.role === 'professional') {
      const profStylistId = req.user.stylistId || 'st1';
      const profAppointments = appointments.filter(a => a.stylistId === profStylistId);
      return res.json(profAppointments);
    } else {
      const clientApps = appointments.filter(a => 
        (a.clientId && a.clientId === req.user!.id) ||
        (a.clientEmail && a.clientEmail.toLowerCase() === req.user!.email.toLowerCase()) ||
        (a.clientName && a.clientName.toLowerCase() === req.user!.name.toLowerCase())
      );
      return res.json(clientApps);
    }
  });

  // Availability endpoint (returns booked times for a given stylist and date, no private data)
  app.get('/api/appointments/availability', async (req: Request, res: Response) => {
    const { stylistId, date } = req.query;
    if (!stylistId || !date) {
      return res.status(400).json({ error: 'Parâmetros stylistId e date são obrigatórios.' });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('time')
          .eq('stylist_id', String(stylistId))
          .eq('date', String(date))
          .eq('status', 'confirmado');
        if (!error && data) {
          return res.json({ stylistId, date, bookedTimes: data.map(d => d.time) });
        }
      } catch {}
    }

    const bookedTimes = appointments
      .filter(a => a.stylistId === String(stylistId) && a.date === String(date) && a.status === 'confirmado')
      .map(a => a.time);
    res.json({ stylistId, date, bookedTimes });
  });

  app.post('/api/appointments', authenticate, async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const body = req.body;

    // Check conflict in Supabase first
    if (supabase) {
      try {
        const { data: conflict } = await supabase
          .from('appointments')
          .select('id')
          .eq('stylist_id', body.stylistId)
          .eq('date', body.date)
          .eq('time', body.time)
          .eq('status', 'confirmado')
          .maybeSingle();

        if (conflict) {
          return res.status(409).json({ error: 'Horário indisponível: o profissional já possui agendamento confirmado neste horário.' });
        }
      } catch {}
    }

    // Server-side conflict validation in memory
    const hasConflict = appointments.some(a => 
      a.status === 'confirmado' &&
      a.stylistId === body.stylistId &&
      a.date === body.date &&
      a.time === body.time
    );

    if (hasConflict) {
      return res.status(409).json({ error: 'Horário indisponível: o profissional já possui agendamento confirmado neste horário.' });
    }

    const newApp = {
      id: 'app-' + Date.now(),
      ...body,
      status: body.status || 'confirmado',
      clientId: user.role === 'client' ? user.id : (body.clientId || user.id),
      clientEmail: user.role === 'client' ? user.email : (body.clientEmail || user.email),
      clientName: user.role === 'client' ? user.name : (body.clientName || user.name),
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('appointments').insert([{
          id: newApp.id,
          service_id: newApp.serviceId,
          service_name: newApp.serviceName,
          stylist_id: newApp.stylistId,
          stylist_name: newApp.stylistName,
          client_id: newApp.clientId,
          client_email: newApp.clientEmail,
          client_name: newApp.clientName,
          date: newApp.date,
          time: newApp.time,
          price: newApp.price,
          status: newApp.status,
          notes: newApp.notes,
        }]);

        if (error && (error.code === '23505' || error.message.includes('unique'))) {
          return res.status(409).json({ error: 'Conflito de horário: o profissional já possui agendamento confirmado neste horário.' });
        }
      } catch {}
    }

    appointments.unshift(newApp);
    res.status(201).json(newApp);
  });

  // Edit / Reschedule / Update Status of an appointment
  app.put('/api/appointments/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user!;
    const index = appointments.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    const currentApp = appointments[index];

    // Authorization check
    const isOwnerClient = user.role === 'client' && (
      currentApp.clientId === user.id ||
      (currentApp.clientEmail && currentApp.clientEmail.toLowerCase() === user.email.toLowerCase()) ||
      (currentApp.clientName && currentApp.clientName.toLowerCase() === user.name.toLowerCase())
    );
    const isAssignedPro = user.role === 'professional' && (
      currentApp.stylistId === user.stylistId ||
      currentApp.stylistName.toLowerCase().includes(user.name.toLowerCase())
    );
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !isAssignedPro && !isOwnerClient) {
      return res.status(403).json({ error: 'Acesso negado: você não tem permissão para alterar este agendamento.' });
    }

    const updates = req.body;
    const targetStylistId = updates.stylistId || currentApp.stylistId;
    const targetDate = updates.date || currentApp.date;
    const targetTime = updates.time || currentApp.time;
    const targetStatus = updates.status || currentApp.status;

    if (targetStatus === 'confirmado') {
      const conflict = appointments.some(a => 
        a.id !== id &&
        a.status === 'confirmado' &&
        a.stylistId === targetStylistId &&
        a.date === targetDate &&
        a.time === targetTime
      );
      if (conflict) {
        return res.status(409).json({ error: 'Conflito de horário: o horário solicitado já está ocupado.' });
      }
    }

    if (supabase) {
      try {
        const dbUpdates: any = {};
        if (updates.serviceId) dbUpdates.service_id = updates.serviceId;
        if (updates.serviceName) dbUpdates.service_name = updates.serviceName;
        if (updates.stylistId) dbUpdates.stylist_id = updates.stylistId;
        if (updates.stylistName) dbUpdates.stylist_name = updates.stylistName;
        if (updates.date) dbUpdates.date = updates.date;
        if (updates.time) dbUpdates.time = updates.time;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.price) dbUpdates.price = updates.price;

        const { error } = await supabase.from('appointments').update(dbUpdates).eq('id', id);
        if (error && (error.code === '23505' || error.message.includes('unique'))) {
          return res.status(409).json({ error: 'Conflito de horário: o horário solicitado já está ocupado.' });
        }
      } catch {}
    }

    appointments[index] = {
      ...currentApp,
      ...updates,
      id: currentApp.id,
    };

    res.json(appointments[index]);
  });

  // Cancel appointment endpoint
  app.delete('/api/appointments/:id', authenticate, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user!;
    const index = appointments.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    const currentApp = appointments[index];
    const isOwnerClient = user.role === 'client' && (
      currentApp.clientId === user.id ||
      (currentApp.clientEmail && currentApp.clientEmail.toLowerCase() === user.email.toLowerCase()) ||
      (currentApp.clientName && currentApp.clientName.toLowerCase() === user.name.toLowerCase())
    );
    const isAssignedPro = user.role === 'professional' && (
      currentApp.stylistId === user.stylistId ||
      currentApp.stylistName.toLowerCase().includes(user.name.toLowerCase())
    );
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !isAssignedPro && !isOwnerClient) {
      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente para cancelar este agendamento.' });
    }

    if (supabase) {
      try {
        await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', id);
      } catch {}
    }

    appointments[index].status = 'cancelado';
    res.json({ success: true, appointment: appointments[index] });
  });

  app.get('/api/admin/metrics', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
    res.json({
      revenueToday: 3850,
      revenueMonth: 78400,
      occupancyRate: '88%',
      totalAppointments: appointments.length,
    });
  });

  // Setup Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
