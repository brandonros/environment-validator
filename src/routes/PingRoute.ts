import { Router, Request, Response } from 'express';

export const pingRouter = Router();

pingRouter.get('/ping', (req: Request, res: Response) => {
    res.send('pong');
});
