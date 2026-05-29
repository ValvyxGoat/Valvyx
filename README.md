# 🔐 VAULT — Système de Gestion Criminelle GTA RP

Application web complète pour gérer les coffres, stocks et finances d'un groupe illégal en GTA RP.

**Stack :** React + Vite · Tailwind CSS · Supabase (PostgreSQL) · Netlify (hébergement gratuit)

---

## 📋 Fonctionnalités

- 🔐 Connexion par mot de passe unique (aucun compte nécessaire)
- 💰 Affichage de l'argent du groupe en temps réel
- 🏦 Gestion de plusieurs coffres/entrepôts
- 📦 Ajout et retrait d'objets avec raison obligatoire
- 📜 Historique complet des actions (objets + argent)
- 🔍 Recherche et filtres dans les logs
- 📱 Responsive mobile + desktop
- 🎨 Design dark mode style GTA RP

---

## 🚀 Déploiement en 4 étapes

### Étape 1 — Créer la base de données Supabase

1. Créez un compte gratuit sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet (choisissez une région proche : West EU)
3. Allez dans **SQL Editor** et collez tout le contenu du fichier `supabase_schema.sql`
4. Cliquez **Run** → La base de données est prête ✅

5. Notez vos identifiants dans **Settings → API** :
   - `Project URL` → ex: `https://abcdefgh.supabase.co`
   - `anon public` key → la clé longue

---

### Étape 2 — Générer le hash du mot de passe

1. Choisissez votre mot de passe (ex: `monMotDePasse123`)
2. Allez sur [https://emn178.github.io/online-tools/sha256.html](https://emn178.github.io/online-tools/sha256.html)
3. Entrez votre mot de passe et copiez le hash SHA-256 généré

---

### Étape 3 — Déployer sur Netlify

**Option A : Via GitHub (recommandé)**

1. Poussez ce dossier sur un dépôt GitHub
2. Connectez-vous sur [netlify.com](https://netlify.com)
3. Cliquez **Add new site → Import an existing project → GitHub**
4. Sélectionnez votre dépôt
5. Configuration automatique grâce au `netlify.toml`
6. Avant de déployer, ajoutez les variables d'environnement (**Site settings → Environment variables**) :

```
VITE_SUPABASE_URL          = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY     = votre_clé_anon_supabase
VITE_APP_PASSWORD_HASH     = votre_hash_sha256
```

7. Cliquez **Deploy** ✅

**Option B : Via Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_SUPABASE_URL https://votre-projet.supabase.co
netlify env:set VITE_SUPABASE_ANON_KEY votre_clé
netlify env:set VITE_APP_PASSWORD_HASH votre_hash
netlify deploy --build --prod
```

---

### Étape 4 — Tester en local (optionnel)

```bash
# Clonez ou déplacez-vous dans le dossier
cd gta-rp-vault

# Copiez le fichier d'environnement
cp .env.example .env.local

# Remplissez .env.local avec vos vraies valeurs
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_APP_PASSWORD_HASH=...

# Installez les dépendances
npm install

# Lancez en développement
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173)

---

## 📁 Structure du projet

```
gta-rp-vault/
├── netlify.toml              # Config déploiement Netlify
├── supabase_schema.sql       # Schéma BDD à exécuter dans Supabase
├── .env.example              # Template variables d'environnement
├── vite.config.js
├── tailwind.config.js
├── index.html
└── src/
    ├── main.jsx              # Point d'entrée
    ├── App.jsx               # Router principal
    ├── index.css             # Styles globaux
    ├── lib/
    │   ├── supabase.js       # Client Supabase
    │   ├── auth.js           # Gestion session + hash mot de passe
    │   └── utils.js          # Formatage dates/argent
    ├── pages/
    │   ├── Login.jsx         # Page de connexion
    │   ├── Dashboard.jsx     # Tableau de bord
    │   ├── VaultList.jsx     # Liste des coffres
    │   ├── VaultDetail.jsx   # Détail coffre + gestion objets
    │   └── Logs.jsx          # Historique complet
    └── components/
        ├── layout/
        │   └── Layout.jsx    # Sidebar + navigation
        ├── ui/
        │   └── Modal.jsx     # Composant modal réutilisable
        └── modals/
            ├── VaultModal.jsx       # Créer/modifier coffre
            ├── AddItemModal.jsx     # Ajouter objet/quantité
            ├── WithdrawItemModal.jsx # Retirer objet avec raison
            ├── MoneyModal.jsx       # Dépôt/retrait argent
            └── ConfirmModal.jsx     # Confirmation suppression
```

---

## 🗃️ Structure de la base de données

```
vaults          → Coffres (nom, argent, localisation, couleur)
categories      → Catégories d'objets (Armes, Drogues, Objets...)
items           → Objets dans les coffres (quantité, catégorie)
item_logs       → Historique actions sur objets (ajout/retrait)
money_logs      → Historique mouvements d'argent (dépôt/retrait)
```

---

## ⚙️ Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anon Supabase |
| `VITE_APP_PASSWORD_HASH` | Hash SHA-256 du mot de passe du site |

---

## 🔒 Sécurité

- Le mot de passe n'est jamais stocké en clair — seul son hash SHA-256 est utilisé
- La session est sauvegardée en localStorage/sessionStorage
- Les routes API Supabase sont protégées par les politiques RLS
- Les variables sensibles sont dans les variables d'environnement (jamais en dur dans le code)

---

## 🎨 Design

- Dark mode complet
- Font : Bebas Neue (titres) + DM Sans (texte) + JetBrains Mono (nombres)
- Palette : Noir `#080808` · Rouge `#e63946` · Or `#f5c542` · Vert `#39d353`
- Animations Framer Motion sur toutes les transitions
- Responsive mobile-first

---

## 📝 Crédits

Projet RP fictif — usage dans un contexte de jeu de rôle GTA uniquement.
