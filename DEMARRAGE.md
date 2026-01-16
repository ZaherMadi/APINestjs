# 🚀 Démarrage de l'API Fisher Fans

## ✅ Ce qui a été créé

Votre API NestJS complète est prête ! Voici ce qui a été implémenté :

### 📦 Structure créée (40 fichiers TypeScript)

```
✅ Configuration de base
   ├── package.json (dépendances)
   ├── tsconfig.json (configuration TypeScript)
   ├── .env (variables d'environnement)
   └── nest-cli.json (configuration NestJS)

✅ Point d'entrée
   ├── src/main.ts (démarre l'app + configure Swagger)
   └── src/app.module.ts (module racine)

✅ Module Auth (authentification JWT)
   ├── auth.controller.ts (route /login)
   ├── auth.service.ts (génération JWT, vérif password)
   ├── jwt.strategy.ts (validation des tokens)
   └── dto/login.dto.ts (validation email/password)

✅ Module Users (utilisateurs)
   ├── users.controller.ts (CRUD + routes BF19)
   ├── users.service.ts (logique métier + RGPD)
   ├── entities/user.entity.ts (table users)
   └── dto/ (validation création/modification)

✅ Module Boats (bateaux)
   ├── boats.controller.ts (CRUD + filtres géo)
   ├── boats.service.ts (règle BF27: vérif permis)
   ├── entities/boat.entity.ts (table boats)
   └── dto/ (validation)

✅ Module Trips (sorties pêche)
   ├── trips.controller.ts (CRUD + filtres)
   ├── trips.service.ts (règle BF26: vérif bateau)
   ├── entities/trip.entity.ts (table trips)
   └── dto/ (validation)

✅ Module Bookings (réservations)
   ├── bookings.controller.ts (CRUD)
   ├── bookings.service.ts (calcul prix auto)
   ├── entities/booking.entity.ts (table bookings)
   └── dto/ (validation)

✅ Module Logbook (carnet de pêche)
   ├── logbook.controller.ts (CRUD)
   ├── logbook.service.ts
   ├── entities/logbook-entry.entity.ts (table logbook_entries)
   └── dto/ (validation)

✅ Common (composants partagés)
   ├── guards/jwt-auth.guard.ts (protection routes)
   ├── decorators/public.decorator.ts (@Public)
   └── decorators/current-user.decorator.ts (@CurrentUser)
```

### 🎯 Fonctionnalités implémentées

- ✅ **Authentification JWT** complète (login + protection globale)
- ✅ **5 modules CRUD** complets avec toutes les routes du Swagger
- ✅ **Validation automatique** des données (class-validator)
- ✅ **Documentation Swagger** générée automatiquement
- ✅ **Règles métier** du cahier des charges :
  - BF26 : Interdiction sortie sans bateau
  - BF27 : Interdiction bateau sans permis
  - BF19 : Routes pour récupérer ressources d'un user
  - BN6 : Anonymisation RGPD
- ✅ **Filtres de recherche** sur toutes les ressources
- ✅ **Relations TypeORM** entre entités

---

## 🏁 Étapes pour démarrer

### 1. Installer PostgreSQL

Si ce n'est pas déjà fait :

**Windows :**
```bash
# Télécharger depuis https://www.postgresql.org/download/windows/
# Ou via chocolatey :
choco install postgresql
```

**Mac :**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux :**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE fisherfans;

# Créer un utilisateur (optionnel)
CREATE USER fisherfans WITH PASSWORD 'fisherfans';
GRANT ALL PRIVILEGES ON DATABASE fisherfans TO fisherfans;

# Quitter
\q
```

### 3. Configurer les variables d'environnement

Le fichier `.env` est déjà créé avec les valeurs par défaut :

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=fisherfans
DATABASE_PASSWORD=fisherfans
DATABASE_NAME=fisherfans

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=3600

PORT=8443
```

**Si vos paramètres PostgreSQL sont différents, modifiez `.env` !**

### 4. Installer les dépendances (déjà fait)

Les dépendances sont déjà installées. Si besoin de réinstaller :

```bash
npm install
```

### 5. Démarrer l'API

```bash
npm run start:dev
```

**L'API démarre sur http://localhost:8443** 🎉

### 6. Accéder à la documentation Swagger

Ouvrez votre navigateur sur :

**http://localhost:8443/api-docs**

Vous verrez toutes les routes documentées avec la possibilité de les tester directement !

---

## 🧪 Tester l'API

### Option 1 : Via Swagger UI (recommandé)

1. Aller sur http://localhost:8443/api-docs
2. Tester la route **POST /auth/v1/login** :
   - D'abord créer un utilisateur via **POST /v1/users** (public)
   - Puis se connecter pour obtenir le token JWT
