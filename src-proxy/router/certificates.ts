/**
 * API Endpoint for letsencrypt certificate
 */

import { NextFunction, Request, Response, Router } from 'express';
import { ExpressWrapper } from './utils/express-wrapper';
import { Logger } from '../utils/logger';
import { config } from '../config';
import { SystemCommand } from '../utils/system-command';

export const certificatesRouter = ExpressWrapper.createRouter();

const LOGTAG = '[routes/services]';

certificatesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  Logger.info(LOGTAG, `POST /`);
  Logger.info(LOGTAG, `Renewing Certificate`);
  await SystemCommand.execute(config.letsencrypt.renewCommand)
    .then(() => {
      res.status(201).json({});
    })
    .catch(error => {
      Logger.error(LOGTAG, `POST /: Error: ${error}`);
      res.status(500).json({ error });
    });
  next();
});
