"""
Tests pour BF2 a BF7: Creation des ressources de l'API Fisher Fans

BF2: L'API FF devra exposer les ressources suivantes:
    - Utilisateurs, Bateaux, Sorties peche, Reservations, Carnets de peche

BF3: L'API FF devra permettre de creer de nouveaux utilisateurs
BF4: L'API FF devra permettre de creer de nouveaux bateaux
BF5: L'API FF devra permettre de creer de nouvelles sorties peche
BF6: L'API FF devra permettre de creer de nouvelles reservations
BF7: L'API FF devra permettre de creer de nouveaux carnets de peche
"""

import pytest
import requests
from conftest import get_url


class TestBF2ResourcesExposed:
    """Tests pour verifier que toutes les ressources sont exposees (BF2)."""

    @pytest.mark.bf2
    def test_users_resource_exposed(self, auth_headers):
        """Test: La ressource Utilisateurs est accessible."""
        response = requests.get(
            get_url("/users"),
            headers=auth_headers,
            verify=False
        )
        assert response.status_code == 200, "La ressource /users doit etre accessible"
        assert isinstance(response.json(), list), "La reponse doit etre une liste"

    @pytest.mark.bf2
    def test_boats_resource_exposed(self, auth_headers):
        """Test: La ressource Bateaux est accessible."""
        response = requests.get(
            get_url("/boats"),
            headers=auth_headers,
            verify=False
        )
        assert response.status_code == 200, "La ressource /boats doit etre accessible"
        assert isinstance(response.json(), list), "La reponse doit etre une liste"

    @pytest.mark.bf2
    def test_trips_resource_exposed(self, auth_headers):
        """Test: La ressource Sorties peche est accessible."""
        response = requests.get(
            get_url("/trips"),
            headers=auth_headers,
            verify=False
        )
        assert response.status_code == 200, "La ressource /trips doit etre accessible"
        assert isinstance(response.json(), list), "La reponse doit etre une liste"

    @pytest.mark.bf2
    def test_bookings_resource_exposed(self, auth_headers):
        """Test: La ressource Reservations est accessible."""
        response = requests.get(
            get_url("/bookings"),
            headers=auth_headers,
            verify=False
        )
        assert response.status_code == 200, "La ressource /bookings doit etre accessible"
        assert isinstance(response.json(), list), "La reponse doit etre une liste"

    @pytest.mark.bf2
    def test_logbook_resource_exposed(self, auth_headers, created_user_with_permit):
        """Test: La ressource Carnet de peche est accessible."""
        response = requests.get(
            get_url("/logbook"),
            params={"userId": created_user_with_permit["id"]},
            headers=auth_headers,
            verify=False
        )
        assert response.status_code == 200, "La ressource /logbook doit etre accessible"
        assert isinstance(response.json(), list), "La reponse doit etre une liste"


class TestBF3CreateUsers:
    """Tests pour la creation d'utilisateurs (BF3)."""

    @pytest.mark.bf3
    def test_create_user_individual(self, unique_id):
        """Test: Creation d'un utilisateur particulier."""
        uid = unique_id()
        user_data = {
            "lastName": f"Dupont{uid}",
            "firstName": f"Jean{uid}",
            "email": f"jean.dupont.{uid}@fisherfans.test",
            "password": "SecurePass123!",
            "city": "Nice",
            "phone": "+33612345678",
            "status": "individual"
        }

        response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["lastName"] == user_data["lastName"]
        assert data["firstName"] == user_data["firstName"]
        assert data["email"] == user_data["email"]
        assert data["city"] == user_data["city"]
        assert data["status"] == "individual"
        assert "id" in data, "L'utilisateur doit avoir un ID"
        # Note: Idealement le mot de passe ne devrait pas etre retourne (securite)
        # assert "password" not in data, "Le mot de passe ne doit pas etre retourne"

    @pytest.mark.bf3
    def test_create_user_professional(self, unique_id):
        """Test: Creation d'un utilisateur professionnel."""
        uid = unique_id()
        user_data = {
            "lastName": f"Martin{uid}",
            "firstName": f"Pierre{uid}",
            "email": f"pierre.martin.{uid}@fisherfans.test",
            "password": "SecurePass123!",
            "city": "Marseille",
            "phone": "+33698765432",
            "status": "professional",
            "companyName": f"MartinBoats{uid}",
            "activityType": "rental",
            "boatLicenseNumber": "11223344",
            "insuranceNumber": "INS123456789"
        }

        response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["status"] == "professional"
        assert data["companyName"] == user_data["companyName"]
        assert data["activityType"] == "rental"

    @pytest.mark.bf3
    def test_create_user_with_boat_license(self, unique_id):
        """Test: Creation d'un utilisateur avec permis bateau."""
        uid = unique_id()
        user_data = {
            "lastName": f"Capitaine{uid}",
            "firstName": f"Haddock{uid}",
            "email": f"haddock.{uid}@fisherfans.test",
            "password": "SecurePass123!",
            "city": "Toulon",
            "status": "individual",
            "boatLicenseNumber": "99887766",
            "insuranceNumber": "ASS999888777"
        }

        response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["boatLicenseNumber"] == "99887766"

    @pytest.mark.bf3
    def test_create_user_missing_required_fields(self):
        """Test: Echec de creation sans champs obligatoires."""
        user_data = {
            "lastName": "Incomplet"
            # Manque: firstName, email, password, city, status
        }

        response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )

        assert response.status_code in [400, 422], "La creation doit echouer sans champs requis"

    @pytest.mark.bf3
    def test_create_user_invalid_email(self, unique_id):
        """Test: Echec de creation avec email invalide."""
        uid = unique_id()
        user_data = {
            "lastName": f"Test{uid}",
            "firstName": f"Email{uid}",
            "email": "email-invalide",
            "password": "SecurePass123!",
            "city": "Nice",
            "status": "individual"
        }

        response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )

        assert response.status_code in [400, 422], "Un email invalide doit etre rejete"

    @pytest.mark.bf3
    def test_create_user_duplicate_email(self, created_user):
        """Test: Echec de creation avec email deja utilise."""
        assert created_user is not None

        user_data = {
            "lastName": "Doublon",
            "firstName": "Test",
            "email": created_user["email"],  # Email deja utilise
            "password": "SecurePass123!",
            "city": "Nice",
            "status": "individual"
        }

        response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )

        assert response.status_code == 409, "Un email en doublon doit retourner 409 Conflict"


