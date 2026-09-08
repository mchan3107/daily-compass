from tests.helpers import sign_in

DEFAULT_IDS = ["health", "relationships", "growth", "hobbies", "career"]
DEFAULT_LABELS = [
    "Physical Health",
    "Relationships",
    "Mental Wellbeing",
    "Hobbies & Fun",
    "School & Career",
]


def test_categories_require_session(client):
    assert client.get("/api/categories").status_code == 401
    assert (
        client.put(
            "/api/categories",
            json={
                "categories": [
                    {"id": "health", "label": "Physical Health"},
                    {"id": "relationships", "label": "Relationships"},
                    {"id": "growth", "label": "Mental Wellbeing"},
                    {"id": "hobbies", "label": "Hobbies & Fun"},
                    {"id": "career", "label": "School & Career"},
                ]
            },
        ).status_code
        == 401
    )


def test_get_seeded_categories(client):
    sign_in(client)
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.json()["categories"]
    assert [c["id"] for c in categories] == DEFAULT_IDS
    assert [c["label"] for c in categories] == DEFAULT_LABELS


def test_rename_and_reorder_categories(client):
    sign_in(client)
    body = {
        "categories": [
            {"id": "career", "label": "Work"},
            {"id": "health", "label": "Physical Health"},
            {"id": "relationships", "label": "Relationships"},
            {"id": "growth", "label": "Mental Wellbeing"},
            {"id": "hobbies", "label": "Hobbies & Fun"},
        ]
    }
    put = client.put("/api/categories", json=body)
    assert put.status_code == 200
    categories = client.get("/api/categories").json()["categories"]
    assert [c["id"] for c in categories] == [
        "career",
        "health",
        "relationships",
        "growth",
        "hobbies",
    ]
    assert categories[0]["label"] == "Work"


def test_rejects_adding_a_category(client):
    sign_in(client)
    extra = {
        "categories": [
            {"id": "health", "label": "Physical Health"},
            {"id": "relationships", "label": "Relationships"},
            {"id": "growth", "label": "Mental Wellbeing"},
            {"id": "hobbies", "label": "Hobbies & Fun"},
            {"id": "career", "label": "School & Career"},
            {"id": "extra", "label": "Nope"},
        ]
    }
    assert client.put("/api/categories", json=extra).status_code == 400


def test_rejects_removing_a_category(client):
    sign_in(client)
    missing = {
        "categories": [
            {"id": "health", "label": "Physical Health"},
            {"id": "relationships", "label": "Relationships"},
            {"id": "growth", "label": "Mental Wellbeing"},
            {"id": "hobbies", "label": "Hobbies & Fun"},
        ]
    }
    assert client.put("/api/categories", json=missing).status_code == 400
