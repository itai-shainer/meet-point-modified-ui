"""Authentication endpoints — the replacement for base44.auth.*

Design:
  * short-lived JWT access token, returned in the response body
  * opaque refresh token in an httpOnly cookie, hashed at rest, rotated on use

The SPA therefore never persists a token in localStorage.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    needs_rehash,
    verify_password,
)
from app.api.deps import get_current_user
from app.db.models import RefreshToken, User
from app.db.session import get_db
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=token,
        max_age=settings.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )


def _issue_session(db: Session, user: User, response: Response) -> AuthResponse:
    """Mint an access token and a fresh refresh token for `user`."""
    raw_refresh = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(raw_refresh),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_TTL_DAYS),
        )
    )
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    _set_refresh_cookie(response, raw_refresh)
    return AuthResponse(
        access_token=create_access_token(user.id, {"email": user.email, "role": user.role}),
        expires_in=settings.ACCESS_TOKEN_TTL_MINUTES * 60,
        user=UserPublic.model_validate(user),
    )


def _lookup_refresh_token(db: Session, request: Request) -> Optional[RefreshToken]:
    raw = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not raw:
        return None
    return db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(raw)))


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    email = payload.email.lower().strip()
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        full_name=(payload.full_name or "").strip() or None,
        role="admin" if email in {e.lower() for e in settings.ADMIN_EMAILS} else "user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_session(db, user, response)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email))

    # Same error and roughly the same work regardless of which half failed.
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(payload.password)

    return _issue_session(db, user, response)


@router.post("/refresh", response_model=AuthResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)) -> AuthResponse:
    stored = _lookup_refresh_token(db, request)
    if stored is None or not stored.is_usable:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = db.get(User, stored.user_id)
    if user is None or not user.is_active:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    # Rotate: the presented token is retired as the replacement is issued.
    stored.revoked_at = datetime.now(timezone.utc)
    return _issue_session(db, user, response)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def logout(request: Request, response: Response, db: Session = Depends(get_db)) -> None:
    stored = _lookup_refresh_token(db, request)
    if stored is not None and stored.revoked_at is None:
        stored.revoked_at = datetime.now(timezone.utc)
        db.commit()
    _clear_refresh_cookie(response)


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_account(
    response: Response,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Hard-delete the account. Routes and tokens cascade; feedback is kept
    but de-linked (see the SET NULL FK on Feedback.user_id)."""
    db.delete(user)
    db.commit()
    _clear_refresh_cookie(response)