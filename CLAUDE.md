# Server Boilerplate — Hono Backend

This is a TypeScript boilerplate for a Hono HTTP server with Prisma ORM. It is designed to be cloned and extended for new projects. Follow the patterns below consistently across the codebase.

---

## Architecture

```
src/
├── app.ts              — Hono app setup and middleware registration
├── server.ts           — HTTP server entry point
├── contract.ts         — Core service interfaces (IApp, IServer, ILoggingService)
├── lib/
│   └── result.ts       — Result<T, E> type (Ok / Err)
├── types/
│   ├── errors.ts       — BaseError and custom error classes
│   └── schemas.ts      — Zod validation schemas
├── routes/             — Hono route handlers grouped by resource
├── controller/         — Request/response handling logic
├── services/           — Business logic layer
│   └── LoggingService.ts
├── repository/         — Data access layer (Prisma wrappers)
└── prisma/
    └── schema.prisma   — Prisma schema
```

Execution flows strictly top-down:

```
Routes → Controllers → Services → Repositories → Prisma
```

Each layer only depends on the layer directly below it. No layer skips layers or imports from layers above it.

---

## TypeScript Configuration

- **Strict mode** is enabled — `"strict": true`
- **Module**: `nodenext`
- **Target**: `esnext`
- **Key flags**:
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - `verbatimModuleSyntax: true`
  - `isolatedModules: true`
- Never use `any` — prefer `unknown` and narrow explicitly
- Always use explicit return types on exported functions
- Use `z.infer<typeof Schema>` to derive types from Zod schemas

---

## Result<T, E> — Error Handling

**All functions that can fail must return `Result<T, E>`, not throw.**

```typescript
import { Ok, Err, Result } from "../lib/result.js";

async function findUser(id: string): Promise<Result<User, RecordError>> {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    return Ok(user);
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return Err(new RecordNotFoundError("User not found"));
    }
    return Err(new RecordError("Failed to find user"));
  }
}
```

**Checking results:**

```typescript
const result = await findUser(id);
if (!result.ok) {
  // handle error: result.value is the error
  return c.json({ error: result.value.message }, 404);
}
// success: result.value is the data
```

Never use `try/catch` in controllers or services for Prisma calls — that belongs in the repository layer. Services and controllers only check `.ok` on returned Results.

---

## Custom Errors

All errors extend `BaseError` from `types/errors.ts`:

```typescript
export abstract class BaseError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

Define domain errors close to where they are used:

```typescript
export class RecordNotFoundError extends BaseError {
  readonly code = "NOT_FOUND";
}

export class RecordError extends BaseError {
  readonly code = "ERROR";
}
```

Map error codes to HTTP status codes in controllers, not in repositories or services.

---

## Hono App Setup

Use Hono instead of Express. The app class implements `IApp` from `contract.ts`.

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";

export class HonoApp implements IApp {
  private readonly app: Hono;

  constructor(private readonly logger: ILoggingService) {
    this.app = new Hono();
    this.registerMiddleware();
    this.registerRoutes();
  }

  private registerMiddleware(): void {
    this.app.use("*", cors({
      origin: process.env.FRONTEND_URL ?? "",
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Content-Type", "Authorization"],
    }));
  }

  private registerRoutes(): void {
    // mount route groups here
    // e.g. this.app.route("/users", userRoutes);
  }

  getApp(): Hono {
    return this.app;
  }
}

export function CreateApp(logger: ILoggingService): HonoApp {
  return new HonoApp(logger);
}
```

---

## Routes

Group routes by resource in `src/routes/`. Each file exports a `Hono` instance.

```typescript
// src/routes/users.ts
import { Hono } from "hono";
import { UserController } from "../controller/UserController.js";

const router = new Hono();
const controller = new UserController();

router.get("/", (c) => controller.list(c));
router.get("/:id", (c) => controller.getById(c));
router.post("/", (c) => controller.create(c));

export default router;
```

Mount routes in `HonoApp.registerRoutes()`:

```typescript
this.app.route("/users", userRoutes);
```

---

## Controllers

Controllers handle HTTP concerns: parsing request input, calling services, and returning responses. They do not contain business logic.

```typescript
export class UserController {
  private readonly userService: IUserService;

  constructor(userService?: IUserService) {
    this.userService = userService ?? CreateUserService();
  }

  async getById(c: Context): Promise<Response> {
    const id = c.req.param("id");
    const result = await this.userService.findById(id);

    if (!result.ok) {
      const status = result.value.code === "NOT_FOUND" ? 404 : 500;
      return c.json({ error: result.value.message }, status);
    }

    return c.json(result.value);
  }
}
```

---

## Services

