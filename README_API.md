# 🎣 Fisher Fans API - NestJS

> API REST complète pour Fisher Fans - "Le BlaBlaCar des pêcheurs en mer"
>
> Projet M2 Dev - YNOV CAMPUS Sophia

[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791?logo=postgresql)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.1-85EA2D?logo=swagger)](https://swagger.io/)

## 📋 Vue d'ensemble

API REST complète implémentant le cahier des charges Fisher Fans avec :

- ✅ **5 modules métier** : Users, Boats, Trips, Bookings, Logbook
- ✅ **Authentification JWT** globale avec Passport
- ✅ **Validation automatique** des données avec class-validator
- ✅ **Documentation Swagger** interactive générée automatiquement
- ✅ **ORM TypeORM** avec PostgreSQL
- ✅ **Règles métier** du CDC (BF26, BF27, RGPD)
- ✅ **Architecture modulaire** scalable

## 🚀 Démarrage rapide

### Prérequis

- Node.js 16+ et npm
- PostgreSQL 12+

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/ZaherMadi/APINestjs.git
cd APINestjs

# 2. Installer les dépendances
npm install

# 3. Créer la base de données PostgreSQL
createdb fisherfans

# 4. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres DB

# 5. Lancer en mode développement
npm run start:dev
```

L'API démarre sur **http://localhost:8443**

Documentation Swagger : **http://localhost:8443/api-docs**

## 📚 Documentation complète

**👉 Consultez le [GUIDE_COMPLET.md](./GUIDE_COMPLET.md) pour :**

- Comprendre l'architecture NestJS vs FastAPI/Express
- Détails sur chaque module et concept
- Explications du flux d'authentification JWT
- Implémentation des règles métier
- Comparaisons de code entre frameworks
- Guide de déploiement et tests

## 🔑 Routes principales

### Authentification

```http
POST   /api/auth/v1/login         # Login (retourne JWT) - PUBLIC
```

### Utilisateurs

```http
POST   /api/v1/users              # Créer un compte - PUBLIC
GET    /api/v1/users              # Rechercher des utilisateurs
GET    /api/v1/users/:userId      # Détails d'un utilisateur
PATCH  /api/v1/users/:userId      # Modifier son profil
DELETE /api/v1/users/:userId      # Supprimer son compte (RGPD)

# Routes BF19 (ressources d'un utilisateur)
GET    /api/v1/users/:userId/boats     # Bateaux de l'utilisateur
GET    /api/v1/users/:userId/trips     # Sorties de l'utilisateur
GET    /api/v1/users/:userId/bookings  # Réservations de l'utilisateur
```

### Bateaux

```http
POST   /api/v1/boats              # Créer un bateau (nécessite permis)
GET    /api/v1/boats              # Rechercher des bateaux
GET    /api/v1/boats/:boatId      # Détails d'un bateau
PATCH  /api/v1/boats/:boatId      # Modifier son bateau
DELETE /api/v1/boats/:boatId      # Supprimer son bateau
```

### Sorties pêche

```http
POST   /api/v1/trips              # Créer une sortie (nécessite bateau)
GET    /api/v1/trips              # Rechercher des sorties
GET    /api/v1/trips/:tripId      # Détails d'une sortie
PATCH  /api/v1/trips/:tripId      # Modifier sa sortie
DELETE /api/v1/trips/:tripId      # Supprimer sa sortie
```

### Réservations

```http
POST   /api/v1/bookings           # Créer une réservation
GET    /api/v1/bookings           # Rechercher des réservations
GET    /api/v1/bookings/:id       # Détails d'une réservation
PATCH  /api/v1/bookings/:id       # Modifier sa réservation
DELETE /api/v1/bookings/:id       # Annuler sa réservation
```

### Carnet de pêche

```http
POST   /api/v1/logbook            # Ajouter une entrée
GET    /api/v1/logbook            # Lister les entrées
GET    /api/v1/logbook/:entryId   # Détails d'une entrée
PATCH  /api/v1/logbook/:entryId   # Modifier une entrée
DELETE /api/v1/logbook/:entryId   # Supprimer une entrée
```

## 🔐 Authentification

Toutes les routes sont protégées par défaut (sauf `/login` et `/users` POST).

**Obtenir un token :**

```bash
curl -X POST http://localhost:8443/api/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Utiliser le token :**

```bash
curl -X GET http://localhost:8443/api/v1/users/123 \
  -H "Authorization: Bearer <votre-token-ici>"
```

## 🗂️ Structure du projet

```
src/
├── main.ts                     # Point d'entrée (config Swagger, ValidationPipe)
├── app.module.ts               # Module racine
├── common/                     # Composants partagés
│   ├── guards/
│   │   └── jwt-auth.guard.ts   # Protection JWT des routes
│   └── decorators/
│       ├── public.decorator.ts         # @Public() pour routes publiques
│       └── current-user.decorator.ts   # @CurrentUser() pour récupérer l'user
└── modules/
    ├── auth/                   # Authentification JWT
    ├── users/                  # Gestion utilisateurs
    ├── boats/                  # Gestion bateaux
    ├── trips/                  # Gestion sorties pêche
    ├── bookings/               # Gestion réservations
    └── logbook/                # Carnet de pêche
```

Chaque module contient :
- `*.module.ts` : Configuration du module
- `*.controller.ts` : Routes HTTP (endpoints)
- `*.service.ts` : Logique métier
- `entities/` : Modèles de données (tables DB)
- `dto/` : Validation des données entrantes

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests end-to-end
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Build et déploiement

```bash
# Build de production
npm run build

# Lancer en production
npm run start:prod
```

## 📖 Commandes utiles

```bash
# Développement avec hot-reload
npm run start:dev

# Format du code
npm run format

# Lint
npm run lint

# Générer un nouveau module complet
nest generate resource nom-module

# Générer un service
nest generate service nom-service
```

## 🛠️ Technologies utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| **NestJS** | 10.x | Framework backend |
| **TypeScript** | 5.x | Langage |
| **TypeORM** | 0.3.x | ORM (PostgreSQL) |
| **Passport JWT** | 10.x | Authentification JWT |
| **class-validator** | 0.14.x | Validation DTO |
| **Swagger** | 7.x | Documentation API |
| **bcrypt** | 5.x | Hash des mots de passe |

## 📝 Règles métier implémentées

- **BF1** : API privée avec authentification JWT
- **BF20-BF24** : Filtres de recherche avancés (users, boats, trips, bookings)
- **BF25** : Codes d'erreur métier (`PERMIT_REQUIRED`, `USER_HAS_NO_BOAT`)
- **BF26** : Interdiction de créer une sortie sans bateau
- **BF27** : Interdiction de créer un bateau sans permis
- **BN6** : Conformité RGPD (anonymisation des données à la suppression)

## 🐛 Dépannage

### Erreur de connexion à la DB

```bash
# Vérifier que PostgreSQL est lancé
pg_isready

# Créer la base de données
createdb fisherfans

# Vérifier .env
cat .env
```

### Erreur JWT

Assurez-vous que le header `Authorization` est bien formaté :
```
Authorization: Bearer <token>
```

## 🤝 Contribution

Ce projet est un projet académique YNOV. Pour toute question :

- Ouvrir une issue sur GitHub
- Consulter le [GUIDE_COMPLET.md](./GUIDE_COMPLET.md)

## 📄 Licence

Projet académique - YNOV CAMPUS Sophia - M2 Dev

---

**Développé avec ❤️ par l'équipe Fisher Fans**
