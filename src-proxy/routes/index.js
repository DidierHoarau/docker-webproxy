// https://github.com/searsaw/express-routing-example

const routes = require('express').Router();
const services = require('./services');

routes.use('/api/services', services);

'/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
};

module.exports = routes;
