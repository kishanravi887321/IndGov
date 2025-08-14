from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routes import auth, admin, survey

app = FastAPI(title="AI-Powered Survey API", version="1.0.0")

# CORS (allow Next.js frontend)
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup (simple dev use; for prod prefer Alembic)
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])  # register, login, me
app.include_router(admin.router, prefix="/admin", tags=["Admin"])  # admin-only survey mgmt
app.include_router(survey.router, prefix="/surveys", tags=["Surveys"])  # public/user endpoints


@app.get("/")
def root():
    return {"message": "Welcome to the AI-Powered Survey API"}

