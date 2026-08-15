"""ORM models — the open-source replacement for base44/entities/*.jsonc.

Ownership (previously Base44 "rls" blocks) is enforced in the API layer by
filtering every query on `user_id`; see app/api/v1/route_history.py.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="user", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    routes: Mapped[List["RouteHistory"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )


class RefreshToken(Base):
    """Server-side refresh token registry, so logout and rotation are real."""

    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="refresh_tokens")

    @property
    def is_usable(self) -> bool:
        if self.revoked_at is not None:
            return False
        expires_at = self.expires_at
        if expires_at.tzinfo is None:  # SQLite round-trips naive datetimes
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return expires_at > _utcnow()


class RouteHistory(Base):
    """Mirrors base44/entities/RouteHistory.jsonc, plus the `preference` field
    the frontend was already sending."""

    __tablename__ = "route_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    driver_origin_address: Mapped[str] = mapped_column(Text, nullable=False)
    driver_origin_lat: Mapped[Optional[float]] = mapped_column(Float)
    driver_origin_lng: Mapped[Optional[float]] = mapped_column(Float)

    passenger_origin_address: Mapped[str] = mapped_column(Text, nullable=False)
    passenger_origin_lat: Mapped[Optional[float]] = mapped_column(Float)
    passenger_origin_lng: Mapped[Optional[float]] = mapped_column(Float)

    destination_address: Mapped[str] = mapped_column(Text, nullable=False)
    destination_lat: Mapped[Optional[float]] = mapped_column(Float)
    destination_lng: Mapped[Optional[float]] = mapped_column(Float)

    api_response: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    is_direct_pickup: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    preference: Mapped[Optional[str]] = mapped_column(String(32))

    created_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="routes")

    __table_args__ = (Index("ix_route_history_user_created", "user_id", "created_date"),)


class Feedback(Base):
    """Mirrors base44/entities/Feedback.jsonc. Accepts anonymous submissions."""

    __tablename__ = "feedback"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), index=True
    )

    message: Mapped[str] = mapped_column(Text, nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(320))
    driver_origin: Mapped[Optional[str]] = mapped_column(Text)
    passenger_origin: Mapped[Optional[str]] = mapped_column(Text)
    destination: Mapped[Optional[str]] = mapped_column(Text)

    created_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)