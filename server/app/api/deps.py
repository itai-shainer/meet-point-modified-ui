"""Shared FastAPI dependencies."""

from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.models import User
from app.db.session import get_db

_bearer = HTTPBearer(auto_error=False)

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise CREDENTIALS_ERROR

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise CREDENTIALS_ERROR

    user_id = payload.get("sub")
    if not user_id:
        raise CREDENTIALS_ERROR

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise CREDENTIALS_ERROR

    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Like get_current_user but tolerates anonymous callers."""
    if credentials is None or not credentials.credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    user = db.get(User, payload.get("sub"))
    return user if user is not None and user.is_active else None