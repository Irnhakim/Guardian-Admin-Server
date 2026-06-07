# Guardian Admin Server & Dashboard

The backend API server and parent control panel for the **Guardian Parental Control System**. Built with NestJS (backend) and Next.js (dashboard UI), it acts as the centralized broker that gathers, processes, and presents real-time data synced from the child's Android device.

> [!IMPORTANT]
> **Interdependency Note**: This project requires the companion [Guardian Mobile Client](https://github.com/Irnhakim/Guardian-Mobile-Client) app to be running on the child's device in order to gather, synchronize, and display device status logs in real-time.

GitHub Repository: [https://github.com/Irnhakim/Guardian-Admin-Server](https://github.com/Irnhakim/Guardian-Admin-Server)

---

## Architecture Overview

```mermaid
graph TD
    Parent[Parent Browser / Dashboard] <-->|Socket.io WebSockets / HTTPS| Backend[NestJS Admin Server]
    Backend <-->|Prisma ORM| DB[(PostgreSQL Database)]
    ChildDevice[Child Android Device] --->|HTTPS REST API| Backend
    Backend -.->|Socket.io Force Sync| ChildDevice
```

---

## Core Features

### 💻 Parent Dashboard (`dashboard`)
* **Real-time Map Tracking**: High-accuracy location mapping using Leaflet and Fused Location.
* **Notification Stream**: Intercepts notifications on the child's device in real-time, displays them in a modern chat-like feed, and supports full-text search.
* **Apps Monitoring**: Displays a synchronized list of all installed system and third-party apps on the child's phone.
* **App Usage Analytics**: Screen time stats (daily and 7-day aggregates) represented in responsive charts.
* **Live Status Monitoring**: Monitors battery state (charging status, temperature, voltage) and online/offline status in real-time.
* **Remote Trigger (Force Sync)**: Send immediate WebSocket request to wake up the child device's workers for real-time synchronization.

### ⚙️ NestJS API & WebSocket Server (`src`)
* **Endpoints**: Auth, Devices management, Battery status tracking, Fused Location mapping, Apps logs, Notification log history, and System rules.
* **Security & Auth**: Secure routes protected by Passport JWT strategy, including rotating single refresh token logic per parent user.
* **WebSockets Gateway**: Uses `socket.io` to manage parent/child channels and broadcast instant updates in real-time.

---

## Database Storage & Clean Up Logic

To maintain a lightweight database and optimal server performance:
1. **Single-State Persistence**: Stores exactly **one** record per device for the current **Location** and **Battery Log**, updating fields in-place on new updates to prevent database bloat.
2. **Clean App Sync**: Uninstalled apps are completely pruned (`deleteMany`) from the database, along with its cascade-linked daily usage stats.
3. **Rotated Refresh Tokens**: Purges all old refresh tokens for a user when generating new tokens, keeping a maximum of one active session refresh token.
4. **Notification Pruning Rules**: Notification records are automatically pruned and deleted from the database once they are older than **7 days**.

---

## Tech Stack

* **Backend Framework**: NestJS, TypeScript, Prisma ORM, PostgreSQL, Socket.io WebSockets, Passport.js.
* **Parent Dashboard**: Next.js (App Router), Tailwind CSS (v4), Socket.io Client, Lucide React, Recharts, TanStack React Query.

---

## Installation & Setup Guide

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL database instance

### Step 1: Clone and install dependencies
```bash
git clone https://github.com/Irnhakim/Guardian-Admin-Server.git
cd Guardian-Admin-Server
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root of the server:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/guardian_db?schema=public"
JWT_SECRET="your_secure_jwt_secret"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

### Step 3: Database Setup
Run Prisma migrations to prepare the database schemas:
```bash
npx prisma migrate dev
```
*(Optional: Run `npm run db:seed` to add test data if needed)*

### Step 4: Run the Backend API Server
```bash
npm run start:dev
```
The NestJS API will now be running on `http://localhost:3001`.

### Step 5: Run the Next.js Dashboard
Navigate into the dashboard subdirectory, install dependencies, and run the development server:
```bash
cd dashboard
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## API Endpoints Summary

| Endpoint | Method | Description | Auth Required |
| --- | --- | --- | --- |
| `/v1/auth/register` | `POST` | Register a new Parent account | No |
| `/v1/auth/login` | `POST` | Authenticate and obtain JWT access & refresh tokens | No |
| `/v1/auth/refresh` | `POST` | Rotate and refresh JWT token | No |
| `/v1/devices/register` | `POST` | Register/Update a child device | Yes |
| `/v1/devices/:deviceId/battery` | `POST` | Log battery reading | Yes |
| `/v1/devices/:deviceId/location` | `POST` | Log location coordinates | Yes |
| `/v1/devices/:deviceId/apps` | `POST` | Sync child's installed app list | Yes |
| `/v1/devices/:deviceId/notifications` | `POST` / `GET` / `DELETE` | Log, fetch history, and clear notifications | Yes |
