-- ============================================================
-- VAULT — Schéma de base de données Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- ============================================================

-- Table des coffres
CREATE TABLE IF NOT EXISTS vaults (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  money BIGINT DEFAULT 0 NOT NULL,
  location TEXT,
  color TEXT DEFAULT 'red',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des catégories d'objets
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'package',
  color TEXT DEFAULT '#888888',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des objets dans les coffres
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0 NOT NULL,
  unit TEXT DEFAULT 'unité',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT quantity_non_negative CHECK (quantity >= 0)
);

-- Table de l'historique des actions sur les objets
CREATE TABLE IF NOT EXISTS item_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('add', 'remove', 'create', 'delete')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table de l'historique des mouvements d'argent
CREATE TABLE IF NOT EXISTS money_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('deposit', 'withdraw')),
  amount BIGINT NOT NULL,
  reason TEXT,
  balance_after BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- Triggers pour updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vaults_updated_at
  BEFORE UPDATE ON vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security (RLS) - Désactivé pour usage via anon key
-- (Le contrôle d'accès est géré côté frontend par le mot de passe)
-- ============================================================

ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_logs ENABLE ROW LEVEL SECURITY;

-- Politique : accès total via la clé anon (contrôle côté app)
CREATE POLICY "Allow all for anon" ON vaults FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON item_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON money_logs FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- Données d'exemple
-- ============================================================

INSERT INTO categories (name, icon, color) VALUES
  ('Armes', 'crosshair', '#e63946'),
  ('Drogues', 'flask-conical', '#f4913d'),
  ('Objets', 'package', '#39d353'),
  ('Munitions', 'zap', '#f5c542'),
  ('Équipement', 'shield', '#60a5fa')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vaults (name, description, money, location, color) VALUES
  ('Planque Principale', 'Entrepôt central du cartel', 250000, 'Sandy Shores', 'red'),
  ('Cache Boulot', 'Planque discrète dans la ville', 85000, 'Downtown LS', 'orange'),
  ('Dépôt Nord', 'Entrepôt secondaire en dehors de la ville', 12000, 'Paleto Bay', 'green');
