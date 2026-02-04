"""
Configuration et fixtures pytest pour les tests de l'API Fisher Fans
Outil de test choisi: pytest avec requests

Ce fichier contient toutes les fixtures necessaires pour tester l'API FF.
"""

import pytest
import requests
import uuid
import time
import urllib3

# Desactiver les warnings SSL pour les tests en local
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration de base de l'API
BASE_URL = "http://localhost:8443/api"
API_VERSION = "v1"


def get_url(endpoint: str) -> str:
    """Construit l'URL complete pour un endpoint."""
    if endpoint.startswith("/auth"):
        return f"{BASE_URL}{endpoint}"
    return f"{BASE_URL}/{API_VERSION}{endpoint}"


@pytest.fixture(scope="session")
def api_base_url():
    """URL de base de l'API."""
    return BASE_URL


@pytest.fixture(scope="session")
def unique_id():
    """Generateur d'identifiants uniques pour les tests."""
    def _generate():
        return str(uuid.uuid4())[:8]
    return _generate


@pytest.fixture(scope="module")
def test_user_data(unique_id):
    """Donnees pour creer un utilisateur de test."""
    uid = unique_id()
    return {
        "lastName": f"TestUser{uid}",
        "firstName": f"Prenom{uid}",
        "email": f"test.user.{uid}@fisherfans.test",
        "password": "TestPassword123!",
        "city": "Nice",
        "phone": "+33612345678",
        "status": "individual"
    }


@pytest.fixture(scope="module")
def test_user_with_permit_data(unique_id):
    """Donnees pour creer un utilisateur avec permis bateau."""
    uid = unique_id()
    return {
        "lastName": f"TestPermit{uid}",
        "firstName": f"PrenomPermit{uid}",
        "email": f"test.permit.{uid}@fisherfans.test",
        "password": "TestPassword123!",
        "city": "Marseille",
        "phone": "+33698765432",
        "status": "individual",
        "boatLicenseNumber": "12345678",
        "insuranceNumber": "ABC123456789"
    }


@pytest.fixture(scope="module")
def test_professional_user_data(unique_id):
    """Donnees pour creer un utilisateur professionnel."""
    uid = unique_id()
    return {
        "lastName": f"TestPro{uid}",
        "firstName": f"PrenomPro{uid}",
        "email": f"test.pro.{uid}@fisherfans.test",
        "password": "TestPassword123!",
        "city": "Antibes",
        "phone": "+33611223344",
        "status": "professional",
        "boatLicenseNumber": "87654321",
        "insuranceNumber": "XYZ987654321",
        "companyName": f"Societe{uid}",
        "activityType": "rental"
    }


@pytest.fixture(scope="module")
def created_user(test_user_data):
    """Cree un utilisateur de test et retourne ses donnees."""
    response = requests.post(
        get_url("/users"),
        json=test_user_data,
        verify=False
    )
    if response.status_code == 201:
        user = response.json()
        user["password"] = test_user_data["password"]
        return user
    return None


@pytest.fixture(scope="module")
def created_user_with_permit(test_user_with_permit_data):
    """Cree un utilisateur avec permis bateau."""
    response = requests.post(
        get_url("/users"),
        json=test_user_with_permit_data,
        verify=False
    )
    if response.status_code == 201:
        user = response.json()
        user["password"] = test_user_with_permit_data["password"]
        return user
    return None


@pytest.fixture(scope="module")
def created_professional_user(test_professional_user_data):
    """Cree un utilisateur professionnel."""
    response = requests.post(
        get_url("/users"),
        json=test_professional_user_data,
        verify=False
    )
    if response.status_code == 201:
        user = response.json()
        user["password"] = test_professional_user_data["password"]
        return user
    return None


@pytest.fixture(scope="module")
def auth_token(created_user):
    """Obtient un token JWT pour l'utilisateur de test."""
    if not created_user:
        return None

    response = requests.post(
        get_url("/auth/v1/login"),
        json={
            "email": created_user["email"],
            "password": created_user["password"]
        },
        verify=False
    )
    if response.status_code in [200, 201]:
        return response.json().get("accessToken")
    return None


@pytest.fixture(scope="module")
def auth_token_with_permit(created_user_with_permit):
    """Obtient un token JWT pour l'utilisateur avec permis."""
    if not created_user_with_permit:
        return None

    response = requests.post(
        get_url("/auth/v1/login"),
        json={
            "email": created_user_with_permit["email"],
            "password": created_user_with_permit["password"]
        },
        verify=False
    )
    if response.status_code in [200, 201]:
        return response.json().get("accessToken")
    return None


@pytest.fixture(scope="module")
def auth_token_professional(created_professional_user):
    """Obtient un token JWT pour l'utilisateur professionnel."""
    if not created_professional_user:
        return None

    response = requests.post(
        get_url("/auth/v1/login"),
        json={
            "email": created_professional_user["email"],
            "password": created_professional_user["password"]
        },
        verify=False
    )
    if response.status_code in [200, 201]:
        return response.json().get("accessToken")
    return None


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers d'authentification pour les requetes."""
    if not auth_token:
        return {}
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(scope="module")
def auth_headers_with_permit(auth_token_with_permit):
    """Headers d'authentification pour utilisateur avec permis."""
    if not auth_token_with_permit:
        return {}
    return {"Authorization": f"Bearer {auth_token_with_permit}"}


