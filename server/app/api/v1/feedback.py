"""Feedback endpoints — the replacement for base44.entities.Feedback."""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_user
from app.db.models import Feedback, User
from app.db.session import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackPublic

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackPublic, status_code=status.HTTP_201_CREATED)
def create_feedback(
    payload: FeedbackCreate,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> Feedback:
    """Anonymous submissions are allowed; attribute it when we know who it is."""
    entry = Feedback(
        user_id=user.id if user else None,
        message=payload.message.strip(),
        contact_email=(payload.contact_email or (user.email if user else None)),
        driver_origin=payload.driver_origin,
        passenger_origin=payload.passenger_origin,
        destination=payload.destination,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=List[FeedbackPublic])
def list_feedback(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Feedback]:
    """Admin-only inbox."""
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    stmt = select(Feedback).order_by(Feedback.created_date.desc()).limit(limit).offset(offset)
    return list(db.scalars(stmt).all())