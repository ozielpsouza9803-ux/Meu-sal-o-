import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // In-memory DB store for server-side validation demo
  let services = [
    { id: 's1', name: 'Corte Modelado & Estilo (Unissex)', category: 'cabelo', price: 90, durationMinutes: 45, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
    { id: 's2', name: 'Barba Terapia com Toalha Quente', category: 'barba', price: 70, durationMinutes: 30, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
    { id: 's3', name: 'Coloração & Mechas / Balayage', category: 'coloracao', price: 280, durationMinutes: 120, popular: true, description: 'Serviço profissional de alta qualidade com produtos L\'Élite.', image: '/src/assets/images/service_haircut_1792861533533.jpg' },
  ];

  let appointments = [
    { id: 'app-1', serviceName: 'Corte Modelado & Estilo (Unissex)', stylistId: 'st1', stylistName: 'Juliana Vance', clientName: 'Camila Souza', date: '2026-10-25', time: '14:30', price: 90, status: 'confirmado' },
    { id: 'app-2', serviceName: 'Barba Terapia com Toalha Quente', stylistId: 'st2', stylistName: 'Carlos Mendes', clientName: 'Lucas Ferreira', date: '2026-10-25', time: '16:00', price: 70, status: 'confirmado' },
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

  // RBAC Middleware simulator
  const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: Function) => {
      const role = (req.headers['x-user-role'] as string) || 'client';
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Acesso negado: permissões insuficientes para esta função.' });
      }
      next();
    };
  };

  app.get('/api/payment-settings', (req: Request, res: Response) => { res.json(paymentSettings); });
  app.post('/api/payment-settings', checkRole(['admin']), (req: Request, res: Response) => {
    paymentSettings = { ...paymentSettings, ...req.body };
    res.json(paymentSettings);
  });

  // API Routes with Role-Based Access Control
  app.get('/api/services', (req: Request, res: Response) => { res.json(services); });
  app.post('/api/services', checkRole(['admin']), (req: Request, res: Response) => {
    const newService = { id: 's-' + Date.now(), ...req.body };
    services.push(newService);
    res.status(201).json(newService);
  });
  app.delete('/api/services/:id', checkRole(['admin']), (req: Request, res: Response) => {
    const { id } = req.params;
    services = services.filter(s => s.id !== id);
    res.json({ success: true, id });
  });

  app.get('/api/banners', (req: Request, res: Response) => { res.json(banners); });
  app.post('/api/banners', checkRole(['admin']), (req: Request, res: Response) => {
    const newBanner = { id: 'b-' + Date.now(), ...req.body, active: true };
    banners.push(newBanner);
    res.status(201).json(newBanner);
  });
  app.delete('/api/banners/:id', checkRole(['admin']), (req: Request, res: Response) => {
    banners = banners.filter(b => b.id !== req.params.id);
    res.json({ success: true });
  });

  app.get('/api/products', (req: Request, res: Response) => { res.json(products); });
  app.post('/api/products', checkRole(['admin']), (req: Request, res: Response) => {
    const newProduct = { id: 'p-' + Date.now(), ...req.body };
    products.push(newProduct);
    res.status(201).json(newProduct);
  });
  app.delete('/api/products/:id', checkRole(['admin']), (req: Request, res: Response) => {
    products = products.filter(p => p.id !== req.params.id);
    res.json({ success: true });
  });

  app.get('/api/settings', (req: Request, res: Response) => { res.json(settings); });
  app.post('/api/settings', checkRole(['admin']), (req: Request, res: Response) => {
    settings = { ...settings, ...req.body };
    res.json(settings);
  });

  app.get('/api/appointments', (req: Request, res: Response) => {
    const role = (req.headers['x-user-role'] as string) || 'client';
    const userName = (req.headers['x-user-name'] as string) || 'Camil Souza';

    if (role === 'admin') {
      return res.json(appointments);
    } else if (role === 'professional') {
      const profAppointments = appointments.filter(a => a.stylistId === 'st1');
      return res.json(profAppointments);
    } else {
      const clientAppointments = appointments.filter(a => a.clientName.toLowerCase().includes('camila') || a.clientName === userName);
      return res.json(clientAppointments.length > 0 ? clientAppointments : appointments);
    }
  });

  app.post('/api/appointments', checkRole(['client', 'admin']), (req: Request, res: Response) => {
    const newApp = { id: 'app-' + Date.now(), ...req.body };
    appointments.unshift(newApp);
    res.status(201).json(newApp);
  });

  app.get('/api/admin/metrics', checkRole(['admin']), (req: Request, res: Response) => {
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
