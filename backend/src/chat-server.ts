import express, { Request, Response } from 'express';
import { Logger } from "pino";

export class ChatServer {
    port: number;
    app: express.Application;
    logger: Logger;
    constructor(logger: Logger, port: number = 3000) {
        this.port = port;
        this.logger = logger;
        this.app = express();
        this.setupAppRoutes();
    }
    setupAppRoutes() {
        // health check
        // https://kubernetes.io/docs/reference/using-api/health-checks/
        this.app.get('/livez', (req: Request, res: Response) => {
            res.send('OK');
        });
    }

    listen() {
        this.app.listen(this.port, () => {
            this.logger.info(`Server running at http://localhost:${this.port}`);
        });
    }
}
