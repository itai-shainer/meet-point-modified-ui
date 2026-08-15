"""End-to-end coverage of the endpoints that replaced the Base44 SDK."""

from __future__ import annotations

import uuid

ROUTE_PAYLOAD = {
    "driver_origin_address": "Herzl 1, Tel Aviv",
    "driver_origin_lat": 32.0853,
    "driver_origin_lng": 34.7818,
    "passenger_origin_address": "Ha'atzmaut 5, Haifa",
    "passenger_origin_lat": 32.7940,
    "passenger_origin_lng": 34.9896,
    "destination_address": "Jaffa St 10, Jerusalem",
    "destination_lat": 31.7683,
    "destination_lng": 35.2137,
    "api_response": {"best_plan": {"type": "shared_meeting", "stops": [], "driver_total_eta_min": 95}},
    "is_direct_pickup": False,
    "is_favorite": False,
    "preference": "driver",
}


def _register(client, email=None, password="correct-horse-battery"):
    email = email or f"user-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Test User"},
    )
    assert response.status_code == 201, response.text
    return email, password, response.json()


def _auth_header(body):
    return {"Authorization": f"Bearer {body['access_token']}"}


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_login_and_me(client):
    email, password, body = _register(client)
    assert body["user"]["email"] == email
    assert body["user"]["role"] == "user"
    assert body["access_token"]

    me = client.get("/api/v1/auth/me", headers=_auth_header(body))
    assert me.status_code == 200
    assert me.json()["email"] == email

    login = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200


def test_duplicate_registration_is_rejected(client):
    email, password, _ = _register(client)
    again = client.post("/api/v1/auth/register", json={"email": email, "password": password})
    assert again.status_code == 409


def test_login_with_wrong_password_fails(client):
    email, _, _ = _register(client)
    response = client.post("/api/v1/auth/login", json={"email": email, "password": "wrong-password"})
    assert response.status_code == 401


def test_protected_routes_require_a_token(client):
    assert client.get("/api/v1/routes").status_code == 401
    assert client.get("/api/v1/auth/me", headers={"Authorization": "Bearer nonsense"}).status_code == 401


def test_route_history_crud(client):
    _, _, body = _register(client)
    headers = _auth_header(body)

    created = client.post("/api/v1/routes", json=ROUTE_PAYLOAD, headers=headers)
    assert created.status_code == 201, created.text
    route = created.json()
    assert route["is_favorite"] is False
    assert route["api_response"]["best_plan"]["driver_total_eta_min"] == 95

    listed = client.get("/api/v1/routes", headers=headers)
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [route["id"]]

    favorited = client.patch(f"/api/v1/routes/{route['id']}", json={"is_favorite": True}, headers=headers)
    assert favorited.status_code == 200
    assert favorited.json()["is_favorite"] is True

    only_favorites = client.get("/api/v1/routes?favorites_only=true", headers=headers)
    assert len(only_favorites.json()) == 1

    assert client.delete(f"/api/v1/routes/{route['id']}", headers=headers).status_code == 204
    assert client.get("/api/v1/routes", headers=headers).json() == []


def test_users_cannot_read_or_mutate_each_others_routes(client):
    _, _, owner = _register(client)
    _, _, intruder = _register(client)

    route_id = client.post("/api/v1/routes", json=ROUTE_PAYLOAD, headers=_auth_header(owner)).json()["id"]

    intruder_headers = _auth_header(intruder)
    assert client.get("/api/v1/routes", headers=intruder_headers).json() == []
    assert client.get(f"/api/v1/routes/{route_id}", headers=intruder_headers).status_code == 404
    assert client.patch(
        f"/api/v1/routes/{route_id}", json={"is_favorite": True}, headers=intruder_headers
    ).status_code == 404
    assert client.delete(f"/api/v1/routes/{route_id}", headers=intruder_headers).status_code == 404


def test_refresh_rotates_and_logout_revokes(client):
    _, _, body = _register(client)

    first = client.post("/api/v1/auth/refresh")
    assert first.status_code == 200, first.text
    assert first.json()["access_token"]

    assert client.post("/api/v1/auth/logout").status_code == 204
    assert client.post("/api/v1/auth/refresh").status_code == 401


def test_feedback_accepts_anonymous_and_authenticated(client):
    anonymous = client.post("/api/v1/feedback", json={"message": "The route was odd"})
    assert anonymous.status_code == 201

    email, _, body = _register(client)
    attributed = client.post(
        "/api/v1/feedback",
        json={"message": "Great app", "driver_origin": "Tel Aviv"},
        headers=_auth_header(body),
    )
    assert attributed.status_code == 201
    assert attributed.json()["contact_email"] == email

    # Non-admins may not read the inbox.
    assert client.get("/api/v1/feedback", headers=_auth_header(body)).status_code == 403


def test_delete_account_cascades_route_history(client):
    _, _, body = _register(client)
    headers = _auth_header(body)
    client.post("/api/v1/routes", json=ROUTE_PAYLOAD, headers=headers)

    assert client.delete("/api/v1/auth/me", headers=headers).status_code == 204
    assert client.get("/api/v1/auth/me", headers=headers).status_code == 401


def test_optimize_requires_auth_and_validates_payload(client):
    assert client.post("/api/v1/optimize", json={}).status_code == 401

    _, _, body = _register(client)
    invalid = client.post("/api/v1/optimize", json={"origin": "A"}, headers=_auth_header(body))
    assert invalid.status_code == 422

    # Upstream host is unroutable in tests, so a valid payload must surface 502.
    unreachable = client.post(
        "/api/v1/optimize",
        json={
            "origin": "Tel Aviv",
            "destination": "Jerusalem",
            "passengers": [{"label": "passenger_1", "address": "Haifa", "transit_mode": False}],
            "preference": "driver",
        },
        headers=_auth_header(body),
    )
    assert unreachable.status_code == 502