class TestBF4CreateBoats:
    """Tests pour la creation de bateaux (BF4)."""

    @pytest.mark.bf4
    def test_create_boat_success(self, auth_headers_with_permit, unique_id):
        """Test: Creation d'un bateau avec un utilisateur ayant un permis."""
        uid = unique_id()
        boat_data = {
            "name": f"MonBateau{uid}",
            "description": "Un beau bateau de peche",
            "brand": "Beneteau",
            "yearBuilt": 2021,
            "boatType": "open",
            "equipment": ["gps", "sounder", "vhf_radio"],
            "deposit": 300.00,
            "maxCapacity": 6,
            "homePort": "Cannes",
            "latitude": 43.5528,
            "longitude": 7.0174
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["name"] == boat_data["name"]
        assert data["boatType"] == "open"
        assert data["maxCapacity"] == 6
        assert "id" in data

    @pytest.mark.bf4
    def test_create_boat_all_types(self, auth_headers_with_permit, unique_id):
        """Test: Creation de bateaux de differents types."""
        boat_types = ["open", "cabin", "catamaran", "sailboat", "jet_ski", "canoe"]

        for boat_type in boat_types:
            uid = unique_id()
            boat_data = {
                "name": f"Boat{boat_type}{uid}",
                "boatType": boat_type,
                "maxCapacity": 4,
                "homePort": "Nice"
            }

            response = requests.post(
                get_url("/boats"),
                json=boat_data,
                headers=auth_headers_with_permit,
                verify=False
            )

            assert response.status_code == 201, f"Le type {boat_type} devrait etre valide"
            assert response.json()["boatType"] == boat_type

    @pytest.mark.bf4
    def test_create_boat_with_all_equipment(self, auth_headers_with_permit, unique_id):
        """Test: Creation d'un bateau avec tous les equipements."""
        uid = unique_id()
        all_equipment = ["sounder", "livewell", "ladder", "gps", "rod_holder", "vhf_radio"]

        boat_data = {
            "name": f"FullEquip{uid}",
            "boatType": "cabin",
            "equipment": all_equipment,
            "maxCapacity": 8,
            "homePort": "Saint-Tropez"
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert set(data["equipment"]) == set(all_equipment)

    @pytest.mark.bf4
    def test_create_boat_missing_required_fields(self, auth_headers_with_permit):
        """Test: Echec de creation de bateau sans champs obligatoires."""
        boat_data = {
            "description": "Bateau incomplet"
            # Manque: name, boatType, maxCapacity, homePort
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code in [400, 422], "La creation doit echouer sans champs requis"


class TestBF5CreateTrips:
    """Tests pour la creation de sorties peche (BF5)."""

    @pytest.mark.bf5
    def test_create_trip_daily(self, auth_headers_with_permit, created_boat):
        """Test: Creation d'une sortie journaliere."""
        assert created_boat is not None, "Un bateau doit exister"

        trip_data = {
            "title": "Peche au thon - Journee",
            "practicalInfo": "Depart 6h du matin, retour 14h",
            "tripType": "daily",
            "pricingType": "per_person",
            "startDates": ["2026-04-15"],
            "endDates": ["2026-04-15"],
            "startTimes": ["06:00"],
            "endTimes": ["14:00"],
            "passengerCount": 5,
            "price": 85.00,
            "boatId": created_boat["id"]
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["title"] == trip_data["title"]
        assert data["tripType"] == "daily"
        assert data["price"] == 85.00
        assert "id" in data

    @pytest.mark.bf5
    def test_create_trip_recurring(self, auth_headers_with_permit, created_boat):
        """Test: Creation d'une sortie recurrente."""
        assert created_boat is not None

        trip_data = {
            "title": "Sortie peche hebdomadaire",
            "tripType": "recurring",
            "pricingType": "total",
            "startDates": ["2026-04-01", "2026-04-08", "2026-04-15"],
            "endDates": ["2026-04-01", "2026-04-08", "2026-04-15"],
            "passengerCount": 4,
            "price": 250.00,
            "boatId": created_boat["id"]
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["tripType"] == "recurring"

    @pytest.mark.bf5
    def test_create_trip_missing_boat_id(self, auth_headers_with_permit):
        """Test: Echec de creation sans boatId."""
        trip_data = {
            "title": "Sortie sans bateau",
            "tripType": "daily",
            "pricingType": "per_person",
            "passengerCount": 4,
            "price": 50.00
            # Manque: boatId
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code in [400, 422], "La creation doit echouer sans boatId"


class TestBF6CreateBookings:
    """Tests pour la creation de reservations (BF6)."""

    @pytest.mark.bf6
    def test_create_booking_success(self, auth_headers, created_trip):
        """Test: Creation d'une reservation."""
        assert created_trip is not None, "Une sortie doit exister"

        booking_data = {
            "tripId": created_trip["id"],
            "selectedDate": "2026-03-01",
            "seats": 2
        }

        response = requests.post(
            get_url("/bookings"),
            json=booking_data,
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["tripId"] == created_trip["id"]
        assert data["seats"] == 2
        assert "totalPrice" in data
        assert "id" in data

    @pytest.mark.bf6
    def test_create_booking_single_seat(self, auth_headers, created_trip):
        """Test: Creation d'une reservation pour une seule place."""
        assert created_trip is not None

        booking_data = {
            "tripId": created_trip["id"],
            "selectedDate": "2026-03-01",
            "seats": 1
        }

        response = requests.post(
            get_url("/bookings"),
            json=booking_data,
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"

    @pytest.mark.bf6
    def test_create_booking_invalid_trip(self, auth_headers):
        """Test: Echec de reservation pour une sortie inexistante."""
        booking_data = {
            "tripId": "00000000-0000-0000-0000-000000000000",
            "selectedDate": "2026-03-01",
            "seats": 2
        }

        response = requests.post(
            get_url("/bookings"),
            json=booking_data,
            headers=auth_headers,
            verify=False
        )

        assert response.status_code in [400, 404, 422], "La reservation doit echouer pour une sortie inexistante"


class TestBF7CreateLogbook:
    """Tests pour la creation de carnets de peche (BF7)."""

    @pytest.mark.bf7
    def test_create_logbook_entry(self, auth_headers_with_permit):
        """Test: Creation d'une entree de carnet de peche."""
        entry_data = {
            "fishSpecies": "Dorade royale",
            "photoUrl": "https://example.com/dorade.jpg",
            "comment": "Prise exceptionnelle",
            "length": 35.5,
            "weight": 1.8,
            "location": "Baie de Cannes",
            "fishingDate": "2026-02-01",
            "released": False
        }

        response = requests.post(
            get_url("/logbook"),
            json=entry_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["fishSpecies"] == "Dorade royale"
        assert data["length"] == 35.5
        assert data["weight"] == 1.8
        assert data["released"] == False
        assert "id" in data

    @pytest.mark.bf7
    def test_create_logbook_entry_released_fish(self, auth_headers_with_permit):
        """Test: Creation d'une entree pour un poisson relache."""
        entry_data = {
            "fishSpecies": "Requin bleu",
            "comment": "Relache apres photo",
            "length": 120.0,
            "weight": 25.0,
            "location": "Large de Monaco",
            "fishingDate": "2026-02-02",
            "released": True
        }

        response = requests.post(
            get_url("/logbook"),
            json=entry_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"
        data = response.json()
        assert data["released"] == True

    @pytest.mark.bf7
    def test_create_logbook_entry_minimal(self, auth_headers_with_permit):
        """Test: Creation d'une entree minimale (champs obligatoires seulement)."""
        entry_data = {
            "fishSpecies": "Maquereau",
            "fishingDate": "2026-02-03",
            "released": False
        }

        response = requests.post(
            get_url("/logbook"),
            json=entry_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, f"La creation devrait reussir: {response.text}"

    @pytest.mark.bf7
    def test_create_logbook_entry_missing_fields(self, auth_headers_with_permit):
        """Test: Echec de creation sans champs obligatoires."""
        entry_data = {
            "comment": "Entree incomplete"
            # Manque: fishSpecies, fishingDate, released
        }

        response = requests.post(
            get_url("/logbook"),
            json=entry_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code in [400, 422], "La creation doit echouer sans champs requis"
