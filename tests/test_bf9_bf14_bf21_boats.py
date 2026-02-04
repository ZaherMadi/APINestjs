"""
Tests pour BF9, BF14, BF21: Operations sur les bateaux

BF9:  L'API FF devra permettre de supprimer un bateau
BF14: L'API FF devra permettre de modifier un bateau
BF21: L'API FF devra renvoyer une liste de bateau en filtrant sur un
      sous-ensemble quelconque des caracteristiques d'un bateau
"""

import pytest
import requests
from conftest import get_url


class TestBF9DeleteBoat:
    """Tests pour la suppression de bateaux (BF9)."""

    @pytest.mark.bf9
    def test_delete_own_boat(self, auth_headers_with_permit, unique_id):
        """Test: Suppression de son propre bateau."""
        # D'abord creer un bateau a supprimer
        uid = unique_id()
        boat_data = {
            "name": f"BoatToDelete{uid}",
            "boatType": "canoe",
            "maxCapacity": 2,
            "homePort": "Nice"
        }

        create_response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )
        assert create_response.status_code == 201
        boat_id = create_response.json()["id"]

        # Supprimer le bateau
        delete_response = requests.delete(
            get_url(f"/boats/{boat_id}"),
            headers=auth_headers_with_permit,
            verify=False
        )

        assert delete_response.status_code == 204, "La suppression devrait reussir avec 204 No Content"

        # Verifier que le bateau n'existe plus
        get_response = requests.get(
            get_url(f"/boats/{boat_id}"),
            headers=auth_headers_with_permit,
            verify=False
        )
        assert get_response.status_code == 404, "Le bateau supprime ne doit plus exister"

    @pytest.mark.bf9
    def test_delete_nonexistent_boat(self, auth_headers_with_permit):
        """Test: Echec de suppression d'un bateau inexistant."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        response = requests.delete(
            get_url(f"/boats/{fake_id}"),
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 404, "La suppression d'un bateau inexistant doit retourner 404"

    @pytest.mark.bf9
    def test_delete_boat_without_auth(self, created_boat):
        """Test: Echec de suppression sans authentification."""
        assert created_boat is not None

        response = requests.delete(
            get_url(f"/boats/{created_boat['id']}"),
            verify=False
        )

        assert response.status_code == 401, "La suppression sans auth doit retourner 401"

    @pytest.mark.bf9
    def test_delete_other_user_boat(self, auth_headers, created_boat):
        """Test: Echec de suppression du bateau d'un autre utilisateur."""
        # auth_headers est pour un utilisateur sans permis (different de celui qui a cree le bateau)
        assert created_boat is not None
        assert auth_headers is not None

        response = requests.delete(
            get_url(f"/boats/{created_boat['id']}"),
            headers=auth_headers,  # Utilisateur different du proprietaire
            verify=False
        )

        assert response.status_code == 403, "Seul le proprietaire peut supprimer son bateau"