@pytest.fixture(scope="module")
def auth_headers_professional(auth_token_professional):
    """Headers d'authentification pour utilisateur professionnel."""
    if not auth_token_professional:
        return {}
    return {"Authorization": f"Bearer {auth_token_professional}"}


@pytest.fixture(scope="module")
def test_boat_data(unique_id):
    """Donnees pour creer un bateau de test."""
    uid = unique_id()
    return {
        "name": f"TestBoat{uid}",
        "description": "Bateau de test pour pytest",
        "brand": "TestBrand",
        "yearBuilt": 2020,
        "boatType": "open",
        "equipment": ["gps", "sounder", "vhf_radio"],
        "deposit": 500.00,
        "maxCapacity": 6,
        "bedCount": 2,
        "homePort": "Nice",
        "latitude": 43.7102,
        "longitude": 7.2620,
        "engineType": "diesel",
        "enginePower": 150
    }


@pytest.fixture(scope="module")
def test_boat_marseille_data(unique_id):
    """Donnees pour creer un bateau a Marseille (pour tests geographiques)."""
    uid = unique_id()
    return {
        "name": f"BoatMarseille{uid}",
        "description": "Bateau a Marseille",
        "boatType": "cabin",
        "maxCapacity": 8,
        "homePort": "Marseille",
        "latitude": 43.2965,
        "longitude": 5.3698
    }


@pytest.fixture(scope="module")
def test_boat_antibes_data(unique_id):
    """Donnees pour creer un bateau a Antibes (pour tests geographiques)."""
    uid = unique_id()
    return {
        "name": f"BoatAntibes{uid}",
        "description": "Bateau a Antibes",
        "boatType": "catamaran",
        "maxCapacity": 10,
        "homePort": "Antibes",
        "latitude": 43.5808,
        "longitude": 7.1239
    }


@pytest.fixture(scope="module")
def created_boat(auth_headers_with_permit, test_boat_data):
    """Cree un bateau de test."""
    if not auth_headers_with_permit:
        return None

    response = requests.post(
        get_url("/boats"),
        json=test_boat_data,
        headers=auth_headers_with_permit,
        verify=False
    )
    if response.status_code == 201:
        return response.json()
    return None


@pytest.fixture(scope="module")
def test_trip_data(created_boat):
    """Donnees pour creer une sortie peche de test."""
    if not created_boat:
        return None

    return {
        "title": "Sortie Peche Test Pytest",
        "practicalInfo": "Rendez-vous au port a 6h",
        "tripType": "daily",
        "pricingType": "per_person",
        "startDates": ["2026-03-01"],
        "endDates": ["2026-03-01"],
        "startTimes": ["06:00"],
        "endTimes": ["14:00"],
        "passengerCount": 4,
        "price": 75.00,
        "boatId": created_boat["id"]
    }


@pytest.fixture(scope="module")
def created_trip(auth_headers_with_permit, test_trip_data):
    """Cree une sortie peche de test."""
    if not auth_headers_with_permit or not test_trip_data:
        return None

    response = requests.post(
        get_url("/trips"),
        json=test_trip_data,
        headers=auth_headers_with_permit,
        verify=False
    )
    if response.status_code == 201:
        return response.json()
    return None


@pytest.fixture(scope="module")
def test_booking_data(created_trip):
    """Donnees pour creer une reservation de test."""
    if not created_trip:
        return None

    return {
        "tripId": created_trip["id"],
        "selectedDate": "2026-03-01",
        "seats": 2
    }


@pytest.fixture(scope="module")
def created_booking(auth_headers, test_booking_data):
    """Cree une reservation de test."""
    if not auth_headers or not test_booking_data:
        return None

    response = requests.post(
        get_url("/bookings"),
        json=test_booking_data,
        headers=auth_headers,
        verify=False
    )
    if response.status_code == 201:
        return response.json()
    return None


@pytest.fixture(scope="module")
def test_logbook_entry_data():
    """Donnees pour creer une entree de carnet de peche."""
    return {
        "fishSpecies": "Bar (Loup de mer)",
        "photoUrl": "https://example.com/fish.jpg",
        "comment": "Belle prise de la journee",
        "length": 45.5,
        "weight": 2.3,
        "location": "Au large de Nice",
        "fishingDate": "2026-02-01",
        "released": False
    }


@pytest.fixture(scope="module")
def created_logbook_entry(auth_headers_with_permit, test_logbook_entry_data):
    """Cree une entree de carnet de peche."""
    if not auth_headers_with_permit:
        return None

    response = requests.post(
        get_url("/logbook"),
        json=test_logbook_entry_data,
        headers=auth_headers_with_permit,
        verify=False
    )
    if response.status_code == 201:
        return response.json()
    return None


# Helper functions disponibles pour tous les tests
def get_auth_headers(email: str, password: str) -> dict:
    """Obtient les headers d'authentification pour un utilisateur."""
    response = requests.post(
        get_url("/auth/v1/login"),
        json={"email": email, "password": password},
        verify=False
    )
    if response.status_code == 200:
        token = response.json().get("accessToken")
        return {"Authorization": f"Bearer {token}"}
    return {}


def create_test_user(user_data: dict) -> dict:
    """Cree un utilisateur de test."""
    response = requests.post(
        get_url("/users"),
        json=user_data,
        verify=False
    )
    if response.status_code == 201:
        user = response.json()
        user["password"] = user_data["password"]
        return user
    return None
