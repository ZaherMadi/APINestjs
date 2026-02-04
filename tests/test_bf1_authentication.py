"""
Tests pour BF1: L'API FF sera privee (l'autorisation d'acces se fera par identification des utilisateurs)

Ce fichier teste que:
- Les endpoints proteges necessitent une authentification JWT
- L'authentification fonctionne correctement avec des credentials valides
- L'authentification echoue avec des credentials invalides
- Les tokens expires ou invalides sont rejetes
"""

import pytest
import requests
from conftest import get_url


class TestBF1Authentication:
    """Tests pour verifier que l'API est privee et necessite une authentification."""

    @pytest.mark.bf1
    def test_login_success(self, created_user):
        """Test: Connexion reussie avec des identifiants valides."""
        assert created_user is not None, "L'utilisateur de test doit etre cree"

        response = requests.post(
            get_url("/auth/v1/login"),
            json={
                "email": created_user["email"],
                "password": created_user["password"]
            },
            verify=False
        )

        assert response.status_code in [200, 201], f"La connexion devrait reussir: {response.text}"
        data = response.json()
        assert "accessToken" in data, "La reponse doit contenir un accessToken"
        assert len(data["accessToken"]) > 0, "Le token ne doit pas etre vide"

    @pytest.mark.bf1
    def test_login_failure_wrong_password(self, created_user):
        """Test: Echec de connexion avec un mot de passe incorrect."""
        assert created_user is not None, "L'utilisateur de test doit etre cree"

        response = requests.post(
            get_url("/auth/v1/login"),
            json={
                "email": created_user["email"],
                "password": "MauvaisMotDePasse123!"
            },
            verify=False
        )

        assert response.status_code == 401, "La connexion devrait echouer avec 401"

    @pytest.mark.bf1
    def test_login_failure_wrong_email(self):
        """Test: Echec de connexion avec un email inexistant."""
        response = requests.post(
            get_url("/auth/v1/login"),
            json={
                "email": "inexistant@fisherfans.test",
                "password": "TestPassword123!"
            },
            verify=False
        )

        assert response.status_code == 401, "La connexion devrait echouer avec 401"

    @pytest.mark.bf1
    def test_protected_endpoint_without_token(self):
        """Test: Acces refuse a un endpoint protege sans token."""
        response = requests.get(
            get_url("/users"),
            verify=False
        )

        assert response.status_code == 401, "L'acces sans token doit retourner 401 Unauthorized"

    @pytest.mark.bf1
    def test_protected_endpoint_with_invalid_token(self):
        """Test: Acces refuse avec un token invalide."""
        response = requests.get(
            get_url("/users"),
            headers={"Authorization": "Bearer invalid_token_123"},
            verify=False
        )

        assert response.status_code == 401, "Un token invalide doit retourner 401"

    @pytest.mark.bf1
    def test_protected_endpoint_with_malformed_header(self):
        """Test: Acces refuse avec un header Authorization mal forme."""
        response = requests.get(
            get_url("/users"),
            headers={"Authorization": "NotBearer sometoken"},
            verify=False
        )

        assert response.status_code == 401, "Un header mal forme doit retourner 401"

    @pytest.mark.bf1
    def test_protected_endpoint_with_valid_token(self, auth_headers):
        """Test: Acces autorise avec un token valide."""
        assert auth_headers, "Le token d'authentification doit etre disponible"

        response = requests.get(
            get_url("/users"),
            headers=auth_headers,
            verify=False
        )

        assert response.status_code == 200, f"L'acces avec token valide devrait reussir: {response.text}"

    @pytest.mark.bf1
    def test_boats_endpoint_requires_auth(self):
        """Test: L'endpoint /boats necessite une authentification."""
        response = requests.get(
            get_url("/boats"),
            verify=False
        )

        assert response.status_code == 401, "L'endpoint /boats doit necessiter une authentification"

    @pytest.mark.bf1
    def test_trips_endpoint_requires_auth(self):
        """Test: L'endpoint /trips necessite une authentification."""
        response = requests.get(
            get_url("/trips"),
            verify=False
        )

        assert response.status_code == 401, "L'endpoint /trips doit necessiter une authentification"

    @pytest.mark.bf1
    def test_bookings_endpoint_requires_auth(self):
        """Test: L'endpoint /bookings necessite une authentification."""
        response = requests.get(
            get_url("/bookings"),
            verify=False
        )

        assert response.status_code == 401, "L'endpoint /bookings doit necessiter une authentification"

    @pytest.mark.bf1
    def test_logbook_endpoint_requires_auth(self):
        """Test: L'endpoint /logbook necessite une authentification."""
        response = requests.get(
            get_url("/logbook"),
            params={"userId": "test-id"},
            verify=False
        )

        assert response.status_code == 401, "L'endpoint /logbook doit necessiter une authentification"

    @pytest.mark.bf1
    def test_user_registration_is_public(self, unique_id):
        """Test: L'inscription utilisateur est publique (pas besoin de token)."""
        uid = unique_id()
        response = requests.post(
            get_url("/users"),
            json={
                "lastName": f"Public{uid}",
                "firstName": f"Test{uid}",
                "email": f"public.test.{uid}@fisherfans.test",
                "password": "TestPassword123!",
                "city": "Paris",
                "status": "individual"
            },
            verify=False
        )

        assert response.status_code == 201, "L'inscription doit etre publique et reussir"
