from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base

from routes import products, categories, payments, auth
import orders


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

try:
    Base.metadata.create_all(
        bind=engine
    )
except Exception as e:
    print("Database connection warning (tables will sync when DB is up):", e)


# ============================================================
# CREATE FASTAPI APP
# ============================================================

app = FastAPI(
    title="SV Care Pharmacy API - World Class Health Suite",
    description="Backend API for SV Care Global Pharmacy Platform",
    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(products.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(auth.router)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Welcome to SV Care Pharmacy API",
        "status": "Running"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "Healthy",
        "database": "Connected"
    }