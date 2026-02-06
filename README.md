# Fisher Fans API

> **Le BlaBlaCar de la peche en mer** - API REST NestJS

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker** et **Docker Compose** (pour PostgreSQL)

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ZaherMadi/APINestjs.git
cd APINestjs
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Le fichier `.env` est deja configure avec les valeurs par defaut :

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

## Lancement

### Etape 1 : Demarrer la base de donnees PostgreSQL

**IMPORTANT** : La base de donnees doit etre lancee AVANT l'API.

```bash
# Aller dans le dossier database
cd database

# Lancer le container PostgreSQL
docker-compose up -d

# Revenir a la racine du projet
cd ..
```

Pour verifier que PostgreSQL est bien lance :

```bash
docker ps
```

Vous devriez voir `fisherfans-db` dans la liste.

### Etape 2 : Demarrer l'API

**Option A - Script automatique (Linux/Mac/Git Bash)** :

```bash
./start.sh
```

**Option B - Commande npm** :

```bash
# Mode developpement (hot-reload)
npm run start:dev

# Mode production
npm run build && npm run start:prod
```

### Etape 3 : Acceder aux services

| Service | URL | Identifiants |
|---------|-----|--------------|
| API | http://localhost:8443/api | - |
| Swagger UI | http://localhost:8443/api-docs | - |
| pgAdmin | http://localhost:5050 | admin@fisherfans.com / admin |
| OpenAPI JSON | ./docs/openapi.json | - |
| OpenAPI YAML | ./docs/openapi.yaml | - |
| Tests Report | ./tests/report.html | Apres `pytest --html=report.html` |

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run start` | Demarre l'API |
| `npm run start:dev` | Mode developpement avec hot-reload |
| `npm run start:prod` | Mode production |
| `npm run build` | Compile le projet |
| `npm run lint` | Verifie le code avec ESLint |
| `npm run format` | Formate le code avec Prettier |
| `npm run generate:oas` | Genere les fichiers OpenAPI (JSON/YAML) |

## Tests (Pytest)

Les tests d'integration verifient les Business Functions (BF1-BF27).

```bash
# Prerequis : installer les dependances Python
cd tests
pip install -r requirements.txt

# Executer tous les tests (API doit etre lancee)
pytest -v

# Executer avec rapport HTML
pytest -v --html=report.html

# Executer un fichier specifique
pytest test_bf1_authentication.py -v
```

### Fichiers de tests

| Fichier | Description |
|---------|-------------|
| `test_bf1_authentication.py` | Tests d'authentification JWT |
| `test_bf2_7_crud_resources.py` | Tests CRUD (Users, Boats, Trips, Bookings, Logbook) |
| `test_bf9_bf14_bf21_boats.py` | Tests specifiques aux bateaux |
| `test_bf24_geographic_filter.py` | Tests de filtrage geographique |
| `test_bf25_26_27_business_rules.py` | Tests des regles metier |

## Structure du projet

```
APINestjs/
├── database/
│   └── docker-compose.yml    # Configuration PostgreSQL
├── src/
│   ├── common/               # Guards, decorators partages
│   ├── modules/
│   │   ├── auth/             # Authentification JWT
│   │   ├── users/            # Gestion des utilisateurs
│   │   ├── boats/            # Gestion des bateaux
│   │   ├── trips/            # Sorties peche
│   │   ├── bookings/         # Reservations
│   │   └── logbook/          # Carnet de peche
│   ├── app.module.ts
│   └── main.ts
├── start.sh                  # Script de demarrage
├── .env                      # Variables d'environnement
└── package.json
```

## API Endpoints

| Module | Routes | Description |
|--------|--------|-------------|
| Auth | 1 | Login (JWT) |
| Users | 8 | CRUD utilisateurs |
| Boats | 5 | CRUD bateaux |
| Trips | 5 | CRUD sorties peche |
| Bookings | 5 | CRUD reservations |
| Logbook | 5 | CRUD carnet de peche |

**Total : 29 routes**

Voir la documentation complete sur **Swagger UI** : http://localhost:8443/api-docs

## Authentification

L'API utilise **JWT** (JSON Web Tokens).

1. Creer un compte : `POST /api/v1/users`
2. Se connecter : `POST /api/auth/v1/login`
3. Utiliser le token dans le header : `Authorization: Bearer <token>`

## Arreter les services

```bash
# Arreter l'API
Ctrl+C

# Arreter PostgreSQL
cd database
docker-compose down
```

## Troubleshooting

### Port 8443 deja utilise

```bash
# Windows
netstat -ano | findstr :8443
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8443 | xargs kill -9
```

Ou utiliser le script `./start.sh` qui gere ca automatiquement.

### Erreur de connexion a la base de donnees

1. Verifier que Docker est lance
2. Verifier que le container tourne : `docker ps`
3. Relancer le container : `cd database && docker-compose up -d`

---

**Auteur** : YNOV M2 Dev
**Version** : 3.0.0
