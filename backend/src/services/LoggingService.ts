import type { ILoggingService } from "../contract.js";

export type { ILoggingService };

export class ConsoleLoggingService implements ILoggingService {
    private stamp(level: string, message: string): string {
        return `${new Date().toISOString()} [${level}] ${message}`;
    }

    info(message: string): void {
        console.log(`\x1b[34m[INFO]\x1b[0m ${this.stamp("INFO", message)}`);
    }

    warn(message: string): void {
        console.warn(`\x1b[33m[WARN]\x1b[0m ${this.stamp("WARN", message)}`);
    }

    error(message: string): void {
        console.error(`\x1b[31m[ERROR]\x1b[0m ${this.stamp("ERROR", message)}`);
    }
}

let loggingServiceInstance: ILoggingService | null = null;

export function CreateLoggingService(): ILoggingService {
    if (loggingServiceInstance === null) {
        loggingServiceInstance = new ConsoleLoggingService();
    }

    return loggingServiceInstance;
}


