import { Router, Request, Response } from 'express';
import { HealthService } from '../services/HealthService';

export const healthRouter = Router();
const healthService = new HealthService();

healthRouter.get('/healthz/ready', async (req: Request, res: Response) => {
    try {
        const status = await healthService.checkServices();
        res.status(200).json(status);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'error',
            message: 'Service Unavailable',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});