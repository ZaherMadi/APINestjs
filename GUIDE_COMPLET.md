# 🎣 Guide Complet - API Fisher Fans avec NestJS

> Guide pédagogique pour comprendre l'implémentation complète de l'API Fisher Fans avec NestJS
> Destiné aux développeurs connaissant FastAPI et Express

## 📚 Table des matières

1. [Introduction à NestJS](#introduction-à-nestjs)
2. [Architecture du projet](#architecture-du-projet)
3. [Concepts clés de NestJS](#concepts-clés-de-nestjs)
4. [Installation et démarrage](#installation-et-démarrage)
5. [Authentification JWT](#authentification-jwt)
6. [Modules et Ressources](#modules-et-ressources)
7. [Règles métier implémentées](#règles-métier-implémentées)
8. [Comparaison avec FastAPI et Express](#comparaison-avec-fastapi-et-express)
9. [Tests et déploiement](#tests-et-déploiement)

---

## 🎯 Introduction à NestJS

### Qu'est-ce que NestJS ?

NestJS est un framework Node.js pour construire des applications backend **scalables** et **maintenables**. Il utilise TypeScript par défaut et s'inspire d'Angular côté backend.

### Pourquoi NestJS plutôt qu'Express ou FastAPI ?

| Caractéristique | Express | FastAPI | NestJS |
|----------------|---------|---------|--------|
| **Langage** | JavaScript/TypeScript | Python | TypeScript natif |
| **Architecture** | Libre | Libre | Imposée (MVC modulaire) |
| **Injection de dépendances** | Manuel | Via FastAPI Depends | Natif avec décorateurs |
| **Validation** | Manuelle (joi, etc.) | Pydantic automatique | class-validator automatique |
| **Documentation** | Swagger séparé | OpenAPI automatique | Swagger intégré |
| **Structure** | Aucune | Suggérée | Imposée par modules |

**NestJS = Express + Structure + TypeScript + Outils intégrés**

---

## 🏗️ Architecture du projet

### Structure des dossiers

```
src/
├── main.ts                    # Point d'entrée (comme app.py dans FastAPI)
├── app.module.ts              # Module racine (regroupe tous les modules)
│
├── common/                    # Éléments partagés par tous les modules
│   ├── guards/               # Guards pour protéger les routes (auth)
│   │   └── jwt-auth.guard.ts
│   └── decorators/           # Décorateurs personnalisés
│       ├── public.decorator.ts      # @Public() pour routes publiques
│       └── current-user.decorator.ts # @CurrentUser() pour récupérer l'user
│
└── modules/                   # Modules métier de l'API
    ├── auth/                 # Module d'authentification
    │   ├── auth.module.ts
    │   ├── auth.controller.ts       # Routes /auth/v1/login
    │   ├── auth.service.ts          # Logique métier (vérif password, JWT)
    │   ├── dto/
    │   │   └── login.dto.ts         # Validation des données login
    │   └── strategies/
    │       └── jwt.strategy.ts      # Stratégie Passport pour JWT
    │
    ├── users/                # Module utilisateurs
    │   ├── users.module.ts
    │   ├── users.controller.ts      # Routes CRUD utilisateurs
    │   ├── users.service.ts         # Logique métier
    │   ├── entities/
    │   │   └── user.entity.ts       # Entité TypeORM (table users)
    │   └── dto/
    │       ├── create-user.dto.ts   # Validation création user
    │       └── update-user.dto.ts
    │
    ├── boats/                # Module bateaux
    ├── trips/                # Module sorties pêche
    ├── bookings/             # Module réservations
    └── logbook/              # Module carnet de pêche
```

### Comparaison avec FastAPI

**FastAPI :**
```python
# app.py
from fastapi import FastAPI, Depends
from routers import users, boats  # Import des routers

app = FastAPI()
app.include_router(users.router)
app.include_router(boats.router)
```

**NestJS :**
```typescript
// app.module.ts
@Module({
  imports: [UsersModule, BoatsModule]  // Import des modules
})
export class AppModule {}
```

---

## 🔑 Concepts clés de NestJS

### 1. Les Modules

Un **module** est un conteneur qui organise le code par fonctionnalité.

**Analogie FastAPI :** Un module NestJS ≈ Un router FastAPI

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],  // Dépendances
  controllers: [UsersController],                 // Routes HTTP
  providers: [UsersService],                      // Services injectables
  exports: [UsersService]                         // Ce qu'on rend dispo aux autres
})
export class UsersModule {}
```

### 2. Les Controllers

Un **controller** gère les requêtes HTTP et retourne des réponses.

**Comparaison :**

**FastAPI :**
```python
@router.get("/users/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    return db.query(User).filter(User.id == user_id).first()
```

**NestJS :**
```typescript
@Controller('v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }
}
```

**Différences clés :**
- NestJS sépare la logique HTTP (controller) de la logique métier (service)
- L'injection de dépendances se fait via le constructeur
- Les décorateurs (`@Get`, `@Post`) définissent les routes

### 3. Les Services

Un **service** contient la logique métier. Il est injectable dans les controllers.

**Analogie :** Service NestJS ≈ Fonction métier dans FastAPI

```typescript
@Injectable()  // Rend la classe injectable
export class UsersService {
  constructor(
    @InjectRepository(User)  // Injection du repository
    private userRepository: Repository<User>
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    return user;
  }
}
```

### 4. Les DTOs (Data Transfer Objects)

Les **DTOs** définissent la structure des données et les valident automatiquement.

**Comparaison :**

**FastAPI (Pydantic) :**
```python
from pydantic import BaseModel, EmailStr

class CreateUserDto(BaseModel):
    email: EmailStr
    password: str
```

**NestJS (class-validator) :**
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**Point important :** NestJS valide **automatiquement** grâce au `ValidationPipe` dans `main.ts`.

### 5. Les Entities (TypeORM)

Une **entity** représente une table de base de données.

**Comparaison :**

**FastAPI (SQLAlchemy) :**
```python
from sqlalchemy import Column, String
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True)
```

**NestJS (TypeORM) :**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;
}
```

### 6. Les Guards

Un **guard** contrôle l'accès aux routes (authentification, autorisation).

**Analogie :** Guard NestJS ≈ Depends() dans FastAPI

**FastAPI :**
```python
from fastapi import Depends
from auth import get_current_user

@router.get("/profile")
async def get_profile(user = Depends(get_current_user)):
    return user
```

**NestJS :**
```typescript
@UseGuards(JwtAuthGuard)  // Applique le guard JWT
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

Dans notre API, **toutes les routes sont protégées par défaut** grâce à :
```typescript
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

Pour rendre une route publique, on utilise `@Public()`.

---

## 🚀 Installation et démarrage

### Prérequis

- Node.js 16+ et npm
- PostgreSQL (ou modifier app.module.ts pour une autre DB)

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/ZaherMadi/APINestjs.git
cd APINestjs

# 2. Installer les dépendances
npm install

# 3. Configurer la base de données
# Créer une DB PostgreSQL nommée "fisherfans"
createdb fisherfans

# 4. Copier et configurer .env
cp .env.example .env
# Modifier DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD si nécessaire

# 5. Démarrer en mode développement
npm run start:dev
```

L'API démarre sur `http://localhost:8443` et la doc Swagger sur `http://localhost:8443/api-docs`.

### Comprendre le démarrage (main.ts)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);  // 1. Crée l'app

  app.setGlobalPrefix('api');                       // 2. Préfixe /api

  app.useGlobalPipes(new ValidationPipe({           // 3. Validation auto
    whitelist: true,                                // Supprime champs inconnus
    transform: true,                                // Transforme les types
  }));

  // 4. Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Fisher Fans API')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(8443);                           // 5. Démarre le serveur
}
```

**Équivalent FastAPI :**
```python
app = FastAPI()

@app.get("/users")  # FastAPI ajoute automatiquement /docs
async def get_users():
    pass

uvicorn.run(app, port=8443)
```

---

## 🔐 Authentification JWT

### Architecture de l'authentification

L'authentification dans NestJS utilise **Passport** (comme dans Express) avec 3 composants :

1. **JwtStrategy** : Définit comment vérifier le token
2. **JwtAuthGuard** : Protège les routes
3. **AuthService** : Génère et valide les tokens

### Flux d'authentification

```
┌──────────────┐
│ POST /login  │
│ email/pass   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  AuthService.login() │
│  1. Vérifie email    │
│  2. Compare password │
│  3. Génère JWT       │
└──────┬───────────────┘
       │
       ▼
  ┌────────────┐
  │ JWT Token  │
  └────────────┘
       │
       ▼ (Client stocke le token et l'envoie dans les requêtes suivantes)
       │
┌──────────────────────────┐
│ GET /users/:id           │
│ Header: Authorization:   │
│ Bearer <token>           │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  JwtAuthGuard            │
│  1. Extrait le token     │
│  2. Vérifie signature    │
│  3. Vérifie expiration   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  JwtStrategy.validate()  │
│  1. Décode le payload    │
│  2. Récupère l'user DB   │
│  3. Injecte dans req.user│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Controller              │
│  @CurrentUser() user     │
│  → user est dispo !      │
└──────────────────────────┘
```

### Implémentation

**1. Création du token (auth.service.ts) :**

```typescript
async login(loginDto: LoginDto) {
  // 1. Vérifier les identifiants
  const user = await this.userRepository.findOne({
    where: { email: loginDto.email },
    select: ['id', 'email', 'password']  // Inclure password normalement exclu
  });

  if (!user || !await bcrypt.compare(loginDto.password, user.password)) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 2. Créer le payload JWT
  const payload = {
    sub: user.id,      // "sub" = subject (convention JWT)
    email: user.email
  };

  // 3. Signer le token
  const accessToken = this.jwtService.sign(payload);

  return { accessToken, expiresIn: 3600 };
}
```

**2. Vérification du token (jwt.strategy.ts) :**

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Où chercher le token
      secretOrKey: process.env.JWT_SECRET,                       // Clé pour vérifier
    });
  }

  // Appelé automatiquement si le token est valide
  async validate(payload: any) {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    return user;  // Injecté dans req.user
  }
}
```

**3. Protection globale (auth.module.ts) :**

```typescript
@Module({
  providers: [
    {
      provide: APP_GUARD,          // Applique à TOUTES les routes
      useClass: JwtAuthGuard,
    }
  ]
})
export class AuthModule {}
```

**4. Route publique :**

```typescript
@Public()  // Exempte du JwtAuthGuard
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### Comparaison avec FastAPI

**FastAPI :**
```python
from fastapi import Depends, HTTPException
from jose import jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401)
    return user

@app.get("/profile")
async def profile(user = Depends(get_current_user)):
    return user
```

**NestJS :**
- Passport gère l'extraction et la vérification automatiquement
- Le guard s'applique globalement ou par route
- `@CurrentUser()` remplace `Depends(get_current_user)`

---

## 📦 Modules et Ressources

### Module Users

**Responsabilités :**
- CRUD utilisateurs
- Recherche avec filtres (BF20)
- Suppression avec anonymisation RGPD (BF8, BN6)
- Routes pour récupérer les ressources d'un user (BF19)

**Routes principales :**

```typescript
POST   /api/v1/users                  // Création (public)
GET    /api/v1/users?lastName=...     // Recherche avec filtres
GET    /api/v1/users/:userId           // Détails user
PATCH  /api/v1/users/:userId           // Mise à jour
DELETE /api/v1/users/:userId           // Suppression (anonymisation)
GET    /api/v1/users/:userId/boats     // Bateaux de l'user (BF19)
GET    /api/v1/users/:userId/trips     // Sorties de l'user (BF19)
GET    /api/v1/users/:userId/bookings  // Réservations de l'user (BF19)
```

**Logique de suppression RGPD :**

```typescript
async remove(id: string, currentUserId: string): Promise<void> {
  if (id !== currentUserId) {
    throw new ForbiddenException('You can only delete your own account');
  }

  const user = await this.findOne(id);

  // Anonymisation au lieu de suppression physique
  user.lastName = 'ANONYME';
  user.firstName = 'ANONYME';
  user.email = `deleted_${Date.now()}@anonymized.com`;
  user.phone = null;
  user.boatLicenseNumber = null;
  // ... autres champs

  await this.userRepository.save(user);
}
```

**Pourquoi anonymiser plutôt que supprimer ?**
- Préserve l'intégrité référentielle (bateaux, sorties, etc. restent valides)
- Conforme RGPD (données personnelles effacées)
- Garde les statistiques anonymes

### Module Boats

**Règle métier BF27 :** Interdire la création de bateau sans permis.

```typescript
async create(createBoatDto: CreateBoatDto, userId: string): Promise<Boat> {
  const user = await this.userRepository.findOne({ where: { id: userId } });

  if (!user.boatLicenseNumber) {
    throw new ForbiddenException({
      code: '403',
      businessCode: 'PERMIT_REQUIRED',
      message: 'Boat license is required to create a boat'
    });
  }

  // ... création du bateau
}
```

**BF24 : Recherche géographique (bounding box) :**

```typescript
if (filters?.minLat && filters?.maxLat && filters?.minLng && filters?.maxLng) {
  query.andWhere(
    'boat.latitude BETWEEN :minLat AND :maxLat AND boat.longitude BETWEEN :minLng AND :maxLng',
    { minLat: filters.minLat, maxLat: filters.maxLat, /* ... */ }
  );
}
```

### Module Trips

**Règle métier BF26 :** Interdire la création de sortie sans bateau.

```typescript
async create(createTripDto: CreateTripDto, userId: string): Promise<Trip> {
  // Vérifier que l'user a au moins un bateau
  const userBoats = await this.boatRepository.count({ where: { ownerId: userId } });

  if (userBoats === 0) {
    throw new ForbiddenException({
      code: '403',
      businessCode: 'USER_HAS_NO_BOAT',
      message: 'User must own a boat to create trips'
    });
  }

  // ... création de la sortie
}
```

### Module Bookings

**Calcul automatique du prix :**

```typescript
async create(createBookingDto: CreateBookingDto, userId: string): Promise<Booking> {
  const trip = await this.tripRepository.findOne({ where: { id: createBookingDto.tripId } });

  const totalPrice = trip.price * createBookingDto.seats;  // Calcul auto

  const booking = this.bookingRepository.create({
    ...createBookingDto,
    userId,
    totalPrice  // Stocké en DB
  });

  return this.bookingRepository.save(booking);
}
```

### Module Logbook

Simple CRUD sans règle métier particulière. Le carnet de pêche enregistre les prises :

```typescript
@Entity('logbook_entries')
export class LogbookEntry {
  @Column()
  fishSpecies: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'date' })
  fishingDate: Date;

  @Column({ default: false })
  released: boolean;  // Poisson relâché ?

  // ... autres champs
}
```

---

## ⚖️ Règles métier implémentées

### BF1 : API privée (authentification)

✅ **Implémenté via `JwtAuthGuard` global**

Toutes les routes nécessitent un token JWT sauf celles marquées `@Public()` :
- POST /auth/v1/login
- POST /v1/users (création compte)

### BF20-BF24 : Filtres de recherche

✅ **Implémenté dans tous les modules**

Exemple Users :
```typescript
async findAll(filters?: { lastName?: string; city?: string; status?: string }) {
  const query = this.userRepository.createQueryBuilder('user');

  if (filters?.lastName) {
    query.andWhere('user.lastName ILIKE :lastName', { lastName: `%${filters.lastName}%` });
  }
  // ... autres filtres

  return query.getMany();
}
```

### BF25 : Codes d'erreur métier

✅ **Implémenté avec exceptions personnalisées**

```typescript
throw new ForbiddenException({
  code: '403',
  businessCode: 'PERMIT_REQUIRED',  // Code métier spécifique
  message: 'Boat license is required to create a boat'
});
```

### BF26 : Interdiction sortie sans bateau

✅ **Vérifié dans `TripsService.create()`**

### BF27 : Interdiction bateau sans permis

✅ **Vérifié dans `BoatsService.create()`**

### BN6 : RGPD - Anonymisation

✅ **Implémenté dans `UsersService.remove()`**

---

## 🔄 Comparaison avec FastAPI et Express

### Création d'une route simple

**Express :**
```javascript
app.get('/users/:id', async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
  res.json(user);
});
```

**FastAPI :**
```python
@app.get("/users/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404)
    return user
```

**NestJS :**
```typescript
@Controller('v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    return user;
  }
}
```

**Observations :**
- **Express** : Tout dans la route (rapide mais pas scalable)
- **FastAPI** : Dépendances via `Depends()`, validation Pydantic
- **NestJS** : Séparation stricte controller/service, injection automatique

### Validation des données

**Express (manuel avec joi) :**
```javascript
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const { error } = schema.validate(req.body);
if (error) return res.status(400).json(error);
```

**FastAPI (automatique avec Pydantic) :**
```python
class CreateUserDto(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

@app.post("/users")
async def create_user(data: CreateUserDto):  # Validation auto
    pass
```

**NestJS (automatique avec class-validator) :**
```typescript
class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}

@Post()
async create(@Body() createUserDto: CreateUserDto) {  // Validation auto
  return this.usersService.create(createUserDto);
}
```

**NestJS et FastAPI** valident automatiquement, contrairement à Express.

### Injection de dépendances

**Express (manuel) :**
```javascript
const userService = require('./user.service');

app.get('/users', (req, res) => {
  const users = userService.getAll();
  res.json(users);
});
```

**FastAPI (via Depends) :**
```python
def get_user_service():
    return UserService()

@app.get("/users")
async def get_users(service: UserService = Depends(get_user_service)):
    return service.get_all()
```

**NestJS (via constructeur) :**
```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}  // Injection auto

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

**Avantage NestJS :** L'injection est native et gérée par le framework.

---

## 🧪 Tests et déploiement

### Lancer les tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Structure de test

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: Repository }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a user', async () => {
    const dto = { email: 'test@test.com', password: 'password' };
    const user = await service.create(dto);
    expect(user.email).toBe(dto.email);
  });
});
```

### Build et déploiement

```bash
# Build de production
npm run build

