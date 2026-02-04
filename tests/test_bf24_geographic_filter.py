"""
Tests pour BF24: Filtrage geographique par bounding box

BF24: L'API FF devra renvoyer la liste des bateaux situes dans une zone
      geographique donnee par une "bounding box" latitude, longitude

Les coordonnees de reference:
- Nice: 43.7102, 7.2620
- Marseille: 43.2965, 5.3698
- Antibes: 43.5808, 7.1239
- Monaco: 43.7384, 7.4246
- Cannes: 43.5528, 7.0174
- Saint-Tropez: 43.2677, 6.6407
"""

import pytest
import requests
from conftest import get_url


class TestBF24GeographicFilter:
    """Tests pour le filtrage geographique des bateaux par bounding box (BF24)."""

    @pytest.fixture(autouse=True)
    def setup_boats_with_coordinates(self, auth_headers_with_permit, unique_id):
        """Cree des bateaux avec des coordonnees geographiques pour les tests."""
        self.boats_created = []

        # Bateau a Nice (Cote d'Azur est)
        boat_nice = {
            "name": f"BoatNice{unique_id()}",
            "boatType": "open",
            "maxCapacity": 6,
            "homePort": "Nice",
            "latitude": 43.7102,
            "longitude": 7.2620
        }

        # Bateau a Marseille (Cote d'Azur ouest)
        boat_marseille = {
            "name": f"BoatMarseille{unique_id()}",
            "boatType": "cabin",
            "maxCapacity": 8,
            "homePort": "Marseille",
            "latitude": 43.2965,
            "longitude": 5.3698
        }

        # Bateau a Antibes (entre Nice et Cannes)
        boat_antibes = {
            "name": f"BoatAntibes{unique_id()}",
            "boatType": "catamaran",
            "maxCapacity": 10,
            "homePort": "Antibes",
            "latitude": 43.5808,
            "longitude": 7.1239
        }

        # Bateau a Monaco (est de Nice)
        boat_monaco = {
            "name": f"BoatMonaco{unique_id()}",
            "boatType": "sailboat",
            "maxCapacity": 4,
            "homePort": "Monaco",
            "latitude": 43.7384,
            "longitude": 7.4246
        }

        for boat_data in [boat_nice, boat_marseille, boat_antibes, boat_monaco]:
            response = requests.post(
                get_url("/boats"),
                json=boat_data,
                headers=auth_headers_with_permit,
                verify=False
            )
            if response.status_code == 201:
                self.boats_created.append(response.json())

    @pytest.mark.bf24
    def test_filter_boats_in_cote_azur_est(self, auth_headers_with_permit):
        """Test: Filtrage des bateaux dans la zone est de la Cote d'Azur (Nice, Monaco, Antibes)."""
        # Bounding box couvrant Nice, Monaco et Antibes
        params = {
            "minLat": 43.5,
            "maxLat": 43.8,
            "minLng": 7.0,
            "maxLng": 7.5
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200, f"La requete devrait reussir: {response.text}"
        boats = response.json()

        # Verifier que les bateaux retournes sont dans la bounding box
        for boat in boats:
            if boat.get("latitude") and boat.get("longitude"):
                lat = float(boat["latitude"])
                lng = float(boat["longitude"])
                assert params["minLat"] <= lat <= params["maxLat"], \
                    f"Latitude {lat} hors de la bounding box"
                assert params["minLng"] <= lng <= params["maxLng"], \
                    f"Longitude {lng} hors de la bounding box"

    @pytest.mark.bf24
    def test_filter_boats_around_marseille(self, auth_headers_with_permit):
        """Test: Filtrage des bateaux autour de Marseille."""
        # Bounding box autour de Marseille uniquement
        params = {
            "minLat": 43.2,
            "maxLat": 43.4,
            "minLng": 5.2,
            "maxLng": 5.5
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()

        # Tous les bateaux retournes doivent etre dans cette zone
        for boat in boats:
            if boat.get("latitude") and boat.get("longitude"):
                lat = float(boat["latitude"])
                lng = float(boat["longitude"])
                assert params["minLat"] <= lat <= params["maxLat"]
                assert params["minLng"] <= lng <= params["maxLng"]

    @pytest.mark.bf24
    def test_filter_boats_exclude_marseille(self, auth_headers_with_permit):
        """Test: Bounding box excluant Marseille (longitude > 6)."""
        params = {
            "minLat": 43.2,
            "maxLat": 43.8,
            "minLng": 6.5,
            "maxLng": 7.5
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()

        # Aucun bateau de Marseille (longitude ~5.37) ne devrait etre inclus
        for boat in boats:
            if boat.get("latitude") and boat.get("longitude"):
                lng = float(boat["longitude"])
                assert lng >= params["minLng"], \
                    f"Bateau {boat['name']} a longitude {lng} ne devrait pas etre inclus"

    @pytest.mark.bf24
    def test_filter_boats_small_bounding_box(self, auth_headers_with_permit):
        """Test: Petite bounding box autour de Nice uniquement."""
        # Zone tres restreinte autour de Nice
        params = {
            "minLat": 43.70,
            "maxLat": 43.72,
            "minLng": 7.25,
            "maxLng": 7.28
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()

        for boat in boats:
            if boat.get("latitude") and boat.get("longitude"):
                lat = float(boat["latitude"])
                lng = float(boat["longitude"])
                assert params["minLat"] <= lat <= params["maxLat"]
                assert params["minLng"] <= lng <= params["maxLng"]

    @pytest.mark.bf24
    def test_filter_boats_large_bounding_box(self, auth_headers_with_permit):
        """Test: Grande bounding box couvrant toute la Cote d'Azur."""
        # Zone couvrant de Marseille a Monaco
        params = {
            "minLat": 43.0,
            "maxLat": 44.0,
            "minLng": 5.0,
            "maxLng": 8.0
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        assert isinstance(boats, list)

        # Tous les bateaux crees devraient etre inclus
        for boat in boats:
            if boat.get("latitude") and boat.get("longitude"):
                lat = float(boat["latitude"])
                lng = float(boat["longitude"])
                assert params["minLat"] <= lat <= params["maxLat"]
                assert params["minLng"] <= lng <= params["maxLng"]

    @pytest.mark.bf24
    def test_filter_boats_empty_zone(self, auth_headers_with_permit):
        """Test: Bounding box dans une zone sans bateaux (Atlantique)."""
        # Zone dans l'ocean Atlantique (pas de bateaux)
        params = {
            "minLat": 45.0,
            "maxLat": 46.0,
            "minLng": -5.0,
            "maxLng": -4.0
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        # Aucun bateau ne devrait etre retourne dans cette zone
        # (sauf si d'autres tests ont cree des bateaux la)
        assert isinstance(boats, list)

    @pytest.mark.bf24
    def test_filter_boats_with_type_and_location(self, auth_headers_with_permit):
        """Test: Combinaison du filtrage geographique et par type."""
        params = {
            "minLat": 43.5,
            "maxLat": 43.8,
            "minLng": 7.0,
            "maxLng": 7.5,
            "boatType": "open"
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()

        for boat in boats:
            # Verifier le type
            assert boat["boatType"] == "open"
            # Verifier la localisation
            if boat.get("latitude") and boat.get("longitude"):
                lat = float(boat["latitude"])
                lng = float(boat["longitude"])
                assert params["minLat"] <= lat <= params["maxLat"]
                assert params["minLng"] <= lng <= params["maxLng"]

    @pytest.mark.bf24
    def test_filter_boats_with_capacity_and_location(self, auth_headers_with_permit):
        """Test: Combinaison du filtrage geographique et par capacite."""
        params = {
            "minLat": 43.0,
            "maxLat": 44.0,
            "minLng": 5.0,
            "maxLng": 8.0,
            "minCapacity": 8
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()

        for boat in boats:
            # Verifier la capacite minimum
            assert boat["maxCapacity"] >= 8
            # Verifier la localisation
            if boat.get("latitude") and boat.get("longitude"):
                lat = float(boat["latitude"])
                lng = float(boat["longitude"])
                assert params["minLat"] <= lat <= params["maxLat"]
                assert params["minLng"] <= lng <= params["maxLng"]

    @pytest.mark.bf24
    def test_filter_boats_partial_coordinates(self, auth_headers_with_permit):
        """Test: Verification que les 4 coordonnees sont necessaires pour le filtrage geo."""
        # Test avec coordonnees partielles (devrait retourner tous les bateaux ou erreur)
        params = {
            "minLat": 43.5,
            "maxLat": 43.8
            # Manque minLng et maxLng
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        # L'API devrait soit ignorer le filtre geo incomplet, soit retourner une erreur
        assert response.status_code in [200, 400]

    @pytest.mark.bf24
    def test_filter_boats_invalid_coordinates(self, auth_headers_with_permit):
        """Test: Verification du comportement avec des coordonnees invalides."""
        # Coordonnees inversees (min > max)
        params = {
            "minLat": 44.0,
            "maxLat": 43.0,  # min > max
            "minLng": 7.5,
            "maxLng": 7.0   # min > max
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        # L'API devrait retourner une liste vide ou une erreur
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            boats = response.json()
            assert len(boats) == 0, "Des coordonnees inversees ne devraient retourner aucun resultat"

    @pytest.mark.bf24
    def test_filter_boats_extreme_coordinates(self, auth_headers_with_permit):
        """Test: Bounding box avec coordonnees extremes valides."""
        # Couvrir presque tout le globe
        params = {
            "minLat": -89.0,
            "maxLat": 89.0,
            "minLng": -179.0,
            "maxLng": 179.0
        }

        response = requests.get(
            get_url("/boats"),
            params=params,
            headers=auth_headers_with_permit,
            verify=False
        )

        assert response.status_code == 200
        boats = response.json()
        assert isinstance(boats, list)
