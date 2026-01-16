# 🧪 Guide de Test - API Fisher Fans

## 🚀 Étape 1 : Redémarrer l'application

```bash
# Arrêter l'app (Ctrl+C)
# Puis relancer :
npm run start:dev
```

Attendez de voir :
```
🚀 Application is running on: http://localhost:8443
📚 Swagger documentation: http://localhost:8443/api-docs
```

## 📚 Étape 2 : Accéder à Swagger

Ouvrez votre navigateur sur : **http://localhost:8443/api-docs**

Vous devriez voir l'interface Swagger avec tous les endpoints.

## ✅ Étape 3 : Tester les routes PUBLIQUES (sans authentification)

### 3.1 Créer un utilisateur

1. **Trouver la route** : `POST /api/v1/users` (section Users)
2. **Cliquer sur** la route pour l'ouvrir
3. **Cliquer sur** "Try it out"
4. **Remplacer le JSON** par :

```json
{
  "lastName": "Dupont",
  "firstName": "Jean",
  "email": "jean.dupont@example.com",
  "password": "password123",
  "city": "Nice",
  "status": "individual",
  "boatLicenseNumber": "12345678"
}
```

5. **Cliquer sur** "Execute"

**Résultat attendu :**
- Code 201 (Created)
- Le JSON de l'utilisateur créé avec un `id`

**Note :** Le `boatLicenseNumber` est nécessaire pour pouvoir créer un bateau plus tard (règle BF27).

### 3.2 Se connecter (obtenir un token JWT)

1. **Trouver la route** : `POST /api/auth/v1/login` (section Authentication)
2. **Cliquer sur** "Try it out"
3. **Remplacer le JSON** par :

```json
{
  "email": "jean.dupont@example.com",
  "password": "password123"
}
```

4. **Cliquer sur** "Execute"

**Résultat attendu :**
- Code 200 (OK)
- Un objet avec `accessToken` et `expiresIn`

**IMPORTANT :** Copiez le contenu de `accessToken` (sans les guillemets)

Exemple :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

Copiez tout ce qui est entre les guillemets de `accessToken`.

## 🔐 Étape 4 : Autoriser Swagger avec le token JWT

1. **Chercher le bouton "Authorize"** en haut à droite de la page Swagger (icône de cadenas)
2. **Cliquer dessus**
3. **Coller le token** dans le champ `Value` :
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   ⚠️ **IMPORTANT** : Ajouter `Bearer ` (avec un espace) AVANT le token !

4. **Cliquer sur** "Authorize"
5. **Fermer** le popup

**Vous êtes maintenant authentifié !** 🎉

Tous les cadenas fermés 🔒 vont s'ouvrir 🔓.

## ✅ Étape 5 : Tester les routes PROTÉGÉES

Maintenant que vous êtes authentifié, toutes les routes vont fonctionner !

### 5.1 Récupérer la liste des utilisateurs

1. **Route** : `GET /api/v1/users`
2. **Cliquer sur** "Try it out"
3. **Cliquer sur** "Execute"

**Résultat attendu :**
- Code 200
- Un tableau avec votre utilisateur

### 5.2 Créer un bateau

1. **Route** : `POST /api/v1/boats`
2. **Cliquer sur** "Try it out"
3. **JSON** :

```json
{
  "name": "Sea Explorer",
  "boatType": "cabin",
  "maxCapacity": 8,
  "homePort": "Antibes",
  "latitude": 43.5804,
  "longitude": 7.1251,
  "equipment": ["gps", "sounder"]
}
```

4. **Cliquer sur** "Execute"

**Résultat attendu :**
- Code 201
- Le JSON du bateau créé

**Note :** Cela fonctionne car vous avez un `boatLicenseNumber` !

### 5.3 Tester la règle BF27 (interdiction sans permis)

Pour tester cette règle, il faut créer un utilisateur SANS permis :

