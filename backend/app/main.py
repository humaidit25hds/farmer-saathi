import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine

# Import models so SQLAlchemy registers all tables
from . import models

from .routers import (
    assistant,
    marketplace,
    transport,
    sos,
    image_analysis,
    weather,
    auth,
    admin,
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="FarmerSaathi API",
    description="Backend API for the FarmerSaathi AI platform",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

default_origins = [
    "http://localhost:3000",
    "http://localhost",
    "https://localhost",
    "capacitor://localhost",
]

# Optional extra origins for production.
# Example:
# CORS_ORIGINS=https://farmersaathi.com,https://www.farmersaathi.com

extra_origins = os.getenv(
    "CORS_ORIGINS",
    ""
)

extra_origins_list = [
    origin.strip()
    for origin in extra_origins.split(",")
    if origin.strip()
]

allowed_origins = (
    default_origins
    + extra_origins_list
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    assistant.router
)

app.include_router(
    marketplace.router
)

app.include_router(
    transport.router
)

app.include_router(
    sos.router
)

app.include_router(
    image_analysis.router
)

app.include_router(
    weather.router
)

app.include_router(
    auth.router
)

app.include_router(
    admin.router
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message":
        "FarmerSaathi backend is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "OK"
    }