class TestBF14ModifyBoat:
    """Tests pour la modification de bateaux (BF14)."""

    @pytest.mark.bf14
    def test_update_boat_name(self, auth_headers_with_permit, created_boat):
        """Test: Modification du nom d'un bateau."""
        assert created_boat is not None

        update_data = {
            "name": "NouveauNomBateau"
        }

        response = requests.put(
            get_url(f"/boats/{created_boat['id']}"),
            json=update_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200, f"La modification devrait reussir: {response.text}"
        data = response.json()
        assert data["name"] == "NouveauNomBateau"

    @pytest.mark.bf14
    def test_update_boat_capacity(self, auth_headers_with_permit, created_boat):
        """Test: Modification de la capacite d'un bateau."""
        assert created_boat is not None

        new_capacity = 10
        update_data = {
            "maxCapacity": new_capacity
        }

        response = requests.put(
            get_url(f"/boats/{created_boat['id']}"),
            json=update_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200, f"La modification devrait reussir: {response.text}"
        data = response.json()
        assert data["maxCapacity"] == new_capacity

    @pytest.mark.bf14
    def test_update_boat_equipment(self, auth_headers_with_permit, created_boat):
        """Test: Modification des equipements d'un bateau."""
        assert created_boat is not None

        new_equipment = ["gps", "sounder", "ladder", "livewell"]
        update_data = {
            "equipment": new_equipment
        }

        response = requests.put(
            get_url(f"/boats/{created_boat['id']}"),
            json=update_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200, f"La modification devrait reussir: {response.text}"
        data = response.json()
        assert set(data["equipment"]) == set(new_equipment)

    @pytest.mark.bf14
    def test_update_boat_location(self, auth_headers_with_permit, created_boat):
        """Test: Modification du port d'attache et des coordonnees."""
        assert created_boat is not None

        update_data = {
            "homePort": "Monaco",
            "latitude": 43.7384,
            "longitude": 7.4246
        }

        response = requests.put(
            get_url(f"/boats/{created_boat['id']}"),
            json=update_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200, f"La modification devrait reussir: {response.text}"
        data = response.json()
        assert data["homePort"] == "Monaco"
        assert data["latitude"] == 43.7384
        assert data["longitude"] == 7.4246

    @pytest.mark.bf14
    def test_update_boat_type(self, auth_headers_with_permit, created_boat):
        """Test: Modification du type de bateau."""
        assert created_boat is not None

        update_data = {
            "boatType": "cabin"
        }

        response = requests.put(
            get_url(f"/boats/{created_boat['id']}"),
            json=update_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200, f"La modification devrait reussir: {response.text}"
        data = response.json()
        assert data["boatType"] == "cabin"

    @pytest.mark.bf14
    def test_update_boat_multiple_fields(self, auth_headers_with_permit, created_boat):
        """Test: Modification de plusieurs champs simultanement."""
        assert created_boat is not None

        update_data = {
            "name": "SuperBateau",
            "description": "Bateau modifie pour les tests",
            "maxCapacity": 12,
            "deposit": 750.00,
            "engineType": "diesel",
            "enginePower": 200
        }

        response = requests.put(
            get_url(f"/boats/{created_boat['id']}"),
            json=update_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200, f"La modification devrait reussir: {response.text}"
        data = response.json()
        assert data["name"] == "SuperBateau"
        assert data["maxCapacity"] == 12
        assert data["deposit"] == 750.00

    @pytest.mark.bf14
    def test_update_nonexistent_boat(self, auth_headers_with_permit):
        """Test: Echec de modification d'un bateau inexistant."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        update_data = {"name": "TestUpdate"}

        response = requests.put(
            get_url(f"/boats/{fake_id}"),
            json=update_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 404, "La modification d'un bateau inexistant doit retourner 404"

    @pytest.mark.bf14
    def test_update_other_user_boat(self, auth_headers, created_boat):
        """Test: Echec de modification du bateau d'un autre utilisateur."""
        assert created_boat is not None
        assert auth_headers is not None

        update_data = {"name": "HackedBoat"}

        response = requests.put(
            get_url(f"/boats/{created_boat['id']}"),
            json=update_data,
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 403, "Seul le proprietaire peut modifier son bateau"


class TestBF21FilterBoats:
    """Tests pour le filtrage des bateaux par caracteristiques (BF21)."""

    @pytest.mark.bf21
    def test_filter_boats_by_type(self, auth_headers_with_permit, unique_id):
        """Test: Filtrage des bateaux par type."""
        # Creer des bateaux de differents types
        uid = unique_id()
        for boat_type in ["open", "cabin"]:
            boat_data = {
                "name": f"FilterTest{boat_type}{uid}",
                "boatType": boat_type,
                "maxCapacity": 4,
                "homePort": "Nice"
            }
            requests.post(
                get_url("/boats"),
                json=boat_data,
                headers=auth_headers_with_permit,
                verify=False
            )

        # Filtrer par type "open"
        response = requests.get(
            get_url("/boats"),
            params={"boatType": "open"},
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        for boat in boats:
            assert boat["boatType"] == "open", "Tous les bateaux doivent etre de type 'open'"

    @pytest.mark.bf21
    def test_filter_boats_by_home_port(self, auth_headers_with_permit, unique_id):
        """Test: Filtrage des bateaux par port d'attache."""
        uid = unique_id()
        # Creer un bateau a Marseille
        boat_data = {
            "name": f"BoatMarseille{uid}",
            "boatType": "open",
            "maxCapacity": 4,
            "homePort": "Marseille"
        }
        requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        # Filtrer par port
        response = requests.get(
            get_url("/boats"),
            params={"homePort": "Marseille"},
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        for boat in boats:
            assert boat["homePort"] == "Marseille"

    @pytest.mark.bf21
    def test_filter_boats_by_min_capacity(self, auth_headers_with_permit, unique_id):
        """Test: Filtrage des bateaux par capacite minimale."""
        uid = unique_id()
        # Creer un bateau avec grande capacite
        boat_data = {
            "name": f"BigBoat{uid}",
            "boatType": "catamaran",
            "maxCapacity": 15,
            "homePort": "Saint-Tropez"
        }
        requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )

        # Filtrer par capacite minimum
        response = requests.get(
            get_url("/boats"),
            params={"minCapacity": 10},
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        for boat in boats:
            assert boat["maxCapacity"] >= 10, f"Capacite {boat['maxCapacity']} < 10"

    @pytest.mark.bf21
    def test_filter_boats_multiple_criteria(self, auth_headers_with_permit, unique_id):
        """Test: Filtrage des bateaux avec plusieurs criteres."""
        uid = unique_id()
        # Creer un bateau correspondant aux criteres
        boat_data = {
            "name": f"MultiFilter{uid}",
            "boatType": "cabin",
            "maxCapacity": 8,
            "homePort": "Antibes"
        }
        response = requests.post(
            get_url("/boats"),
            json=boat_data,
            headers=auth_headers_with_permit,
            verify=False
        )
        assert response.status_code == 201

        # Filtrer avec plusieurs criteres
        response = requests.get(
            get_url("/boats"),
            params={
                "boatType": "cabin",
                "homePort": "Antibes",
                "minCapacity": 6
            },
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        for boat in boats:
            assert boat["boatType"] == "cabin"
            assert boat["homePort"] == "Antibes"
            assert boat["maxCapacity"] >= 6

    @pytest.mark.bf21
    def test_filter_boats_no_results(self, auth_headers_with_permit):
        """Test: Filtrage ne retournant aucun resultat."""
        response = requests.get(
            get_url("/boats"),
            params={
                "homePort": "PortInexistant12345",
                "minCapacity": 9999
            },
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        assert len(boats) == 0, "Aucun bateau ne devrait correspondre"

    @pytest.mark.bf21
    def test_filter_boats_all_types(self, auth_headers_with_permit):
        """Test: Verification que tous les types de bateaux sont filtrables."""
        boat_types = ["open", "cabin", "catamaran", "sailboat", "jet_ski", "canoe"]

        for boat_type in boat_types:
            response = requests.get(
                get_url("/boats"),
                params={"boatType": boat_type},
                headers=auth_headers_with_permit,
                verify=False
            )

            assert response.status_code == 200, f"Le filtrage par type {boat_type} devrait fonctionner"
            # Verifier que la reponse est une liste (meme vide)
            assert isinstance(response.json(), list)

    @pytest.mark.bf21
    def test_get_all_boats_without_filter(self, auth_headers_with_permit):
        """Test: Recuperation de tous les bateaux sans filtre."""
        response = requests.get(
            get_url("/boats"),
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        assert isinstance(boats, list)