# Démarrer en production
npm run start:prod
```

**Fichiers générés dans `dist/` (comme avec TypeScript classique).**

---

## 📝 Résumé des concepts

| Concept | Express | FastAPI | NestJS | Rôle |
|---------|---------|---------|--------|------|
| **Route** | `app.get()` | `@app.get()` | `@Get()` dans Controller | Définit un endpoint |
| **Validation** | Joi manuel | Pydantic auto | class-validator auto | Valide les données |
| **Logique métier** | Dans route | Fonction séparée | Service injectable | Traite les données |
| **ORM** | Knex/Sequelize | SQLAlchemy | TypeORM | Accès base de données |
| **Auth** | Passport manuel | Depends() | Guard + Strategy | Protège les routes |
| **Documentation** | Swagger séparé | OpenAPI auto | Swagger intégré | Doc API |
| **DI** | Manuel | Depends() | Automatique | Injection dépendances |

**NestJS = Structure + TypeScript + Outils intégrés**

---

## 🎓 Pour aller plus loin

### Commandes utiles

```bash
# Générer un nouveau module complet (controller + service + module)
nest generate resource nom-module

# Générer un service seul
nest generate service nom-service

# Générer un guard
nest generate guard nom-guard
```

### Ressources

- [Documentation officielle NestJS](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Class-validator GitHub](https://github.com/typestack/class-validator)
- [Passport JWT](https://www.passportjs.org/packages/passport-jwt/)

---

## 🐛 Dépannage

### Erreur : "Cannot connect to database"

Vérifier `.env` et que PostgreSQL tourne :
```bash
# Vérifier si PostgreSQL est lancé
pg_isready

# Créer la base si elle n'existe pas
createdb fisherfans
```

### Erreur : "JWT must be provided"

Le token JWT n'est pas dans le header `Authorization`. Vérifier :
```
Authorization: Bearer <votre-token-ici>
```

### Erreur : "Circular dependency"

Si deux modules s'importent mutuellement, utiliser `forwardRef()` :
```typescript
@Module({
  imports: [forwardRef(() => BoatsModule)],
})
export class UsersModule {}
```

---

## 🎯 Conclusion

Vous avez maintenant une API REST complète avec :

✅ Authentification JWT globale
✅ CRUD complet sur 5 ressources (Users, Boats, Trips, Bookings, Logbook)
✅ Filtres de recherche avancés
✅ Règles métier du cahier des charges (BF26, BF27)
✅ Conformité RGPD (anonymisation)
✅ Documentation Swagger automatique
✅ Validation automatique des données
✅ Architecture modulaire et scalable

**NestJS impose une structure, mais c'est justement sa force pour les projets d'entreprise.**

Bon développement ! 🚀
