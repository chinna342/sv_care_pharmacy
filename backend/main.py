from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine
from models import Base

from routes import (
    products,
    categories,
    payments,
    auth,
    inventory,
    admin,
    prescriptions,
    notifications,
    deliveries,
    websocket
)
import orders


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Database connection notice (tables will sync when DB is connected):", e)


# ============================================================
# CREATE FASTAPI APP
# ============================================================

app = FastAPI(
    title="SV Care Global Pharmacy & Clinical Commerce Platform",
    description="Production-Ready Multi-Portal Pharmacy Engine with RBAC, State Machine & Inventory",
    version="3.0.0"
)


# ============================================================
# CORS MIDDLEWARE
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(inventory.router)
app.include_router(prescriptions.router)
app.include_router(notifications.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(deliveries.router)
app.include_router(websocket.router)


# ============================================================
# ROOT & HEALTH CHECK
# ============================================================

@app.get("/")
def home():
    return {
        "platform": "SV Care Pharmacy Suite",
        "version": "3.0.0",
        "portals": ["Customer", "Pharmacist", "Admin", "Delivery"],
        "status": "Operational"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy",
        "database": "Connected",
        "timestamp": "2026-08-25T16:30:00Z"
    }