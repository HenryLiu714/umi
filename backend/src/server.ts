import "dotenv/config";
import { serve } from "@hono/node-server";
import { CreateApp } from "./app.js";
import type { IApp, IServer } from "./contract.js";
import { CreateLoggingService } from "./services/LoggingService.js";

const logger = CreateLoggingService();

export class HTTPServer implements IServer {
    constructor(private readonly app: IApp) {}

    start(port: number): void {
        serve(
            {
                fetch: this.app.getApp().fetch,
                port,
            },
            (info) => {
                logger.info(`Server listening on port ${info.port}`);
            }
        );
    }
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = CreateApp(logger);
const server = new HTTPServer(app);

server.start(PORT);
