const routes = require('express').Router();
const services = require('./services');
const certificates = require('./certificates');

routes.use('/api/services', services);
routes.use('/api/certificates', certificates);

'/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
};

module.exports = routes;
