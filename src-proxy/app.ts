import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response, Router } from 'express';
import * as url from 'url';
import { config } from './config';
import { router } from './router';
import { ExpressWrapper } from './router/utils/express-wrapper';
import { Logger } from './utils/logger';
import { Nginx } from './utils/nginx';

const LOGTAG = '[app]';

Logger.info(LOGTAG, `====== Starting docker-webproxy proxy app ======`);

Nginx.reset();

const api = ExpressWrapper.createApi();

api.listen(config.port, () => {
  Logger.info(LOGTAG, `App listening on port ${config.port}`);
});

api.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  next();
});

api.use((req: any, res: Response, next: NextFunction) => {
  res.status(404);
  req.customApiLogging = { startDate: new Date() };
  Logger.info(LOGTAG, `${req.method} ${url.parse(req.url).pathname}`);
  next();
});

api.use(bodyParser.json());

api.use(router);

router.use((req: any, res: Response, next: NextFunction) => {
  Logger.info(
    LOGTAG,
    `API Response: ${res.statusCode}; ${new Date().getTime() -
      req.customApiLogging.startDate.getTime()}ms`
  );
  next();
});
