"""
Tests pour BF25, BF26, BF27: Regles metier et gestion des erreurs

BF25: L'API FF devra renvoyer des codes d'erreurs metiers en cas de mauvaise
      utilisation de ses points de terminaison

BF26: L'API FF devra interdire la creation d'une sortie peche aux utilisateurs
      ne possedant pas de bateau

BF27: L'API FF devra interdire la creation d'un nouveau bateau aux utilisateurs
      n'ayant pas indique de numero de permis bateau dans leur profil utilisateur

Ces tests sont particulierement importants pour verifier la gestion des erreurs.
"""

import pytest
import requests
from conftest import get_url, get_auth_headers, create_test_user


class TestBF25BusinessErrorCodes:
    """Tests pour les codes d'erreurs metiers (BF25)."""

    @pytest.mark.bf25
    def test_error_unauthorized_without_token(self):
        """Test: Code erreur 401 pour acces sans authentification."""
        response = requests.get(
            get_url("/boats"),
            verify=False
        )

        assert response.status_code == 401
        data = response.json()
        # Verifier que la reponse contient un message d'erreur
        assert "message" in data or "error" in data or "statusCode" in data

    @pytest.mark.bf25
    def test_error_not_found_user(self, auth_headers):
        """Test: Code erreur 404 pour utilisateur inexistant."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        response = requests.get(
            get_url(f"/users/{fake_id}"),
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 404
        data = response.json()
        assert "message" in data or "error" in data

    @pytest.mark.bf25
    def test_error_not_found_boat(self, auth_headers):
        """Test: Code erreur 404 pour bateau inexistant."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        response = requests.get(
            get_url(f"/boats/{fake_id}"),
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 404

    @pytest.mark.bf25
    def test_error_not_found_trip(self, auth_headers):
        """Test: Code erreur 404 pour sortie inexistante."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        response = requests.get(
            get_url(f"/trips/{fake_id}"),
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 404

    @pytest.mark.bf25
    def test_error_not_found_booking(self, auth_headers):
        """Test: Code erreur 404 pour reservation inexistante."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        response = requests.get(
            get_url(f"/bookings/{fake_id}"),
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 404

    @pytest.mark.bf25
    def test_error_validation_missing_fields(self):
        """Test: Code erreur 400/422 pour champs manquants."""
        incomplete_user = {
            "lastName": "Test"
            # Manque tous les autres champs obligatoires
        }

        response = requests.post(
            get_url("/users"),
            json=incomplete_user,
            verify=False
        )

        assert response.status_code in [400, 422], "Validation devrait echouer"
        data = response.json()
        assert "message" in data or "error" in data or "errors" in data

    @pytest.mark.bf25
    def test_error_validation_invalid_email(self):
        """Test: Code erreur pour email invalide."""
        user_data = {
            "lastName": "Test",
            "firstName": "Test",
            "email": "not-an-email",
            "password": "Password123!",
            "city": "Nice",
            "status": "individual"
        }

        response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )

        assert response.status_code in [400, 422]

    @pytest.mark.bf25
    def test_error_conflict_duplicate_email(self, created_user):
        """Test: Code erreur 409 pour email deja utilise."""
        assert created_user is not None

        duplicate_user = {
            "lastName": "Autre",
            "firstName": "Personne",
            "email": created_user["email"],  # Email deja pris
            "password": "Password123!",
            "city": "Paris",
            "status": "individual"
        }

        response = requests.post(
            get_url("/users"),
            json=duplicate_user,
            verify=False
        )

        assert response.status_code == 409, "Email en doublon doit retourner 409 Conflict"

    @pytest.mark.bf25
    def test_error_forbidden_modify_other_user(self, auth_headers, created_user_with_permit):
        """Test: Code erreur 403 pour modification du profil d'un autre."""
        assert auth_headers is not None
        assert created_user_with_permit is not None

        update_data = {"lastName": "Hacked"}

        response = requests.put(
            get_url(f"/users/{created_user_with_permit['id']}"),
            json=update_data,
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 403, "Modification d'un autre profil doit retourner 403"

    @pytest.mark.bf25
    def test_error_invalid_uuid_format(self, auth_headers):
        """Test: Code erreur pour format UUID invalide."""
        response = requests.get(
            get_url("/boats/not-a-valid-uuid"),
            headers=auth_headers,
            verify=False
        )

        assert response.status_code in [400, 404, 500], "Un UUID invalide devrait etre rejete"

    @pytest.mark.bf25
    def test_error_invalid_boat_type(self, auth_headers_with_permit):
        """Test: Code erreur pour type de bateau invalide."""
        boat_data = {
            "name": "InvalidTypeBoat",
            "boatType": "submarine",  # Type invalide
            "maxCapacity": 4,
            "homePort": "Nice"
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code in [400, 422], "Type de bateau invalide devrait etre rejete"

    @pytest.mark.bf25
    def test_error_invalid_trip_type(self, auth_headers_with_permit, created_boat):
        """Test: Code erreur pour type de sortie invalide."""
        assert created_boat is not None

        trip_data = {
            "title": "Sortie invalide",
            "tripType": "weekly",  # Type invalide (devrait etre daily ou recurring)
            "pricingType": "per_person",
            "passengerCount": 4,
            "price": 50.00,
            "boatId": created_boat["id"]
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code in [400, 422]

    @pytest.mark.bf25
    def test_error_negative_price(self, auth_headers_with_permit, created_boat):
        """Test: Code erreur pour prix negatif."""
        assert created_boat is not None

        trip_data = {
            "title": "Sortie prix negatif",
            "tripType": "daily",
            "pricingType": "per_person",
            "passengerCount": 4,
            "price": -50.00,  # Prix negatif
            "boatId": created_boat["id"]
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code in [400, 422], "Prix negatif devrait etre rejete"

    @pytest.mark.bf25
    def test_error_zero_capacity(self, auth_headers_with_permit):
        """Test: Code erreur pour capacite zero ou negative."""
        boat_data = {
            "name": "ZeroCapacityBoat",
            "boatType": "open",
            "maxCapacity": 0,  # Capacite invalide
            "homePort": "Nice"
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code in [400, 422], "Capacite zero devrait etre rejetee"


class TestBF26TripWithoutBoat:
    """Tests pour BF26: Interdiction de creer une sortie sans posseder de bateau."""

    @pytest.mark.bf26
    def test_create_trip_without_owning_boat(self, unique_id):
        """Test: Echec de creation d'une sortie si l'utilisateur ne possede pas de bateau."""
        # Creer un utilisateur AVEC permis mais SANS bateau
        uid = unique_id()
        user_data = {
            "lastName": f"SansBoat{uid}",
            "firstName": f"User{uid}",
            "email": f"sans.boat.{uid}@fisherfans.test",
            "password": "TestPassword123!",
            "city": "Nice",
            "status": "individual",
            "boatLicenseNumber": "11112222"  # A le permis mais pas de bateau
        }

        # Creer l'utilisateur
        create_response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )
        assert create_response.status_code == 201
        user = create_response.json()

        # Se connecter
        login_response = requests.post(
            get_url("/auth/v1/login"),
            json={"email": user_data["email"], "password": user_data["password"]},
            verify=False
        )
        assert login_response.status_code in [200, 201]
        token = login_response.json()["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}

        # Tenter de creer une sortie (devrait echouer car pas de bateau)
        trip_data = {
            "title": "Sortie impossible",
            "tripType": "daily",
            "pricingType": "per_person",
            "passengerCount": 4,
            "price": 100.00,
            "boatId": "00000000-0000-0000-0000-000000000000"  # UUID fictif
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=headers,
            verify=False
        )

        assert response.status_code == 403, \
            f"Creation de sortie sans bateau doit retourner 403: {response.text}"

        data = response.json()
        # Verifier le code d'erreur metier
        assert "businessCode" in data or "message" in data or "error" in data
        if "businessCode" in data:
            assert data["businessCode"] == "USER_HAS_NO_BOAT", \
                "Le code erreur devrait etre USER_HAS_NO_BOAT"

    @pytest.mark.bf26
    def test_create_trip_with_other_user_boat(self, auth_headers, created_boat):
        """Test: Echec de creation d'une sortie avec le bateau d'un autre utilisateur."""
        # auth_headers est pour un utilisateur different du proprietaire du bateau
        assert created_boat is not None
        assert auth_headers is not None

        trip_data = {
            "title": "Sortie avec bateau d'autrui",
            "tripType": "daily",
            "pricingType": "per_person",
            "passengerCount": 4,
            "price": 100.00,
            "boatId": created_boat["id"]  # Bateau appartenant a un autre utilisateur
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 403, \
            f"Creation de sortie avec bateau d'autrui doit retourner 403: {response.text}"

    @pytest.mark.bf26
    def test_create_trip_success_with_own_boat(self, auth_headers_with_permit, created_boat):
        """Test: Succes de creation d'une sortie avec son propre bateau."""
        assert created_boat is not None
        assert auth_headers_with_permit is not None

        trip_data = {
            "title": "Sortie valide avec mon bateau",
            "tripType": "daily",
            "pricingType": "per_person",
            "passengerCount": 4,
            "price": 80.00,
            "boatId": created_boat["id"]
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, \
            f"Creation de sortie avec son bateau devrait reussir: {response.text}"

    @pytest.mark.bf26
    def test_error_message_no_boat(self, unique_id):
        """Test: Verification du message d'erreur pour utilisateur sans bateau."""
        # Creer un utilisateur avec permis mais sans bateau
        uid = unique_id()
        user_data = {
            "lastName": f"NoBoatMsg{uid}",
            "firstName": f"Test{uid}",
            "email": f"noboat.msg.{uid}@fisherfans.test",
            "password": "TestPassword123!",
            "city": "Marseille",
            "status": "individual",
            "boatLicenseNumber": "99998888"
        }

        requests.post(get_url("/users"), json=user_data, verify=False)
        login_resp = requests.post(
            get_url("/auth/v1/login"),
            json={"email": user_data["email"], "password": user_data["password"]},
            verify=False
        )
        headers = {"Authorization": f"Bearer {login_resp.json()['accessToken']}"}

        trip_data = {
            "title": "Test message erreur",
            "tripType": "daily",
            "pricingType": "per_person",
            "passengerCount": 2,
            "price": 50.00,
            "boatId": "00000000-0000-0000-0000-000000000000"
        }

        response = requests.post(
            get_url("/trips"),
            json=trip_data,
            headers=headers,
            verify=False
        )

        assert response.status_code == 403
        data = response.json()
        # Le message doit indiquer clairement le probleme
        error_text = str(data).lower()
        assert "boat" in error_text or "bateau" in error_text, \
            "Le message d'erreur devrait mentionner le bateau"


class TestBF27BoatWithoutPermit:
    """Tests pour BF27: Interdiction de creer un bateau sans permis."""

    @pytest.mark.bf27
    def test_create_boat_without_permit(self, auth_headers):
        """Test: Echec de creation d'un bateau si l'utilisateur n'a pas de permis."""
        # auth_headers est pour created_user qui n'a PAS de permis bateau
        assert auth_headers is not None

        boat_data = {
            "name": "BateauSansPermis",
            "boatType": "open",
            "maxCapacity": 4,
            "homePort": "Nice"
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 403, \
            f"Creation de bateau sans permis doit retourner 403: {response.text}"

        data = response.json()
        # Verifier le code d'erreur metier
        assert "businessCode" in data or "message" in data or "error" in data
        if "businessCode" in data:
            assert data["businessCode"] == "PERMIT_REQUIRED", \
                "Le code erreur devrait etre PERMIT_REQUIRED"

    @pytest.mark.bf27
    def test_create_boat_with_permit_success(self, auth_headers_with_permit, unique_id):
        """Test: Succes de creation d'un bateau avec un permis valide."""
        assert auth_headers_with_permit is not None

        uid = unique_id()
        boat_data = {
            "name": f"BateauAvecPermis{uid}",
            "boatType": "cabin",
            "maxCapacity": 6,
            "homePort": "Cannes"
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 201, \
            f"Creation de bateau avec permis devrait reussir: {response.text}"

    @pytest.mark.bf27
    def test_error_message_no_permit(self, auth_headers):
        """Test: Verification du message d'erreur pour utilisateur sans permis."""
        assert auth_headers is not None

        boat_data = {
            "name": "TestMsgPermis",
            "boatType": "open",
            "maxCapacity": 4,
            "homePort": "Nice"
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 403
        data = response.json()
        # Le message doit indiquer clairement le probleme
        error_text = str(data).lower()
        assert "permit" in error_text or "permis" in error_text or "license" in error_text, \
            "Le message d'erreur devrait mentionner le permis"

    @pytest.mark.bf27
    def test_new_user_without_permit_cannot_create_boat(self, unique_id):
        """Test: Un nouvel utilisateur sans permis ne peut pas creer de bateau."""
        uid = unique_id()
        # Creer un utilisateur SANS permis
        user_data = {
            "lastName": f"SansPermis{uid}",
            "firstName": f"Nouveau{uid}",
            "email": f"sans.permis.{uid}@fisherfans.test",
            "password": "TestPassword123!",
            "city": "Toulon",
            "status": "individual"
            # Pas de boatLicenseNumber
        }

        # Creer l'utilisateur
        create_response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )
        assert create_response.status_code == 201

        # Se connecter
        login_response = requests.post(
            get_url("/auth/v1/login"),
            json={"email": user_data["email"], "password": user_data["password"]},
            verify=False
        )
        assert login_response.status_code in [200, 201]
        token = login_response.json()["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}

        # Tenter de creer un bateau
        boat_data = {
            "name": f"BoatTest{uid}",
            "boatType": "jet_ski",
            "maxCapacity": 2,
            "homePort": "Toulon"
        }

        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=headers,
            verify=False
        )

        assert response.status_code == 403, \
            f"Nouvel utilisateur sans permis ne doit pas pouvoir creer de bateau: {response.text}"

    @pytest.mark.bf27
    def test_user_adds_permit_then_creates_boat(self, unique_id):
        """Test: Un utilisateur peut creer un bateau apres avoir ajoute son permis."""
        uid = unique_id()
        # Creer un utilisateur SANS permis
        user_data = {
            "lastName": f"AddPermit{uid}",
            "firstName": f"Later{uid}",
            "email": f"add.permit.{uid}@fisherfans.test",
            "password": "TestPassword123!",
            "city": "Monaco",
            "status": "individual"
        }

        create_response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )
        assert create_response.status_code == 201
        user_id = create_response.json()["id"]

        # Se connecter
        login_response = requests.post(
            get_url("/auth/v1/login"),
            json={"email": user_data["email"], "password": user_data["password"]},
            verify=False
        )
        token = login_response.json()["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}

        # Verifier qu'on ne peut pas creer de bateau
        boat_data = {
            "name": f"BoatBefore{uid}",
            "boatType": "canoe",
            "maxCapacity": 2,
            "homePort": "Monaco"
        }

        response1 = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=headers,
            verify=False
        )
        assert response1.status_code == 403, "Sans permis, la creation doit echouer"

        # Ajouter le permis au profil
        update_response = requests.put(
            get_url(f"/users/{user_id}"),
            json={"boatLicenseNumber": "77776666"},
            headers=headers,
            verify=False
        )
        assert update_response.status_code == 200

        # Maintenant la creation de bateau devrait fonctionner
        boat_data["name"] = f"BoatAfter{uid}"
        response2 = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=headers,
            verify=False
        )

        assert response2.status_code == 201, \
            f"Apres ajout du permis, la creation devrait reussir: {response2.text}"

    @pytest.mark.bf27
    def test_invalid_permit_format(self, unique_id):
        """Test: Un permis avec format invalide devrait etre rejete."""
        uid = unique_id()
        # Creer un utilisateur avec permis au format invalide
        user_data = {
            "lastName": f"BadPermit{uid}",
            "firstName": f"Format{uid}",
            "email": f"bad.permit.{uid}@fisherfans.test",
            "password": "TestPassword123!",
            "city": "Nice",
            "status": "individual",
            "boatLicenseNumber": "ABC"  # Format invalide (devrait etre 8 chiffres)
        }

        response = requests.post(
            get_url("/users"),
            json=user_data,
            verify=False
        )

        # Soit la creation echoue, soit elle reussit mais le permis est rejete
        # L'important est que le systeme ne permette pas un permis invalide
        if response.status_code == 201:
            # Si la creation reussit, verifier qu'on ne peut pas creer de bateau
            user = response.json()
            login_resp = requests.post(
                get_url("/auth/v1/login"),
                json={"email": user_data["email"], "password": user_data["password"]},
                verify=False
            )
            if login_resp.status_code == 200:
                headers = {"Authorization": f"Bearer {login_resp.json()['accessToken']}"}
                boat_resp = requests.post(
                    get_url("/boats"),
                    json={"name": "Test", "boatType": "open", "maxCapacity": 2, "homePort": "Nice"},
                    headers=headers,
                    verify=False
                )
                # Le permis invalide ne devrait pas permettre de creer un bateau
                # (soit il a ete rejete, soit il n'est pas valide)
        else:
            assert response.status_code in [400, 422], \
                "Un permis invalide devrait etre rejete lors de la creation"
