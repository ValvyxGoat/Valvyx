-- ============================================================
-- VAULT v2 — Mise à jour base de données
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- ============================================================

-- 1. Épinglage des coffres : colonne pinned sur vaults
ALTER TABLE vaults ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- 2. Table argent global du groupe (remplace l'argent par coffre)
CREATE TABLE IF NOT EXISTS group_money (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  balance BIGINT DEFAULT 0 NOT NULL
);

-- Insérer le solde initial (une seule ligne)
INSERT INTO group_money (balance)
SELECT 0
WHERE NOT EXISTS (SELECT 1 FROM group_money);

-- 3. Table historique des mouvements d'argent global
CREATE TABLE IF NOT EXISTS money_logs_global (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('deposit', 'withdraw')),
  amount BIGINT NOT NULL,
  reason TEXT,
  balance_after BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Table marqueurs de carte
CREATE TABLE IF NOT EXISTS map_markers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. RLS pour les nouvelles tables
ALTER TABLE group_money ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_logs_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON group_money FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON money_logs_global FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON map_markers FOR ALL TO anon USING (true) WITH CHECK (true);
