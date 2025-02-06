import { Router as ExpressRouter } from "express";
import { healthRouter } from '../routes/HealthRoute';
import { pingRouter } from '../routes/PingRoute';

export class Router {
    private readonly router: ExpressRouter;

    constructor() {
        this.router = ExpressRouter();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.use('/', pingRouter);
        this.router.use('/', healthRouter);
    }

    public getRouter(): ExpressRouter {
        return this.router;
    }
}