"""Feedback request/response models."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class FeedbackCreate(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    contact_email: Optional[EmailStr] = None
    driver_origin: Optional[str] = Field(default=None, max_length=1000)
    passenger_origin: Optional[str] = Field(default=None, max_length=1000)
    destination: Optional[str] = Field(default=None, max_length=1000)


class FeedbackPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    message: str
    contact_email: Optional[EmailStr] = None
    created_date: datetime