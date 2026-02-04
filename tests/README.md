# Tests API Fisher Fans - Pytest

## Outil de test choisi
**pytest** avec la librairie **requests** pour effectuer les appels HTTP vers l'API REST.

### Justification du choix
- **pytest** est un framework de test Python mature et largement utilise
- Syntaxe simple et lisible pour ecrire des tests
- Systeme de fixtures puissant pour gerer les donnees de test
- Generation de rapports HTML avec pytest-html
- Marqueurs pour categoriser les tests par besoin fonctionnel

## Installation

```bash
cd tests
pip install -r requirements.txt
```

## Lancer les tests

### Prerequis
1. L'API Fisher Fans doit etre demarree sur `https://localhost:8443/api`
2. La base de donnees PostgreSQL doit etre configuree

### Commandes

```bash
# Lancer tous les tests
pytest

# Lancer les tests avec rapport detaille
pytest -v

# Lancer les tests d'un BF specifique
pytest -m bf1       # Tests BF1 (authentification)
pytest -m bf3       # Tests BF3 (creation utilisateurs)
pytest -m bf26      # Tests BF26 (sortie sans bateau)
pytest -m bf27      # Tests BF27 (bateau sans permis)

# Lancer plusieurs marqueurs
pytest -m "bf26 or bf27"

# Generer un rapport HTML
pytest --html=report.html --self-contained-html

# Lancer un fichier de test specifique
pytest test_bf1_authentication.py
pytest test_bf25_26_27_business_rules.py
```

## Structure des tests

```
tests/
├── conftest.py                      # Fixtures et configuration
├── pytest.ini                       # Configuration pytest
├── requirements.txt                 # Dependances Python
├── README.md                        # Ce fichier
├── test_bf1_authentication.py       # BF1: API privee
├── test_bf2_7_crud_resources.py     # BF2-7: CRUD ressources
├── test_bf9_bf14_bf21_boats.py      # BF9, BF14, BF21: Operations bateaux
├── test_bf24_geographic_filter.py   # BF24: Filtrage geographique
└── test_bf25_26_27_business_rules.py # BF25-27: Erreurs et regles metier
```

## Besoins fonctionnels testes

| BF | Description | Fichier de test |
|----|-------------|-----------------|
| BF1 | API privee (authentification) | test_bf1_authentication.py |
| BF2 | Ressources exposees | test_bf2_7_crud_resources.py |
| BF3 | Creation utilisateurs | test_bf2_7_crud_resources.py |
| BF4 | Creation bateaux | test_bf2_7_crud_resources.py |
| BF5 | Creation sorties peche | test_bf2_7_crud_resources.py |
| BF6 | Creation reservations | test_bf2_7_crud_resources.py |
| BF7 | Creation carnet de peche | test_bf2_7_crud_resources.py |
| BF9 | Suppression bateau | test_bf9_bf14_bf21_boats.py |
| BF14 | Modification bateau | test_bf9_bf14_bf21_boats.py |
| BF21 | Filtrage bateaux | test_bf9_bf14_bf21_boats.py |
| BF24 | Filtrage geographique (bounding box) | test_bf24_geographic_filter.py |
| BF25 | Codes erreurs metier | test_bf25_26_27_business_rules.py |
| BF26 | Interdiction sortie sans bateau | test_bf25_26_27_business_rules.py |
| BF27 | Interdiction bateau sans permis | test_bf25_26_27_business_rules.py |

## Besoins non fonctionnels (tests manuels)

Les besoins suivants seront testes manuellement lors de la recette:

| BNF | Description | Methode de verification |
|-----|-------------|------------------------|
| BNF1 | API versionnee | Verifier les URLs /v1/* |
| BNF4 | Reponses JSON | Verifier Content-Type: application/json |
| BNF5 | Specification OAS 3.1 | Verifier le fichier YAML/JSON |

## Tests de gestion des erreurs

Les tests de gestion des erreurs sont particulierement importants pour BF25, BF26 et BF27:

### BF25 - Codes d'erreurs metier
- 401 Unauthorized: Acces sans token
- 403 Forbidden: Acces a une ressource non autorisee
- 404 Not Found: Ressource inexistante
- 409 Conflict: Email en doublon
- 400/422 Validation Error: Donnees invalides

### BF26 - Interdiction sortie sans bateau
- Verification du code 403 et du businessCode "USER_HAS_NO_BOAT"
- Test avec utilisateur ayant permis mais pas de bateau
- Test avec bateau d'un autre utilisateur

### BF27 - Interdiction bateau sans permis
- Verification du code 403 et du businessCode "PERMIT_REQUIRED"
- Test avec nouvel utilisateur sans permis
- Test apres ajout du permis au profil

## Exemple de sortie

```
========================= test session starts =========================
collected 65 items

test_bf1_authentication.py::TestBF1Authentication::test_login_success PASSED
test_bf1_authentication.py::TestBF1Authentication::test_login_failure_wrong_password PASSED
test_bf1_authentication.py::TestBF1Authentication::test_protected_endpoint_without_token PASSED
...
test_bf25_26_27_business_rules.py::TestBF27BoatWithoutPermit::test_create_boat_without_permit PASSED
test_bf25_26_27_business_rules.py::TestBF27BoatWithoutPermit::test_error_message_no_permit PASSED

========================= 65 passed in 45.23s =========================
```

## Configuration de l'API

L'URL de base de l'API est configuree dans `conftest.py`:

```python
BASE_URL = "https://localhost:8443/api"
API_VERSION = "v1"
```

Modifier ces valeurs si l'API est deployee sur un autre serveur.
