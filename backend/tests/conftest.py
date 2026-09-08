import pytest
from fastapi.testclient import TestClient

from app.main import app


def pytest_addoption(parser):
    parser.addoption(
        "--openrouter",
        action="store_true",
        default=False,
        help="run the real OpenRouter 2+2 call",
    )


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "openrouter: real OpenRouter network call"
    )


def pytest_collection_modifyitems(config, items):
    if config.getoption("--openrouter"):
        return
    items[:] = [item for item in items if "openrouter" not in item.keywords]


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("COMPASS_DB", str(tmp_path / "compass.db"))
    with TestClient(app) as test_client:
        yield test_client
