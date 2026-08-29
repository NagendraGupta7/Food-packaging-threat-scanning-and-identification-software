from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os

from app.core.database import engine, Base, SessionLocal
from app.core.security import hash_password
from app.models import domain
from app.models.domain import User

# Create tables for now (until Alembic is run)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Legal Metrology Compliance API",
    description="AI-Powered Compliance Checking System API",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from app.api import inspections, dashboard, reports, products, auth

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(inspections.router, prefix="/api/inspections", tags=["inspections"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(products.router, prefix="/api/products", tags=["products"])


DEFAULT_ADMIN_EMAIL = os.environ.get("DEFAULT_ADMIN_EMAIL", "admin@compliancefactory.com")
DEFAULT_ADMIN_PASSWORD = os.environ.get("DEFAULT_ADMIN_PASSWORD", "admin123")


@app.on_event("startup")
def seed_default_admin():
    """Seed one default account so the app is usable immediately after setup.
    Change DEFAULT_ADMIN_PASSWORD (env var) or the account's password before
    using this anywhere beyond local development."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == DEFAULT_ADMIN_EMAIL).first()
        if not existing:
            admin = User(
                email=DEFAULT_ADMIN_EMAIL,
                full_name="Inspector Admin",
                hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
                role="ADMIN",
            )
            db.add(admin)
            db.commit()
            print(f"[startup] Seeded default admin account: {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_PASSWORD}")
    finally:
        db.close()


class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok", "message": "API is running."}
