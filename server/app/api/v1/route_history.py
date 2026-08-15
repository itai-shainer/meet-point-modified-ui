"""RouteHistory endpoints — the replacement for base44.entities.RouteHistory.

Every query is scoped to the authenticated user, which is what the Base44
"rls" block in RouteHistory.jsonc used to do server-side.
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import RouteHistory, User
from app.db.session import get_db
from app.schemas.route_history import RouteHistoryCreate, RouteHistoryPublic, RouteHistoryUpdate

router = APIRouter(prefix="/routes", tags=["routes"])

MAX_PAGE_SIZE = 200


def _owned_route(db: Session, route_id: str, user: User) -> RouteHistory:
    route = db.get(RouteHistory, route_id)
    # 404 rather than 403 for someone else's row: don't confirm it exists.
    if route is None or route.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    return route


@router.get("", response_model=List[RouteHistoryPublic])
def list_routes(
    order: str = Query("-created_date", description="created_date or -created_date"),
    favorites_only: bool = Query(False),
    limit: int = Query(100, ge=1, le=MAX_PAGE_SIZE),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[RouteHistory]:
    stmt = select(RouteHistory).where(RouteHistory.user_id == user.id)
    if favorites_only:
        stmt = stmt.where(RouteHistory.is_favorite.is_(True))

    descending = order.startswith("-")
    column = RouteHistory.created_date if order.lstrip("-") == "created_date" else RouteHistory.created_date
    stmt = stmt.order_by(column.desc() if descending else column.asc())

    return list(db.scalars(stmt.limit(limit).offset(offset)).all())


@router.post("", response_model=RouteHistoryPublic, status_code=status.HTTP_201_CREATED)
def create_route(
    payload: RouteHistoryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RouteHistory:
    route = RouteHistory(user_id=user.id, **payload.model_dump())
    db.add(route)
    db.commit()
    db.refresh(route)
    return route


@router.get("/{route_id}", response_model=RouteHistoryPublic)
def get_route(
    route_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RouteHistory:
    return _owned_route(db, route_id, user)


@router.patch("/{route_id}", response_model=RouteHistoryPublic)
def update_route(
    route_id: str,
    payload: RouteHistoryUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RouteHistory:
    route = _owned_route(db, route_id, user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(route, field, value)
    db.commit()
    db.refresh(route)
    return route


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_route(
    route_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    db.delete(_owned_route(db, route_id, user))
    db.commit()