"""Test fixtures. Env vars are set before the app is imported so that
Settings picks up the throwaway database."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import Iterator

import pytest

_TMP_DB = Path(tempfile.gettempdir()) / "meetpoint_test.db"

os.environ.update(
    {
        "APP_ENV": "test",
        "DATABASE_URL": f"sqlite:///{_TMP_DB}",
        "JWT_SECRET": "test-secret-not-for-production",
        "OPTIMIZER_API_URL": "http://optimizer.invalid",
        "SERVE_STATIC": "false",
    }
)


@pytest.fixture(scope="session", autouse=True)
def _fresh_database() -> Iterator[None]:
    if _TMP_DB.exists():
        _TMP_DB.unlink()
    yield
    if _TMP_DB.exists():
        _TMP_DB.unlink()


@pytest.fixture()
def client() -> Iterator["object"]:
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client