3. Cliquer sur **Authorize** en haut à droite
4. Coller le token dans le champ `Value: Bearer <token>`
5. Tester les autres routes protégées

### Option 2 : Via curl/Postman

**Créer un utilisateur :**
```bash
curl -X POST http://localhost:8443/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "lastName": "Dupont",
    "firstName": "Jean",
    "email": "jean@example.com",
    "password": "password123",
    "city": "Nice",
    "status": "individual"
  }'
```

**Se connecter :**
```bash
curl -X POST http://localhost:8443/api/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "password123"
  }'
```

Réponse :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Utiliser une route protégée :**
```bash
curl -X GET http://localhost:8443/api/v1/users \
  -H "Authorization: Bearer <votre-token-ici>"
```

---

## 📚 Documentation

### Guides disponibles

1. **README_API.md** : Vue d'ensemble et référence rapide
2. **GUIDE_COMPLET.md** : Guide pédagogique complet avec explications détaillées
3. **DEMARRAGE.md** : Ce fichier

### Concepts NestJS expliqués

Consultez le **GUIDE_COMPLET.md** pour comprendre :

- Qu'est-ce qu'un **Module**, **Controller**, **Service** ?
- Comment fonctionne l'**injection de dépendances** ?
- Comment fonctionnent les **DTOs** et la validation ?
- Comment fonctionne l'**authentification JWT** avec Passport ?
- Comparaison avec **FastAPI** et **Express**

---

## 🔧 Commandes utiles

```bash
# Développement avec hot-reload (auto-restart quand vous modifiez le code)
npm run start:dev

# Build de production
npm run build

# Lancer en production
npm run start:prod

# Tests
npm run test

# Format du code
npm run format

# Lint
npm run lint
```

---

## 🐛 Problèmes courants

### Erreur : "Cannot connect to database"

**Solution :**
1. Vérifier que PostgreSQL est lancé : `pg_isready`
2. Vérifier que la DB existe : `psql -U postgres -l | grep fisherfans`
3. Vérifier les identifiants dans `.env`

### Erreur : "Port 8443 already in use"

**Solution :**
1. Modifier `PORT=8443` dans `.env` (ex: `PORT=3000`)
2. Ou tuer le processus : `lsof -ti:8443 | xargs kill -9`

### Erreur : "Cannot find module"

**Solution :**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Les modifications ne se reflètent pas

**Solution :**
Le mode `start:dev` devrait auto-reload. Sinon, redémarrez manuellement :
```bash
# Ctrl+C pour arrêter
npm run start:dev
```

---

## 🎓 Pour aller plus loin

### Ajouter un nouveau module

```bash
# Génère automatiquement : module, controller, service, entity, DTOs
nest generate resource nom-module
```

### Modifier les entités

Après modification d'une entité (ajout/suppression de colonne) :

**En développement** (synchronize: true dans app.module.ts) :
- Les tables se mettent à jour automatiquement au redémarrage

**En production** :
- Utiliser les migrations TypeORM :
```bash
npm run typeorm migration:generate -- -n NomMigration
npm run typeorm migration:run
```

### Ajouter une règle métier

**Exemple :** Interdire la réservation si le trip est complet

1. Ouvrir `bookings.service.ts`
2. Dans `create()`, ajouter :
```typescript
const trip = await this.tripRepository.findOne({ where: { id: tripId } });
const bookingsCount = await this.bookingRepository.count({ where: { tripId } });

if (bookingsCount >= trip.passengerCount) {
  throw new ForbiddenException({
    businessCode: 'TRIP_FULL',
    message: 'This trip is fully booked'
  });
}
```

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] Changer `JWT_SECRET` dans `.env` avec une valeur aléatoire sécurisée
- [ ] Mettre `synchronize: false` dans `app.module.ts` (TypeORM)
- [ ] Utiliser des migrations TypeORM
- [ ] Configurer HTTPS (certificat SSL)
- [ ] Activer CORS si nécessaire : `app.enableCors()` dans `main.ts`
- [ ] Configurer les variables d'environnement du serveur
- [ ] Build : `npm run build`
- [ ] Démarrer : `npm run start:prod`

---

## 🎉 Félicitations !

Votre API Fisher Fans est prête à être utilisée et développée !

**Prochaines étapes suggérées :**

1. Tester toutes les routes via Swagger
2. Lire le GUIDE_COMPLET.md pour comprendre en profondeur
3. Ajouter vos propres fonctionnalités
4. Écrire des tests unitaires et e2e

**Bon développement ! 🚀**

---

*En cas de problème, consultez le GUIDE_COMPLET.md ou ouvrez une issue sur GitHub.*