1. **Route** : `POST /api/v1/users` (déconnectez-vous d'abord avec "Logout" dans Authorize)
2. **JSON** :

```json
{
  "lastName": "Martin",
  "firstName": "Pierre",
  "email": "pierre@example.com",
  "password": "password123",
  "city": "Nice",
  "status": "individual"
}
```

3. Connectez-vous avec ce nouvel utilisateur
4. Essayez de créer un bateau

**Résultat attendu :**
- Code 403 (Forbidden)
- Message : `"Boat license is required to create a boat"`
- Code métier : `PERMIT_REQUIRED`

### 5.4 Créer une sortie pêche

1. **Route** : `POST /api/v1/trips`
2. **JSON** :

```json
{
  "title": "Tuna Fishing Day",
  "tripType": "daily",
  "pricingType": "per_person",
  "passengerCount": 6,
  "price": 120.50,
  "boatId": "<coller-id-de-votre-bateau>"
}
```

**Note :** Remplacez `<coller-id-de-votre-bateau>` par l'`id` du bateau créé précédemment.

**Résultat attendu :**
- Code 201
- Le JSON de la sortie créée

### 5.5 Créer une réservation

1. **Route** : `POST /api/v1/bookings`
2. **JSON** :

```json
{
  "tripId": "<id-de-la-sortie>",
  "selectedDate": "2024-06-15",
  "seats": 2
}
```

**Résultat attendu :**
- Code 201
- Le `totalPrice` est calculé automatiquement : `120.50 * 2 = 241.00`

### 5.6 Créer une entrée dans le carnet de pêche

1. **Route** : `POST /api/v1/logbook`
2. **JSON** :

```json
{
  "fishSpecies": "Sea Bass",
  "weight": 2.5,
  "length": 45.5,
  "location": "Off Antibes",
  "fishingDate": "2024-06-15",
  "released": false
}
```

## 🔍 Étape 6 : Tester les filtres de recherche

### Recherche de bateaux par zone géographique (BF24)

**Route** : `GET /api/v1/boats`

Paramètres (cliquer sur "Try it out" et remplir) :
- `minLat`: 43.0
- `maxLat`: 44.0
- `minLng`: 7.0
- `maxLng`: 8.0

### Recherche d'utilisateurs par ville

**Route** : `GET /api/v1/users`

Paramètres :
- `city`: Nice

### Routes BF19 (ressources d'un utilisateur)

**Route** : `GET /api/v1/users/{userId}/boats`

Remplacez `{userId}` par votre ID utilisateur.

## ❌ Erreurs communes

### "NetworkError when attempting to fetch resource"

**Causes possibles :**

1. **L'application n'est pas démarrée**
   - Solution : Vérifier que `npm run start:dev` tourne

2. **Mauvais port**
   - Solution : Vérifier l'URL dans Swagger (haut de page)
   - Doit être : `http://localhost:8443/api`

3. **Token JWT manquant ou expiré**
   - Solution : Se reconnecter et ré-autoriser avec le nouveau token

4. **Token mal formaté**
   - Solution : Vérifier que vous avez bien `Bearer ` avant le token

### Code 401 (Unauthorized)

**Cause :** Token JWT manquant, invalide ou expiré

**Solution :**
1. Cliquer sur "Logout" dans le popup "Authorize"
2. Se reconnecter via `POST /api/auth/v1/login`
3. Copier le nouveau token
4. Re-cliquer sur "Authorize" et coller le nouveau token

### Code 403 (Forbidden)

**Causes possibles :**

1. **PERMIT_REQUIRED** : Vous essayez de créer un bateau sans permis
   - Solution : Ajouter `boatLicenseNumber` à votre utilisateur

2. **USER_HAS_NO_BOAT** : Vous essayez de créer une sortie sans bateau
   - Solution : Créer d'abord un bateau

3. **Modification d'une ressource qui ne vous appartient pas**
   - Solution : Modifier seulement vos propres ressources

### Code 422 (Validation Error)

**Cause :** Les données envoyées ne respectent pas le DTO

**Solutions :**
- Vérifier que tous les champs `required` sont présents
- Vérifier le format des emails
- Vérifier la longueur minimale des mots de passe (8 caractères)
- Vérifier les enums (ex: `status` doit être "individual" ou "professional")

## 📊 Résumé du workflow complet

```
1. POST /api/v1/users (public)
   → Créer un compte avec boatLicenseNumber

2. POST /api/auth/v1/login (public)
   → Obtenir un token JWT

3. Authorize dans Swagger
   → Coller "Bearer <token>"

4. POST /api/v1/boats
   → Créer un bateau

5. POST /api/v1/trips
   → Créer une sortie pêche

6. POST /api/v1/bookings
   → Créer une réservation

7. POST /api/v1/logbook
   → Ajouter une prise dans le carnet
```

## 🎉 Félicitations !

Si vous avez réussi toutes ces étapes, votre API fonctionne parfaitement !

Vous avez testé :
- ✅ L'authentification JWT
- ✅ Les routes publiques et protégées
- ✅ Les règles métier (BF26, BF27)
- ✅ Le calcul automatique des prix
- ✅ Les filtres de recherche
- ✅ Les routes BF19

**Bon développement ! 🚀**
