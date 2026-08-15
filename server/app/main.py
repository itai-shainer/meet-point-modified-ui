"""MeetPoint API application factory."""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, AsyncIterator, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app import __version__
from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import init_db

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    init_db()
    logger.info("MeetPoint API %s started (env=%s)", __version__, settings.APP_ENV)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=__version__,
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None,
        openapi_url=None if settings.is_production else "/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,  # required for the httpOnly refresh cookie
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.get("/health", tags=["meta"])
    def health() -> Dict[str, Any]:
        return {"status": "ok", "version": __version__, "env": settings.APP_ENV}

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    _mount_spa(app)
    return app


def _mount_spa(app: FastAPI) -> None:
    """Optionally serve the built Vite bundle from the same service.

    Set SERVE_STATIC=true to run frontend + API as one Railway service; leave
    it false to deploy the SPA separately (Vercel, Netlify, CDN, ...).
    """
    if not settings.SERVE_STATIC:
        return

    static_dir = Path(settings.STATIC_DIR)
    if not static_dir.is_absolute():
        static_dir = Path(__file__).resolve().parents[2] / static_dir

    index_file = static_dir / "index.html"
    if not index_file.is_file():
        logger.warning("SERVE_STATIC is on but %s does not exist — run `npm run build`", index_file)
        return

    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.exception_handler(StarletteHTTPException)
    async def spa_fallback(request, exc: StarletteHTTPException):  # type: ignore[no-untyped-def]
        """Client-side routes (/App, /Favorites, ...) must return index.html,
        but API 404s must stay JSON."""
        path = request.url.path
        is_api = path.startswith(settings.API_V1_PREFIX) or path in {"/health", "/docs", "/openapi.json"}
        if exc.status_code == 404 and not is_api:
            return FileResponse(index_file)
        from fastapi.responses import JSONResponse

        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

    @app.get("/", include_in_schema=False)
    def spa_root() -> FileResponse:
        return FileResponse(index_file)

    for asset in ("favicon.png", "manifest.json", "robots.txt"):
        candidate = static_dir / asset
        if candidate.is_file():
            app.get(f"/{asset}", include_in_schema=False)(
                lambda _candidate=candidate: FileResponse(_candidate)
            )

    logger.info("Serving SPA from %s", static_dir)


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", settings.PORT)),
        reload=not settings.is_production,
    )