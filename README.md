# Guardian Backend — NestJS API Server

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Setup database (Prisma)
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

## Docker Deployment

```bash
# From project root
docker compose up -d
```

## API Docs

Once running, visit: `http://localhost:3001/api/docs`

## Architecture

```
src/
├── modules/
│   ├── auth/          # JWT authentication
│   ├── users/         # User management
│   ├── devices/       # Device registration & info
│   ├── battery/       # Battery monitoring
│   ├── locations/     # GPS location tracking
│   ├── apps/          # Installed apps tracking
│   ├── usage/         # App usage statistics
│   ├── notifications/ # Notification monitoring
│   ├── rules/         # Parental control rules
│   ├── alerts/        # Alert system
│   └── gateway/       # WebSocket gateway
├── prisma/            # Prisma service
├── common/            # Guards, decorators, filters
└── main.ts
```