Services contain business logic. They accept plain data, call repositories, and return `Result<T, E>`.

```typescript
export interface IUserService {
  findById(id: string): Promise<Result<User, RecordError>>;
  create(data: UserCreateInput): Promise<Result<User, RecordError>>;
}

export class UserService implements IUserService {
  constructor(private readonly repo: IUserRepository) {}

  async findById(id: string): Promise<Result<User, RecordError>> {
    return this.repo.findById(id);
  }
}

export function CreateUserService(repo?: IUserRepository): IUserService {
  return new UserService(repo ?? CreateUserRepository());
}
```

---

## Repositories

Repositories encapsulate all Prisma operations. They always return `Result<T, RecordError>`.

```typescript
export interface IUserRepository {
  findById(id: string): Promise<Result<User | null, RecordError>>;
  create(data: Prisma.UserCreateInput): Promise<Result<User, RecordError>>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<Result<User, RecordError>>;
  delete(id: string): Promise<Result<void, RecordError>>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Result<User | null, RecordError>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      return Ok(user);
    } catch (e) {
      return Err(this.toRecordError(e));
    }
  }

  private toRecordError(e: unknown): RecordError {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === "P2025") return new RecordNotFoundError("Record not found");
      if (e.code === "P2003") return new RecordError("Foreign key constraint failed");
    }
    return new RecordError("Database error");
  }
}

export function CreateUserRepository(prisma?: PrismaClient): IUserRepository {
  return new UserRepository(prisma ?? new PrismaClient());
}
```

---

## Logging Service

Inject the logger via constructor. Never call `console.log` directly in application code.

```typescript
export interface ILoggingService {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}
```

The `ConsoleLoggingService` is a singleton obtained via `CreateLoggingService()`. Pass it as a constructor argument down the dependency chain.

---

## Dependency Injection

Use constructor injection throughout. Factory functions (`CreateX()`) create and wire dependencies.

```typescript
// Bad: tightly coupled
class UserService {
  private repo = new UserRepository(new PrismaClient());
}

// Good: injected
class UserService {
  constructor(private readonly repo: IUserRepository) {}
}
```

Factory functions should default to production dependencies while allowing injection for testing:

```typescript
export function CreateUserService(repo?: IUserRepository): IUserService {
  return new UserService(repo ?? CreateUserRepository());
}
```

---

## Validation with Zod

Define Zod schemas in `src/types/schemas.ts`. Derive TypeScript types from schemas.

```typescript
import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

Validate request bodies in controllers before passing data to services:

```typescript
const parsed = CreateUserSchema.safeParse(await c.req.json());
if (!parsed.success) {
  return c.json({ error: parsed.error.flatten() }, 400);
}
const result = await this.userService.create(parsed.data);
```

---

## Prisma Schema Conventions

- Primary keys: `String @id @default(uuid())`
- Timestamps: `createdAt DateTime @default(now())`
- Cascade deletes on child records: `onDelete: Cascade`
- JSON fields for flexible structures (headers, metadata): `Json?`

---

## Environment Variables

| Variable       | Description                             |
|----------------|-----------------------------------------|
| `PORT`         | HTTP server port (default: `3000`)      |
| `DATABASE_URL` | PostgreSQL connection string            |
| `FRONTEND_URL` | CORS allowed origin                     |

Load via `import 'dotenv/config'` at the top of `server.ts`. Never hard-code secrets.

---

## File Naming and Module Imports

- Files use PascalCase for classes (`UserService.ts`) and camelCase for utilities (`result.ts`)
- Always use `.js` extensions in import paths (required for ESM with `nodenext`):
  ```typescript
  import { Ok, Err } from "../lib/result.js";
  ```
- Never use default exports except for Hono route files

---

## What Belongs Where

| Layer        | Responsibility                                      | May not                                      |
|--------------|-----------------------------------------------------|----------------------------------------------|
| Route        | Mount controller methods, define URL shape          | Parse bodies, call services directly         |
| Controller   | Parse input, call service, return HTTP response     | Contain business logic, touch Prisma         |
| Service      | Business logic, orchestration, call repositories    | Parse HTTP, return `Response`                |
| Repository   | Prisma operations only, return `Result<T, E>`       | Contain business logic, call other repos     |

---

## Common Mistakes to Avoid

- Do not throw errors in services or repositories — return `Err(...)` instead
- Do not use `any` — use `unknown` and narrow
- Do not skip the repository layer and call Prisma directly in services
- Do not access `process.env` outside of `server.ts` and `app.ts` — pass config as arguments
- Do not use `console.log` — use the injected `ILoggingService`
- Do not create helper utilities for single-use operations
- Do not add optional features or abstractions not required by the task at hand
