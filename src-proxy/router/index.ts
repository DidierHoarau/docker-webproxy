import { config } from '../config';
import { servicesRouter } from './services';
import { certificatesRouter } from './certificates';
import { ExpressWrapper } from './utils/express-wrapper';

export let router = ExpressWrapper.createRouter();

router.use(`${config.apiPath}/services`, servicesRouter);
router.use(`${config.apiPath}/certificates`, certificatesRouter);
