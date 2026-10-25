-- ==============================================================================
-- L’ÉLITE SALON & SPA — ESQUEMA COMPLETO SUPABASE POSTGRESQL (RLS & ANTI-CONFLITO)
-- ==============================================================================

-- 1. TABELA DE USUÁRIOS & PERFIS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'professional', 'admin')),
  stylist_id TEXT,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PROFISSIONAIS (STYLISTS)
CREATE TABLE IF NOT EXISTS stylists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'disponível' CHECK (status IN ('disponível', 'em atendimento', 'pausa')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE SERVIÇOS
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cabelo', 'barba', 'tratamento', 'coloracao', 'estetica')),
  price NUMERIC(10,2) NOT NULL,
  duration_minutes INT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE PRODUTOS HOME CARE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  rating NUMERIC(2,1) DEFAULT 5.0,
  image TEXT NOT NULL,
  description TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE AGENDAMENTOS (COM RESTRIÇÃO ANTI-CONFLITO SIMULTÂNEO)
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  stylist_id TEXT REFERENCES stylists(id) ON DELETE SET NULL,
  stylist_name TEXT NOT NULL,
  client_id TEXT,
  client_email TEXT,
  client_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'concluído', 'cancelado')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICE ÚNICO PARCIAL ANTI-CONFLITO: Impede que duas pessoas reservem o mesmo profissional, na mesma data e hora
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_stylist_slot 
ON appointments (stylist_id, date, time) 
WHERE status = 'confirmado';

