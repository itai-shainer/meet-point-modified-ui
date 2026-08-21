# Single-service deploy: build the SPA, then serve it from FastAPI so the
# frontend and API share one origin. Same-origin means the refresh cookie is
# first-party, which no browser blocks.

# --- stage 1: build the Vite bundle ---------------------------------------
FROM node:20-slim AS frontend
WORKDIR /build

# VITE_* values are inlined at build time, so they must be present here.
# Railway supplies service variables to the build as ARGs.
ARG VITE_API_BASE_URL="/api/v1"
ARG VITE_GOOGLE_MAPS_API_KEY=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- stage 2: python runtime ----------------------------------------------
FROM python:3.13-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

COPY server/requirements.txt ./server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt

COPY server ./server
# app/main.py resolves a relative STATIC_DIR against its grandparent (/app),
# so the bundle has to land at /app/dist.
COPY --from=frontend /build/dist ./dist

ENV SERVE_STATIC=true \
    STATIC_DIR=dist

WORKDIR /app/server
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
