import express, { Request, Response } from 'express';
import { Logger } from "pino";
import { Server, Socket } from "socket.io";
import { createServer } from "http";

export class ChatServer {
    port: number;
    app: express.Application;
    logger: Logger;
    io: Server;

    constructor(logger: Logger, port: number = 3000) {
        this.port = port;
        this.logger = logger;
        this.app = express();
        // ref: https://socket.io/docs/v4/server-initialization/#with-express
        this.io = new Server(createServer(this.app), {
            cors: {
                origin: '*',
            }
        });
        this.setupAppRoutes();
        this.setupSocketHandler();
    }
    setupAppRoutes() {
        // health check
        // ref: https://kubernetes.io/docs/reference/using-api/health-checks/
        this.app.get('/livez', (req: Request, res: Response) => {
            res.send('OK');
        });
    }

    setupSocketHandler() {
        this.io.on("listening", () => {
            this.logger.info(`Server running at http://localhost:${this.port}`);
        });
        this.io.on('connection', (socket: Socket) => {
            const sessionLogger = this.logger.child({ session: socket.id });
            sessionLogger.info(`Connected client session ${socket.id} on port ${this.port}`);
            socket.on('disconnect', () => {
                sessionLogger.info('a client disconnected');
            });
        });
    }

    listen() {
        this.io.listen(this.port);
    }
}
