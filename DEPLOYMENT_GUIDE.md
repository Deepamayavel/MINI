# 🚀 MediGuide AI — Cloud PaaS Deployment Guide

This guide walks you through deploying the complete MediGuide AI full-stack system using modern, free/low-cost Cloud PaaS platforms:
- **Frontend**: [Vercel](https://vercel.com) (or [Netlify](https://netlify.com))
- **Spring Boot Backend**: [Render](https://render.com) (or [Railway](https://railway.app))
- **Python NLP Microservice**: [Render](https://render.com) (or [Railway](https://railway.app))
- **Database**: [MongoDB Atlas](https://cloud.mongodb.com) (already cloud-hosted)

---

## 📋 Step 0: Ensure MongoDB Atlas Allows Cloud Connections

1. Log into your [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Under **Security**, click **Network Access**.
3. Ensure you have an entry for `0.0.0.0/0` (Allow Access from Anywhere) so your cloud backend services can connect securely with your database credentials.

---

## 🐍 Step 1: Deploy Python NLP Microservice (Render or Railway)

### Using Render:
1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your Git repository (`Deepamayavel/MINI`).
3. Set the configuration:
   - **Name**: `mediguide-nlp`
   - **Root Directory**: `backend/python-service`
   - **Runtime**: `Python 3` (or choose `Docker`)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Click **Deploy Web Service**.
5. Copy the generated service URL (e.g., `https://mediguide-nlp.onrender.com`).

---

## ☕ Step 2: Deploy Spring Boot Backend (Render or Railway)

### Using Render:
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your Git repository (`Deepamayavel/MINI`).
3. Set the configuration:
   - **Name**: `mediguide-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` (Render automatically uses [backend/Dockerfile](file:///c:/Users/USER/MINI/backend/Dockerfile))
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://<db_username>:<db_password>@cluster0.chu8att.mongodb.net/mediguide?retryWrites=true&w=majority&appName=Cluster0`
   - `NLP_SERVICE_URL`: `<your-python-service-url-from-step-1>` (e.g. `https://mediguide-nlp.onrender.com`)
   - `JWT_SECRET`: `Y2hhbmdlLXRoaXMtc2VjcmV0LWNoYW5nZS10aGlzLXNlY3JldC0xMjM0NTY=`
   - `ALLOWED_ORIGINS`: `https://*.vercel.app,https://*.netlify.app,http://localhost:5173`
5. Click **Deploy Web Service**.
6. Copy the generated backend URL (e.g., `https://mediguide-backend.onrender.com`).

---

## ⚛️ Step 3: Deploy React Frontend (Vercel or Netlify)

### Using Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** $\rightarrow$ **Project**.
2. Import your GitHub repository (`Deepamayavel/MINI`).
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: `<your-spring-boot-backend-url-from-step-2>` (e.g., `https://mediguide-backend.onrender.com`)
5. Click **Deploy**.
6. Vercel will build and launch your production site at `https://your-project.vercel.app`!

---

## 🛡️ Step 4: Final Whitelist Check & Verification

Once your Vercel frontend is live:
1. In your Render backend **Environment Variables**, ensure `ALLOWED_ORIGINS` includes your specific Vercel domain (e.g., `https://mediguide-ai.vercel.app`).
2. Visit your Vercel frontend URL:
   - Log in with **Admin**: `admin@mediguide.com` / `Admin@1234`
   - Or test patient symptom queries.
3. Check the live endpoints:
   - Health check: `https://<your-backend>.onrender.com/api/health`
   - NLP docs: `https://<your-nlp-service>.onrender.com/docs`
