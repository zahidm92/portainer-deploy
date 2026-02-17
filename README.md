# Haircut Salon & Spa Website

A modern, responsive website for a haircut salon and spa, featuring a public booking system and an admin portal for management. Built with Node.js, Express, MySQL, Vite, React, and TailwindCSS.

## Features
- **Public Website**: Home page, Services list with filtering/details, Booking form.
- **Booking System**: Book appointments using Name and Phone Number.
- **Admin Portal**: View all bookings, manage status (Approve, Reject, Suggest Date, Complete, Mark Seen), and add new services.
- **Modern Design**: Mobile-first, clean UI using TailwindCSS.
- **Containerized**: Docker support for Frontend, Backend, and Database.

## Prerequisites
- Docker and Docker Compose
- *Or* Node.js v18+ and MySQL locally

## Quick Start (Docker)
1. **Clone/Navigate to directory**:
   ```bash
   cd haircut-salon
   ```
2. **Start the application**:
   ```bash
   docker compose up --build
   ```
   This will start:
   - MySQL Database (Port 3306)
   - Backend API (Port 5000)
   - Frontend (Port 3000)

3. **Access the application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)

## Manual Setup
### Backend
1. Go to `backend` directory.
2. Install dependencies: `npm install`
3. Configure `.env` if needed (defaults provided in `server.js`).
4. Start server: `npm run dev`
5. **Seed Data**: `node seed.js` (Run this once to populate initial services)

### Frontend
1. Go to `frontend` directory.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

## Kubernetes Deployment
Manifests are available in the `k8s/` directory.
```bash
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

## Admin Portal
Naviage to `/admin` on the frontend.
Features:
- **Bookings Tab**: View list, Change Status (Approve/Reject/Complete).
- **Manage Services Tab**: Add new services to the catalog.
