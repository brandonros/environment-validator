import { Router } from 'express';
import { HealthService } from '../services/HealthService';

export const healthRouter = Router();
const healthService = new HealthService();

healthRouter.get('/healthz/ready', async (req, res) => {
    const status = await healthService.checkServices();
    res.status(200).json(status);
});