# AI-Powered Legal Metrology Compliance System

## Overview
This system is an AI-assisted inspection tool designed for Packaged Commodities compliance. It uses real OCR (Tesseract) and regex-based field extraction to read product labels, validates them against configurable Legal Metrology rules, and enforces real, authenticated multi-user access with all inspections and violations persisted to the database.

## What's real vs. simulated
- **Authentication**: real — bcrypt password hashing, JWT tokens, protected API routes.
- **OCR**: real — Tesseract text extraction + regex field parsing (manufacturer, net quantity, MRP, packing date, consumer care, country of origin). Accuracy depends on photo clarity, same as any OCR pipeline.
- **Violations & inspection history**: real — persisted to the database, not recomputed or lost on refresh.
- **Dashboard stats**: real — computed live from stored inspections/violations, not hardcoded.
- **Product barcode lookup**: still simulated (`/api/products/barcode/{code}`) — it invents a plausible product rather than querying a real external product database/GS1 registry, since that requires a paid third-party API and credentials this prototype doesn't have.
- **PDF reports**: the report endpoint returns structured JSON, not a rendered PDF file, for the same reason — no PDF library is wired in yet (see "Possible next steps" below).

## Technology Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS v4
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic, python-jose (JWT), passlib (bcrypt), pytesseract
- **Database**: SQLite by default (a `legal_metrology.db` file is created automatically — no Docker/Postgres needed to run this locally). `docker-compose.yml` is included if you'd rather point it at Postgres instead; that requires updating `DATABASE_URL` in `app/core/database.py`.
- **OCR engine**: Tesseract (system binary) + pytesseract

## Project Structure
- `/frontend`: React SPA
- `/backend`: FastAPI service
- `docker-compose.yml`: optional Postgres configuration (not required for default SQLite setup)

## Setup Instructions

### 1. Install Tesseract (required for OCR)
The OCR engine calls the `tesseract` command-line binary, so it must be installed on your system separately from the Python packages:
- **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
- **macOS**: `brew install tesseract`
- **Windows**: install from https://github.com/UB-Mannheim/tesseract/wiki, then add the install folder to your PATH.

### 2. Backend Setup
Navigate to the backend directory, create a virtual environment, and install dependencies (Python 3.9+ required):
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The backend API docs will be available at `http://localhost:8000/docs`.

On first startup, a default admin account is seeded automatically:
- **Email**: `admin@compliancefactory.com`
- **Password**: `admin123`

Change this password (or delete the account and register a new one via `/api/auth/register`) before using this anywhere beyond local development. You can also override the seeded credentials with the `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` environment variables, and should set a real `SECRET_KEY` env var for JWT signing in any non-local setup.

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173` and is pre-configured to call the backend at `http://localhost:8000`.

## Possible next steps
- Swap the simulated barcode lookup for a real product-database/GS1 API integration.
- Generate an actual downloadable PDF for reports (e.g. with `reportlab`).
- Add user roles/permissions beyond the current single `ADMIN`/`INSPECTOR` split.

## Deploying it for free (Render + Neon)

This deploys the backend and frontend on **Render** (free web service + free static hosting) with the database on **Neon** (a permanent free Postgres tier — Render's own free Postgres expires after 30 days, so Neon is used instead for something that stays up). Total cost: $0. No credit card required on either platform.

**What "free" means here, honestly**: Render's free web service spins down after 15 minutes of no traffic and takes about a minute to wake back up on the next request — fine for a personal/demo project, not for something needing instant response 24/7. Render's free tier also has no persistent disk, so uploaded package images will be lost whenever the backend redeploys or is moved to a new instance (the database — users, inspections, violations, scores — is unaffected, since that lives in Neon, not on Render's disk).

### 1. Push this project to GitHub
Render deploys from a Git repository, not a zip file. If you don't already have this in a repo:
```bash
cd legal-metrology-system-complete   # wherever you unzipped this
git init
git add .
git commit -m "Initial commit"
```
Then create a new repository on https://github.com/new and follow its instructions to push (`git remote add origin ...` and `git push`).

### 2. Create a free Postgres database on Neon
1. Sign up at https://neon.com (no credit card needed).
2. Create a new project.
3. Copy the connection string it gives you (starts with `postgresql://`) — you'll need it in step 4.

### 3. Deploy on Render
1. Sign up at https://render.com and connect your GitHub account.
2. Click **New → Blueprint**, and select the GitHub repo you just pushed. Render will detect the `render.yaml` file in this project and offer to create both services (backend + frontend) at once.
3. When prompted for environment variables:
   - `DATABASE_URL`: paste the Neon connection string from step 2.
   - `DEFAULT_ADMIN_PASSWORD`: choose your own password (don't leave this as `admin123` for a public deployment).
   - `VITE_API_BASE`: leave blank for now — you'll fill this in after the backend deploys and you know its URL (step 4).
4. Click **Apply**. Render will build both services. The backend build installs Tesseract and your Python dependencies inside a Docker container (takes a few minutes the first time).

### 4. Connect the frontend to the backend
1. Once the backend service is live, copy its URL from the Render dashboard (something like `https://legal-metrology-backend-xxxx.onrender.com`).
2. Go to the frontend static site's settings on Render, set the `VITE_API_BASE` environment variable to that URL, and trigger a manual redeploy (environment variable changes on static sites require a rebuild to take effect, since the value gets baked into the JavaScript at build time).
3. Open the frontend's Render URL — that's your live site.

If you'd rather not use the Blueprint file and set each service up manually through Render's dashboard instead, the same information applies: backend is a **Docker** web service pointing at `backend/Dockerfile`, frontend is a **Static Site** with root directory `frontend`, build command `npm install && npm run build`, and publish directory `dist`.

---
**Note:** This is a prototype and should not be used for final legal judgment without human verification.

