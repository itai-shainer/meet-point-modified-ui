"""Proxy to the pickup-optimizer service.

The browser used to call the optimizer's Railway URL directly. Routing it
through this API means the optimizer can be locked down to internal traffic,
gets a single auth story, and can be swapped per-environment via
OPTIMIZER_API_URL without another frontend build.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.models import User

logger = logging.getLogger(__name__)

router = APIRouter(tags=["optimize"])


class PassengerRequest(BaseModel):
    label: str = Field(min_length=1, max_length=64)
    address: str = Field(min_length=1, max_length=500)
    transit_mode: bool = False


class OptimizeRequest(BaseModel):
    origin: str = Field(min_length=1, max_length=500)
    destination: str = Field(min_length=1, max_length=500)
    passengers: List[PassengerRequest] = Field(min_length=1, max_length=8)
    preference: str = Field(default="driver", pattern="^(driver|balanced|passenger)$")


@router.post("/optimize")
async def optimize(
    payload: OptimizeRequest,
    _user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    url = f"{settings.OPTIMIZER_API_URL.rstrip('/')}/api/v1/optimize"

    try:
        async with httpx.AsyncClient(timeout=settings.OPTIMIZER_TIMEOUT_SECONDS) as client:
            upstream = await client.post(url, json=payload.model_dump())
    except httpx.TimeoutException as exc:
        logger.warning("Optimizer timed out: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Route optimizer timed out. Please try again.",
        ) from exc
    except httpx.HTTPError as exc:
        logger.error("Optimizer unreachable: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Route optimizer is unavailable.",
        ) from exc

    if upstream.is_success:
        return upstream.json()

    # Surface the upstream's own message when it sent one, so the UI keeps
    # showing meaningful validation errors instead of a generic 502.
    detail: Optional[str] = None
    try:
        body = upstream.json()
        if isinstance(body, dict):
            raw = body.get("detail") or body.get("message")
            detail = raw if isinstance(raw, str) else None
    except ValueError:
        detail = None

    logger.warning("Optimizer returned %s: %s", upstream.status_code, upstream.text[:500])
    raise HTTPException(
        status_code=upstream.status_code if upstream.status_code < 500 else status.HTTP_502_BAD_GATEWAY,
        detail=detail or "Route optimization failed.",
    )