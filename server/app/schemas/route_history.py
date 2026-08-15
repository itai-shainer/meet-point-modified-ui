"""RouteHistory request/response models."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class RouteHistoryCreate(BaseModel):
    driver_origin_address: str = Field(min_length=1)
    driver_origin_lat: Optional[float] = None
    driver_origin_lng: Optional[float] = None

    passenger_origin_address: str = Field(min_length=1)
    passenger_origin_lat: Optional[float] = None
    passenger_origin_lng: Optional[float] = None

    destination_address: str = Field(min_length=1)
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None

    api_response: Dict[str, Any]
    is_direct_pickup: bool = False
    is_favorite: bool = False
    preference: Optional[str] = None


class RouteHistoryUpdate(BaseModel):
    """Partial update. Only the fields a user is allowed to change."""

    is_favorite: Optional[bool] = None
    preference: Optional[str] = None


class RouteHistoryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    driver_origin_address: str
    driver_origin_lat: Optional[float] = None
    driver_origin_lng: Optional[float] = None
    passenger_origin_address: str
    passenger_origin_lat: Optional[float] = None
    passenger_origin_lng: Optional[float] = None
    destination_address: str
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    api_response: Dict[str, Any]
    is_direct_pickup: bool
    is_favorite: bool
    preference: Optional[str] = None
    created_date: datetime
    updated_date: datetime