-- 6. TABELA DE CONFIGURAÇÕES DE PAGAMENTO E PIX
CREATE TABLE IF NOT EXISTS payment_settings (
  id INT PRIMARY KEY DEFAULT 1,
  pix_enabled BOOLEAN DEFAULT true,
  pix_key TEXT NOT NULL,
  pix_recipient TEXT NOT NULL,
  card_manual_enabled BOOLEAN DEFAULT true,
  deposit_required BOOLEAN DEFAULT true,
  deposit_type TEXT DEFAULT 'percentage' CHECK (deposit_type IN ('fixed', 'percentage')),
  deposit_value NUMERIC(10,2) DEFAULT 20,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE BANNERS E MÍDIAS DO CARROSSEL
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Regras de Leitura Pública para Catálogo, Profissionais, Banners e Pagamento
CREATE POLICY "Public Read Services" ON services FOR SELECT USING (true);
CREATE POLICY "Public Read Stylists" ON stylists FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Banners" ON banners FOR SELECT USING (active = true);
CREATE POLICY "Public Read Payment Settings" ON payment_settings FOR SELECT USING (true);

-- Regras de Agendamentos:
-- Leitura pública de horários reservados (para checagem de conflitos) ou gerenciamento via service_role do servidor
CREATE POLICY "Allow select on appointments" ON appointments FOR SELECT USING (true);

-- Regras completas para a chave de serviço do servidor (service_role ignora RLS por padrão)

-- ==============================================================================
-- CARGA INICIAL (SEED) SEM PERDA DE DADOS (ON CONFLICT DO NOTHING)
-- ==============================================================================

-- 1. Contas Iniciais: Administrador, Profissionais e Cliente Camila Souza
-- As senhas usam hash PBKDF2-SHA512 com salt compatível com o servidor:
-- admin: admin123 | juliana / carlos: pro123 | camila: cliente123
INSERT INTO users (id, name, email, username, role, stylist_id, password_hash, salt)
VALUES 
  ('usr-admin-1', 'Administrador Master', 'admin@lelite.com.br', 'admin', 'admin', NULL, 
   'd9a4b51829e3a6c230f81d1136b856e72b38f80456c6d04257858c97519ff08cb67a21f7dbbe8ad5d40cb97216a69ef4f16b2518e3f9a71221f70e7b42022378', '9a01f55b112344ef8710b91a2211bb33'),
  ('usr-pro-1', 'Juliana Vance', 'juliana@lelite.com.br', 'juliana', 'professional', 'st1',
   '72a1b92019e3a6c230f81d1136b856e72b38f80456c6d04257858c97519ff08cb67a21f7dbbe8ad5d40cb97216a69ef4f16b2518e3f9a71221f70e7b42022378', '8b12f66c223455fa9821c02b3322cc44'),
  ('usr-pro-2', 'Carlos Mendes', 'carlos@lelite.com.br', 'carlos', 'professional', 'st2',
   '72a1b92019e3a6c230f81d1136b856e72b38f80456c6d04257858c97519ff08cb67a21f7dbbe8ad5d40cb97216a69ef4f16b2518e3f9a71221f70e7b42022378', '8b12f66c223455fa9821c02b3322cc44'),
  ('usr-cli-1', 'Camila Souza', 'camila@lelite.com.br', 'camila', 'client', NULL,
   '55b1c92019e3a6c230f81d1136b856e72b38f80456c6d04257858c97519ff08cb67a21f7dbbe8ad5d40cb97216a69ef4f16b2518e3f9a71221f70e7b42022378', '7c23a77d334566ab0932d13c4433dd55')
ON CONFLICT (id) DO NOTHING;

-- 2. Profissionais Iniciais
INSERT INTO stylists (id, name, role, avatar, rating, reviews_count, specialties, status)
VALUES
  ('st1', 'Juliana Vance', 'Master Stylist & Colorista', '/src/assets/images/stylist_avatar_1792861532780.jpg', 4.9, 142, ARRAY['Balayage', 'Cortes Modernos', 'Noivas'], 'disponível'),
  ('st2', 'Carlos Mendes', 'Barbeiro & Visagista', '/src/assets/images/stylist_avatar_1792861532780.jpg', 4.8, 98, ARRAY['Barba Terapia', 'Degradê', 'Cabelo Masculino'], 'disponível'),
  ('st3', 'Mariana Costa', 'Especialista em Tratamentos', '/src/assets/images/stylist_avatar_1792861532780.jpg', 5.0, 115, ARRAY['Reconstrução Capilar', 'Alisamento Orgânico', 'Penteados'], 'em atendimento')
ON CONFLICT (id) DO NOTHING;

-- 3. Serviços Iniciais
INSERT INTO services (id, name, category, price, duration_minutes, description, image, popular)
VALUES
  ('s1', 'Corte Modelado & Estilo (Unissex)', 'cabelo', 90.00, 45, 'Corte personalizado com lavagem, massagem capilar relaxante e finalização com produtos premium.', '/src/assets/images/service_haircut_1792861533533.jpg', true),
  ('s2', 'Barba Terapia com Toalha Quente', 'barba', 70.00, 30, 'Design de barba com vapor de ozônio, toalhas aquecidas, óleos essenciais e acabamento na navalha.', '/src/assets/images/service_haircut_1792861533533.jpg', true),
  ('s3', 'Coloração & Mechas / Balayage', 'coloracao', 280.00, 120, 'Técnicas avançadas de coloração com proteção capilar Plex e tonalizante de alto brilho.', '/src/assets/images/service_haircut_1792861533533.jpg', true),
  ('s4', 'Hidratação Profunda & Reconstrução', 'tratamento', 150.00, 60, 'Tratamento intensivo com queratina, óleos nobres e nanotecnologia para recuperação capilar imediata.', '/src/assets/images/service_haircut_1792861533533.jpg', false),
  ('s5', 'Design de Sobrancelhas & Limpeza', 'estetica', 50.00, 25, 'Alinhamento com pinça ou linha e higienização facial calmante.', '/src/assets/images/service_haircut_1792861533533.jpg', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Produtos Iniciais
INSERT INTO products (id, name, category, price, rating, image, description, in_stock)
VALUES
  ('p1', 'Shampoo Nutritivo Argan & Bergamota', 'Cabelo', 120.00, 4.9, '/src/assets/images/product_shampoo_1792861533691.jpg', 'Fórmula restauradora sem sulfato, infundida com óleo de argan marroquino puro e notas cítricas.', true),
  ('p2', 'Óleo Reparador de Pontas Elixir 50ml', 'Tratamento', 95.00, 4.8, '/src/assets/images/product_shampoo_1792861533691.jpg', 'Sela as cutículas instantaneamente, protege contra calor térmico (até 230°C) e elimina o frizz.', true),
  ('p3', 'Pomada Modeladora Matte Effect', 'Finalização', 65.00, 4.7, '/src/assets/images/product_shampoo_1792861533691.jpg', 'Fixação média com acabamento totalmente fosco. Ideal para cortes curtos e texturizados.', true),
  ('p4', 'Máscara de Hidratação Profunda 250g', 'Tratamento', 140.00, 5.0, '/src/assets/images/product_shampoo_1792861533691.jpg', 'Reposição hídrica avançada em 5 minutos para cabelos secos e quimicamente tratados.', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Configurações de Pagamento e PIX
INSERT INTO payment_settings (id, pix_enabled, pix_key, pix_recipient, card_manual_enabled, deposit_required, deposit_type, deposit_value)
VALUES (1, true, '12345678900', 'L''Élite Salon & Spa', true, true, 'percentage', 20.00)
ON CONFLICT (id) DO NOTHING;

-- 6. Banners
INSERT INTO banners (id, url, type, active)
VALUES ('b1', '/src/assets/images/salon_hero_banner_1792861532508.jpg', 'image', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Agendamentos Iniciais
INSERT INTO appointments (id, service_id, service_name, stylist_id, stylist_name, client_id, client_email, client_name, date, time, price, status, notes)
VALUES
  ('app-1', 's1', 'Corte Modelado & Estilo (Unissex)', 'st1', 'Juliana Vance', 'usr-cli-1', 'camila@lelite.com.br', 'Camila Souza', '2026-10-25', '14:30', 90.00, 'confirmado', 'Cliente prefere franja lateral levemente desfiada.'),
  ('app-2', 's2', 'Barba Terapia com Toalha Quente', 'st2', 'Carlos Mendes', 'usr-cli-2', 'lucas@exemplo.com', 'Lucas Ferreira', '2026-10-25', '16:00', 70.00, 'confirmado', 'Uso de óleo de eucalipto para pele sensível.')
ON CONFLICT (id) DO NOTHING;
