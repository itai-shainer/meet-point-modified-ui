"""SQLAlchemy engine / session wiring.

Driver-agnostic: point DATABASE_URL at SQLite for local development and at
Postgres in production. Nothing else in the codebase knows which one is used.
"""

from __future__ import annotations

from typing import Any, Dict, Iterator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


def _engine_kwargs() -> Dict[str, Any]:
    url = settings.sqlalchemy_url
    if url.startswith("sqlite"):
        # check_same_thread=False is required because FastAPI runs endpoints
        # in a threadpool; each request still gets its own Session.
        return {"connect_args": {"check_same_thread": False}}
    return {"pool_pre_ping": True, "pool_recycle": 300}


engine = create_engine(settings.sqlalchemy_url, **_engine_kwargs())


if engine.dialect.name == "sqlite":

    @event.listens_for(Engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record):  # type: ignore[no-untyped-def]
        """SQLite ignores ON DELETE CASCADE / SET NULL unless asked not to."""
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency yielding a request-scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables that do not exist yet.

    Fine for the initial rollout and for SQLite development. Once the schema
    starts evolving, switch to `alembic upgrade head` (see server/README.md).
    """
    from app.db import models  # noqa: F401  (registers mappers on Base)

    Base.metadata.create_all(bind=engine)