const app = require('express')();
const routes = require('./routes');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const logger = require('./tools/logger');
const nginx = require('./tools/nginx');

const LOGTAG = '[app] ';

// Reset
nginx.reset();

// Api
app.use(bodyParser.json());
app.use('/', routes);
app.listen(PORT, () => {
  logger.info(`${LOGTAG} App listening on port ${PORT}`);
});
