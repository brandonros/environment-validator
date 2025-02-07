import express, { Application } from "express";
import { Router } from "./Router";
import { errorHandler } from "../middleware/ExceptionMiddleware";

export class Server {
    private readonly app: Application;
    private readonly router: Router;

    constructor() {
        this.app = express();
        this.router = new Router();
        
        this.initializeMiddleware();
        this.initializeRoutes();
    }

    private initializeMiddleware(): void {
        this.app.use(express.json());
        this.app.use(errorHandler);
    }

    private initializeRoutes(): void {
        this.app.use('/', this.router.getRouter());
    }

    public async start(): Promise<void> {
        await new Promise((resolve) => this.app.listen(3000, resolve));
        console.log('Server started on port 3000');
    }
}