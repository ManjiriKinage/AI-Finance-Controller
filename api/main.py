"""
FastAPI entrypoint compatibility redirecting to backend.app
Allows running both:
- uvicorn backend.app:app --reload --port 8000
- uvicorn api.main:app --reload --port 8000
"""

from backend.app import app

__all__ = ["app"]
