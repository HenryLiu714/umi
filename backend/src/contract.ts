import type { Hono } from "hono";

/**
 * Interface for the logging service
 */
export interface ILoggingService {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

/**
 * Interface for the Hono app wrapper
 */
export interface IApp {
    getApp(): Hono;
}

/**
 * Interface for a server process that can listen on a port
 */
export interface IServer {
    start(port: number): void;
}
