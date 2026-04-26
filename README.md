# Server Boilerplate

A TypeScript boilerplate for a [Hono](https://hono.dev) HTTP server with Prisma ORM, structured around a layered architecture with dependency injection and `Result<T, E>` error handling.

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- [npm](https://npmjs.com) v9+
- A PostgreSQL database (for Prisma)

## Getting started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable       | Description                          | Default |
|----------------|--------------------------------------|---------|
| `PORT`         | Port the server listens on           | `3000`  |
| `DATABASE_URL` | PostgreSQL connection string         | —       |
| `FRONTEND_URL` | Allowed CORS origin                  | —       |

### 3. Set up the database

```bash
npm run db:generate   # generate Prisma client
npm run db:migrate    # run migrations
```

### 4. Run the server

**Development** (watch mode, restarts on file changes):

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

The server starts on `http://localhost:3000` by default.

## Verify it's running

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

## Project structure

```
backend/
└── src/
    ├── app.ts              # Hono app — middleware and route registration
    ├── server.ts           # Entry point — starts the HTTP server
    ├── contract.ts         # Core interfaces: IApp, IServer, ILoggingService
    ├── lib/
    │   └── result.ts       # Result<T, E> type (Ok / Err)
    ├── types/
    │   ├── errors.ts       # BaseError and custom error classes
    │   └── schemas.ts      # Zod validation schemas
    ├── routes/             # Hono route files grouped by resource
    ├── controller/         # Request/response handling
    ├── services/           # Business logic
    │   └── LoggingService.ts
    ├── repository/         # Data access (Prisma wrappers)
    └── prisma/
        └── schema.prisma   # Prisma schema
```

See [CLAUDE.md](./CLAUDE.md) for full architectural conventions and coding patterns.
