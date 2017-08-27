/**
 * API Endpoint for container refresh notification
 */

const servicesApi = require('express').Router();
const logger = require('../tools/logger');
const servicesRegistry = require('../tools/services-registry');

const LOGTAG = '[routes/services]';

servicesApi.post('/', (req, res) => {
  logger.info(`${LOGTAG} POST /`);
  const node = req.body.node;
  const services = req.body.services;
  if (!node) {
    return res.status(400).json({ error: 'node missing' });
  }
  if (!services) {
    return res.status(400).json({ error: 'services missing' });
  }
  servicesRegistry
    .update(node, services)
    .then(() => {
      return res.status(201).json({});
    })
    .catch(error => {
      logger.error(`${LOGTAG} POST /: Error: ${error}`);
      return res.status(500).json({ error: 'internal error' });
    });
});

module.exports = servicesApi;
