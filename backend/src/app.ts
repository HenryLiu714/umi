import { Hono } from "hono";
import { cors } from "hono/cors";
import type { IApp, ILoggingService } from "./contract.js";
import healthRoutes from "./routes/health.js";

export class HonoApp implements IApp {
    private readonly app: Hono;

    constructor(private readonly logger: ILoggingService) {
        this.app = new Hono();
        this.registerMiddleware();
        this.registerRoutes();
    }

    private registerMiddleware(): void {
        this.app.use(
            "*",
            cors({
                origin: process.env.FRONTEND_URL ?? "",
                allowMethods: ["GET", "POST", "PUT", "DELETE"],
                allowHeaders: ["Content-Type", "Authorization"],
            })
        );
    }

    private registerRoutes(): void {
        this.app.route("/health", healthRoutes);
    }

    getApp(): Hono {
        return this.app;
    }
}

export function CreateApp(logger: ILoggingService): HonoApp {
    return new HonoApp(logger);
}
