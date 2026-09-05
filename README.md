# Guardian Admin Server & Dashboard

<p align="center">
  <b>Centralized Backend Server, WebSocket Broker & Modern Parent Control Dashboard</b><br />
  Real-time tracking, remote device management, screen time analytics, and notification stream for the Guardian ecosystem.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-NestJS%2010-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Dashboard-Next.js%2016%20(Turbopack)-black?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socketdotio&logoColor=white" alt="Socket.IO" />
</p>

---

> [!IMPORTANT]
> **Companion Application**: This system requires the [Guardian Mobile Client](https://github.com/Irnhakim/Guardian-Mobile-Client) Android app running on the monitored device to receive telemetries, location fixes, and sync alerts.

---

## 🧭 About The Project

**Guardian Admin Server & Dashboard** is the command center for parents. It acts as both:
1. **The Backend REST & Realtime Broker (`src`)**: High-performance NestJS application communicating with PostgreSQL via Prisma ORM and maintaining bi-directional WebSocket connections with mobile devices and browser dashboards.
2. **The Parent Control Dashboard (`dashboard`)**: Fully responsive web application built on Next.js (App Router) and Tailwind CSS v4, optimized for desktop monitors, tablets, and mobile smartphones.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Client [Monitored Android Phone]
        App[Guardian Mobile Client]
    end

    subgraph Server [Backend Gateway - Port 3001]
        Nest[NestJS API Server]
        Gateway[Socket.IO Gateway]
        DB[(PostgreSQL / Prisma)]
    end

    subgraph Parent [Parent Control Panel - Port 3000]
        Web[Next.js Responsive Dashboard]
    end

    App <-->|REST API / HTTPS| Nest
    App <-->|WebSocket: /guardian| Gateway
    Nest <--> DB
    Gateway <-->|WebSocket: /guardian| Web
    Web <-->|REST API / TanStack Query| Nest
```

---

## ✨ Core Features

### 💻 Parent Dashboard
* **📱 Fully Responsive Mobile-First UI**:
  * Slide-in navigation drawer with backdrop blur and hamburger toggle on small screens.
  * Adaptive metric grids and scrollable device selectors designed for thumb-friendly mobile operation.
* **📍 Live Location & History**:
  * Real-time GPS plotting powered by Leaflet and OpenStreetMap.
  * Instant *"Request Position Now"* button to force real-time GPS coordinate acquisition from the child's phone in under 2 seconds.
* **🔔 Compact Notification Feed & Advanced Filter**:
  * Modern single-line inbox layout with ellipsis auto-truncation and relative timestamps.
  * Live full-text search across sender names, notification titles, and message bodies.
  * Dynamic app filter dropdown (WhatsApp, Telegram, Instagram, SMS, etc.).
  * Quick category tabs: **Pesan / Chat**, **Email**, **Belanja / Promo**, and **Semua**.
* **⏱️ Screen Time & App Usage**:
  * Visual Bar Chart telemetry showing daily screen time consumption per application.
  * Targeted sync button to fetch the latest usage stats on demand.
* **🛡️ Remote Device Rules & Security**:
  * **Screen Lockout**: Trigger full-screen device lockouts with custom unlock passwords.
  * **Pop-up Messaging**: Send remote reminder alerts directly to the child's screen.
  * **Stealth Toggle**: Hide or reveal the Guardian launcher icon on the child's home screen.
  * **Anti-Uninstall Toggle**: Remotely enable or disable Accessibility Guard and Device Admin permissions.
* **📦 Outside APK Installation Approvals**:
  * Intercepts new app installations outside Google Play Store.
  * Remote **Approve** or **Reject** decisions pushed instantly back to the device.

### ⚙️ Backend API & WebSocket Broker
* **Dual Device Identifier Routing**: Routes socket events seamlessly across both database internal UUIDs and physical hardware identifiers (`deviceId`).
* **Targeted Push Pings**: Relay specific ping targets (`location`, `battery`, `apps`, `usage`, `permissions`) to reduce child device battery usage.
* **Prisma In-Place Updates**: Prevents database bloat by updating latest states (Battery, Location) in-place while keeping historical logs trimmed.
* **JWT & Refresh Token Rotation**: Protected endpoints with Passport.js strategy and automatic refresh token recycling.

---

## 🛠️ Tech Stack

### Backend (`/`)
* **Framework**: NestJS 10
* **ORM**: Prisma 5
* **Database**: PostgreSQL
* **WebSockets**: `@nestjs/websockets` with `socket.io` (v4)
* **Auth**: Passport-JWT, bcrypt

### Frontend Dashboard (`/dashboard`)
* **Framework**: Next.js 16 (Turbopack, App Router)
* **Styling**: Tailwind CSS v4, Lucide Icons
* **Data Fetching**: TanStack React Query v5, Axios
* **Maps**: Leaflet, React-Leaflet
* **Charts**: Recharts
* **Realtime**: Socket.IO Client (v4)

---

## 📋 System Requirements

* **Node.js**: v18.17.0 or higher (v20+ recommended)
* **npm** or **yarn** / **pnpm**
* **PostgreSQL**: v14 or higher (local or managed cloud like Supabase / Neon)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Irnhakim/Guardian-Admin-Server.git
cd Guardian-Admin-Server
```

### Step 2: Configure Server Environment
Install backend dependencies:
```bash
npm install
```

Create a `.env` file in the root directory:
```env
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guardian_db?schema=public"

# Security
JWT_SECRET="generate_a_strong_random_secret_here"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Server Ports & CORS
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Step 3: Run Database Migrations
Generate Prisma client and run initial database schema migration:
```bash
npx prisma migrate dev --name init
```

### Step 4: Configure Dashboard Environment
Navigate to the `dashboard` directory:
```bash
cd dashboard
npm install
```

Create a `.env.local` file inside `dashboard/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 — Backend NestJS:**
```bash
# In Guardian-Admin-Server root
npm run start:dev
```
*Backend API will run at `http://localhost:3001`*

**Terminal 2 — Next.js Dashboard:**
```bash
# In Guardian-Admin-Server/dashboard
npm run dev
```
*Parent Dashboard will run at `http://localhost:3000`*

### Production Build

**Backend:**
```bash
npm run build
npm run start:prod
```

**Dashboard:**
```bash
cd dashboard
npm run build
npm run start
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
