import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

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

  // In-memory persistent data store
  let services = [
    { id: 's1', name: 'Corte Modelado & Estilo (Unissex)', category: 'cabelo', price: 90, durationMinutes: 45, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
    { id: 's2', name: 'Barba Terapia com Toalha Quente', category: 'barba', price: 70, durationMinutes: 30, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
    { id: 's3', name: 'Coloração & Mechas / Balayage', category: 'coloracao', price: 280, durationMinutes: 120, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
  ];

  let appointments = [
    { id: 'app-1', serviceId: 's1', serviceName: 'Corte Modelado & Estilo (Unissex)', stylistId: 'st1', stylistName: 'Juliana Vance', clientId: 'usr-cli-1', clientEmail: 'camila@lelite.com.br', clientName: 'Camila Souza', date: '2026-10-25', time: '14:30', price: 90, status: 'confirmado' },
    { id: 'app-2', serviceId: 's2', serviceName: 'Barba Terapia com Toalha Quente', stylistId: 'st2', stylistName: 'Carlos Mendes', clientId: 'usr-cli-2', clientEmail: 'lucas@exemplo.com', clientName: 'Lucas Ferreira', date: '2026-10-25', time: '16:00', price: 70, status: 'confirmado' },
  ];

  let banners = [{ id: 'b1', url: '/src/assets/images/salon_hero_banner_1792861532508.jpg', type: 'image', active: true }];
  let products = [{ id: 'p1', name: 'Shampoo L\'Élite', price: 50, description: 'Shampoo premium para cabelos tratados.', image: '/src/assets/images/product_shampoo_1792861534000.jpg' }];
  let settings = { salonName: 'L\'Élite Salon & Spa', primaryColor: '#b45309' };
  let paymentSettings = {
    pixEnabled: true,
    pixKey: '12345678900',
    pixRecipient: 'L\'Élite Salon & Spa',
    cardManualEnabled: true,
    depositRequired: true,
    depositType: 'percentage',
    depositValue: 20
  };

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

  // 1. Login endpoint with full password verification and cryptographic token issuance
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, username, password, role } = req.body;
    const identifier = (email || username || '').trim().toLowerCase();

    if (!identifier) {
      return res.status(400).json({ error: 'Informe seu usuário ou e-mail de acesso.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Informe a senha de acesso.' });
    }

    // Locate user in registered accounts
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

  // 2. Client registration with password hashing
  app.post('/api/auth/register', (req: Request, res: Response) => {
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
  app.get('/api/auth/me', authenticate, (req: AuthRequest, res: Response) => {
    return res.json({
      success: true,
      role: req.user!.role,
      user: req.user,
    });
  });

  // --- PROTECTED BUSINESS ROUTES ---

  app.get('/api/payment-settings', (req: Request, res: Response) => {
    res.json(paymentSettings);
  });

  app.post('/api/payment-settings', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
    paymentSettings = { ...paymentSettings, ...req.body };
    res.json(paymentSettings);
  });

  app.get('/api/services', (req: Request, res: Response) => {
    res.json(services);
  });

  app.post('/api/services', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
    const newService = { id: 's-' + Date.now(), ...req.body };
    services.push(newService);
    res.status(201).json(newService);
  });

  app.delete('/api/services/:id', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    services = services.filter(s => s.id !== id);
    res.json({ success: true, id });
  });

  app.get('/api/banners', (req: Request, res: Response) => {
    res.json(banners);
  });

  app.post('/api/banners', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
    const newBanner = { id: 'b-' + Date.now(), ...req.body, active: true };
    banners.push(newBanner);
    res.status(201).json(newBanner);
  });

  app.delete('/api/banners/:id', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
    banners = banners.filter(b => b.id !== req.params.id);
    res.json({ success: true });
  });

  app.get('/api/products', (req: Request, res: Response) => {
    res.json(products);
  });

  app.post('/api/products', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
    const newProduct = { id: 'p-' + Date.now(), ...req.body };
    products.push(newProduct);
    res.status(201).json(newProduct);
  });

  app.delete('/api/products/:id', authenticate, requireRole(['admin']), (req: AuthRequest, res: Response) => {
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
  app.get('/api/appointments', optionalAuthenticate, (req: AuthRequest, res: Response) => {
    if (!req.user) {
      // If not logged in, return empty or require authentication for private data
      return res.json([]);
    }

    if (req.user.role === 'admin') {
      // Admin sees all salon appointments
      return res.json(appointments);
    } else if (req.user.role === 'professional') {
      // Professional sees only their assigned appointments
      const profStylistId = req.user.stylistId || 'st1';
      const profAppointments = appointments.filter(a => a.stylistId === profStylistId);
      return res.json(profAppointments);
    } else {
      // Client sees strictly their own appointments
      const clientApps = appointments.filter(a => 
        (a.clientId && a.clientId === req.user!.id) ||
        (a.clientEmail && a.clientEmail.toLowerCase() === req.user!.email.toLowerCase()) ||
        (a.clientName && a.clientName.toLowerCase() === req.user!.name.toLowerCase())
      );
      return res.json(clientApps);
    }
  });

  app.post('/api/appointments', authenticate, (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const body = req.body;

    const newApp = {
      id: 'app-' + Date.now(),
      ...body,
      // Tie client identity to the authenticated user if client
      clientId: user.role === 'client' ? user.id : (body.clientId || user.id),
      clientEmail: user.role === 'client' ? user.email : (body.clientEmail || user.email),
      clientName: user.role === 'client' ? user.name : (body.clientName || user.name),
    };

    appointments.unshift(newApp);
    res.status(201).json(newApp);
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
