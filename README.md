# APINestjs
Une API dans le cadre du programme M2 Dev - YNOV CAMPUS - Sophia

## 📋 Table des matières
- [Installation](#installation)
- [Démarrage du projet](#démarrage-du-projet)
- [Commandes utiles](#commandes-utiles)
- [Structure du projet](#structure-du-projet)
- [Comparaison NestJS vs Express.js](#comparaison-nestjs-vs-expressjs)

## 🚀 Installation

### Prérequis
- Node.js (version 16.x ou supérieure)
- npm ou yarn

### Installation du projet
```bash
# Cloner le repository
git clone https://github.com/ZaherMadi/APINestjs.git
cd APINestjs

# Installer les dépendances
npm install
# ou
yarn install
```

### Créer un nouveau projet NestJS (si nécessaire)
```bash
# Installer la CLI NestJS globalement
npm install -g @nestjs/cli

# Créer un nouveau projet
nest new nom-du-projet
```

## 🏃 Démarrage du projet

```bash
# Mode développement (avec hot-reload)
npm run start:dev
# ou
yarn start:dev

# Mode production
npm run start:prod
# ou
yarn start:prod

# Mode debug
npm run start:debug
# ou
yarn start:debug
```

Par défaut, l'application sera accessible sur `http://localhost:3000`

## 🛠️ Commandes utiles

### Génération de ressources

```bash
# Générer un module complet (contrôleur, service, module, DTO, entité)
nest generate resource nom-ressource

# Générer un module
nest generate module nom-module

# Générer un contrôleur
nest generate controller nom-controller

# Générer un service
nest generate service nom-service

# Générer un middleware
nest generate middleware nom-middleware

# Générer un guard
nest generate guard nom-guard

# Générer un interceptor
nest generate interceptor nom-interceptor

# Générer un pipe
nest generate pipe nom-pipe

# Générer un filter
nest generate filter nom-filter

# Générer un decorator
nest generate decorator nom-decorator
```

### Tests

```bash
# Lancer tous les tests
npm run test
# ou
yarn test

# Tests en mode watch
npm run test:watch
# ou
yarn test:watch

# Tests de couverture
npm run test:cov
# ou
yarn test:cov

# Tests e2e (end-to-end)
npm run test:e2e
# ou
yarn test:e2e
```

### Build et Linting

```bash
# Build du projet
npm run build
# ou
yarn build

# Linter le code
npm run lint
# ou
yarn lint

# Formater le code
npm run format
# ou
yarn format
```

### Base de données (avec TypeORM)

```bash
# Générer une migration
npm run typeorm -- migration:generate --name NomDeLaMigration

# Exécuter les migrations
npm run typeorm -- migration:run

# Annuler la dernière migration
npm run typeorm -- migration:revert

# Créer une entité
nest generate class entities/nom-entite --no-spec
```

## 📁 Structure du projet

```
src/
├── app.module.ts           # Module racine de l'application
├── app.controller.ts       # Contrôleur principal
├── app.service.ts          # Service principal
├── main.ts                 # Point d'entrée de l'application
├── modules/                # Modules métier
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   └── ...
├── common/                 # Éléments partagés
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── pipes/
│   └── decorators/
└── config/                 # Configuration
    └── database.config.ts
```

## 🔄 Comparaison NestJS vs Express.js

### 🎯 Philosophie et approche

#### Express.js
- **Minimaliste** : Framework léger et flexible
- **Non-opinionné** : Liberté totale dans l'organisation du code
- **Bas niveau** : Contrôle direct sur les requêtes/réponses
- **Simplicité** : Courbe d'apprentissage douce

#### NestJS
- **Structure imposée** : Architecture MVC bien définie
- **Opinionné** : Pattern et organisation standardisés
- **Haut niveau** : Abstractions pour gérer la complexité
- **TypeScript natif** : Typage fort et décorateurs

### 🏗️ Architecture et structure

#### Express.js
```javascript
// Structure typique Express.js
const express = require('express');
const app = express();

// Routes définies directement
app.get('/users', (req, res) => {
  // Logique métier dans la route
  res.json({ users: [] });
});

app.post('/users', (req, res) => {
  // Logique métier directement ici
  res.json({ created: true });
});

app.listen(3000);
```

**Caractéristiques** :
- Routes déclarées de manière procédurale
- Pas de séparation obligatoire des responsabilités
- Middleware chainés manuellement
- Logique métier souvent mélangée avec les routes

#### NestJS
```typescript
// Structure NestJS - Contrôleur
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

// Service séparé
@Injectable()
export class UsersService {
  findAll() {
    // Logique métier ici
    return [];
  }

  create(createUserDto: CreateUserDto) {
    // Logique métier ici
    return { created: true };
  }
}

// Module qui lie tout ensemble
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

**Caractéristiques** :
- Architecture en couches (Controller → Service → Repository)
- Injection de dépendances native
- Décorateurs pour la configuration
- Séparation claire des responsabilités

### 🔧 Conception et patterns

| Aspect | Express.js | NestJS |
|--------|-----------|--------|
| **Architecture** | Libre, souvent MVC fait maison | MVC strict avec modules |
| **Injection de dépendances** | Manuel ou via librairies tierces | Native avec décorateurs |
| **TypeScript** | Support optionnel | Natif et recommandé |
| **Middleware** | Fonctions chaînées | Guards, Interceptors, Pipes |
| **Validation** | Librairies tierces (joi, express-validator) | class-validator intégré |
| **Documentation API** | Manuel ou swagger séparé | @nestjs/swagger intégré |
| **Tests** | Jest/Mocha configuré manuellement | Jest préconfigré |
| **Modularité** | Organisation libre | Modules obligatoires |
| **Scalabilité** | À organiser soi-même | Structure scalable par défaut |

### 📦 Gestion des dépendances

#### Express.js
```javascript
// Dépendances gérées manuellement
const userService = require('./services/userService');
const authMiddleware = require('./middleware/auth');

app.get('/users', authMiddleware, (req, res) => {
  const users = userService.getUsers();
  res.json(users);
});
```

#### NestJS
```typescript
// Injection de dépendances automatique
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}
  
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

### 🎭 Gestion des erreurs

#### Express.js
```javascript
// Middleware d'erreur personnalisé
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message
  });
});
```

#### NestJS
```typescript
// Exception filters standardisés
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    
    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
```

### ✅ Quand utiliser quoi ?

#### Choisir Express.js si :
- ✅ Projet simple ou prototype rapide
- ✅ Besoin de flexibilité maximale
- ✅ Équipe déjà expérimentée avec Express
- ✅ Microservice léger
- ✅ Pas besoin de structure imposée

#### Choisir NestJS si :
- ✅ Application complexe et scalable
- ✅ Équipe nombreuse nécessitant une structure claire
- ✅ Besoin de TypeScript strict
- ✅ Application enterprise avec beaucoup de modules
- ✅ Projet à long terme nécessitant maintenabilité
- ✅ Besoin d'outils intégrés (GraphQL, WebSockets, Microservices)

### 💡 Résumé

**Express.js** = Liberté et simplicité. Vous construisez votre propre architecture.

**NestJS** = Structure et conventions. L'architecture est déjà là, vous la suivez.

NestJS est essentiellement **Express.js avec une couche d'abstraction** qui impose une architecture Angular-like côté backend, offrant ainsi une meilleure organisation pour les applications complexes.

## 📚 Ressources utiles

- [Documentation officielle NestJS](https://docs.nestjs.com/)
- [Documentation Express.js](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [NestJS GitHub](https://github.com/nestjs/nest)

## 📝 License

Ce projet fait partie du programme M2 Dev - YNOV CAMPUS Sophia.
