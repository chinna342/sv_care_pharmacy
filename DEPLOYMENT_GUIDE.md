# SV Care Pharmacy — Production Architecture & Deployment Guide

This guide describes how the production order architecture connects all customer devices (Laptop 1, Laptop 2, Mobiles) to the **same Production PostgreSQL Database** and the **Pharmacy Admin / Pharmacist Portal**.

---

## 1. Production Architecture Overview

```
                         ┌──────────────────────┐
                         │   Customer Laptop 1  │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   Customer Laptop 2  │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   Customer Mobile    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │       SV CARE FRONTEND      │
                    │       Vercel Production     │
                    └──────────────┬──────────────┘
                                   │
                                   │ HTTPS (VITE_API_URL)
                                   ▼
                    ┌─────────────────────────────┐
                    │       SV CARE BACKEND       │
                    │       Production API        │
                    │   (FastAPI on Render/AWS)   │
                    └──────────────┬──────────────┘
                                   │
                                   │ DATABASE_URL (SSL)
                                   ▼
                    ┌─────────────────────────────┐
                    │    PRODUCTION POSTGRESQL    │
                    │  (Neon / Supabase / AWS RDS)│
                    │                             │
                    │  • users                    │
                    │  • products                 │
                    │  • orders                   │
                    │  • order_items              │
                    │  • inventory                │
                    │  • notifications            │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │     PHARMACY ADMIN PANEL    │
                    │     & PHARMACIST PORTAL     │
                    │   (Real-Time 6s Polling)    │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │     PHARMACY STORE STAFF    │
                    │   🔔 New Order Live Alert   │
                    └─────────────────────────────┘
```

---

## 2. Environment Configuration

### Frontend (`frontend/.env.production` or Vercel Environment Variables)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | HTTPS URL of the hosted production FastAPI backend | `https://svcare-backend.onrender.com` |

### Backend (`backend/.env` or Render / AWS / Railway Environment Variables)
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@ep-prod-db.us-east-1.aws.neon.tech/svcaredb?sslmode=require` |
| `JWT_SECRET` | Secret key for signing customer & pharmacist JWTs | `svcare_ultra_secure_jwt_secret_key_2026` |
| `PORT` | Server listening port | `8000` |
| `GMAIL_USER` | (Optional) Email OTP sender | `care@svcare.com` |
| `GMAIL_APP_PASSWORD` | (Optional) App password | `xxxx-xxxx-xxxx-xxxx` |

---

## 3. Deploying Production PostgreSQL
You can provision a cloud PostgreSQL database instantly on:
- **Neon Postgres**: [https://neon.tech](https://neon.tech)
- **Supabase**: [https://supabase.com](https://supabase.com)
- **Render PostgreSQL**: [https://render.com](https://render.com)
- **AWS RDS / Aurora**

Once provisioned, copy the `DATABASE_URL` connection string and set it in your backend environment variables.

---

## 4. Deploying the Backend (Render / Railway / Docker)

### Deploy on Render:
1. Create a **New Web Service** pointing to your repository.
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `DATABASE_URL`: *(Your cloud PostgreSQL URL)*
   - `JWT_SECRET`: *(Your secret)*

---

## 5. Deploying the Frontend on Vercel

1. Import the Git repository in Vercel.
2. In Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`
4. Deploy!

---

## 6. Multi-Device Acceptance Verification

### Step-by-Step Test:
1. **Laptop A**: Open the production frontend. Add medicines to cart and place Order `#1001`.
   - The frontend calls `POST https://your-backend-api/orders/`.
   - The backend locks inventory rows and commits Order `#1001` into PostgreSQL.
2. **Laptop B**: Open the production frontend from another browser/laptop. Add medicines and place Order `#1002`.
   - The backend commits Order `#1002` into the **exact same PostgreSQL database**.
3. **Pharmacy Admin / Pharmacist Station**:
   - Open the Pharmacist Portal (`/orders`).
   - The station automatically polls PostgreSQL every 6 seconds (or click **"🔄 Sync Orders"**).
   - Both **Order `#1001`** and **Order `#1002`** appear immediately on the pharmacy dispatch queue with the audio chime and badge alert.
4. **Order Status Lifecycle**:
   - Pharmacist accepts Order `#1001` (`ACCEPTED` → `PACKING` → `PACKED` → `READY_FOR_DISPATCH`).
   - Status updates are committed directly to PostgreSQL.
   - Laptop A immediately sees the updated status when tracking their order.
