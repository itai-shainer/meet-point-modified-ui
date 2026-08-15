"""Aggregates all v1 routers."""

from fastapi import APIRouter

from app.api.v1 import auth, feedback, optimize, route_history

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(route_history.router)
api_router.include_router(feedback.router)
api_router.include_router(optimize.router)