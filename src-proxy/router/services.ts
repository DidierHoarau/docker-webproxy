/**
 * API Endpoint for container refresh notification
 */

import { NextFunction, Request, Response, Router } from 'express';
import { ExpressWrapper } from './utils/express-wrapper';
import { Logger } from '../utils/logger';
import { ServiceRegistry } from '../utils/service-registry';

export const servicesRouter = ExpressWrapper.createRouter();

const LOGTAG = '[routes/services]';
const serviceRegistry = new ServiceRegistry();

servicesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  Logger.info(LOGTAG, `POST /`);
  const node = req.body.node;
  const services = req.body.services;
  if (!node) {
    res.status(400).json({ error: 'node missing' });
    next();
    return;
  }
  if (!services) {
    res.status(400).json({ error: 'services missing' });
    next();
    return;
  }
  await serviceRegistry
    .update(node, services)
    .then(() => {
      res.status(201).json({});
    })
    .catch(error => {
      Logger.error(LOGTAG, `POST /: Error: ${error}`);
      res.status(500).json({ error: 'internal error' });
    });
  next();
});

servicesRouter.post('/update/', async (req: Request, res: Response, next: NextFunction) => {
  Logger.info(LOGTAG, `POST /`);
  await serviceRegistry
    .reload()
    .then(() => {
      res.status(201).json({});
    })
    .catch(error => {
      Logger.error(LOGTAG, `POST /: Error: ${error}`);
      res.status(500).json({ error: 'internal error' });
    });
  next();
});
