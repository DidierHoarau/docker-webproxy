/**
 * API Endpoint for letsencrypt certificate
 */

const certificateApi = require('express').Router();
const exec = require('child_process').exec;
const config = require('../config');
const logger = require('../tools/logger');

const LOGTAG = '[routes/services]';

certificateApi.post('/', (req, res) => {
  logger.info(`${LOGTAG} POST /`);
  logger.info(`${LOGTAG} Renewing Certificate`);
  renewCommand()
    .then(() => {
      return res.status(201).json({});
    })
    .catch(error => {
      logger.error(`${LOGTAG} POST /: Error: ${error}`);
      return res.status(500).json({ error });
    });
});

function renewCommand() {
  return new Promise((resolve, reject) => {
    exec(config.letsencrypt.renewCommand, (error, stdout, stderr) => {
      if (error) {
        logger.error(`${LOGTAG} ${error}`);
        return reject(error);
      }
      if (stderr) {
        logger.error(`${LOGTAG} ${stderr}`);
        return reject(stderr);
      }
      if (stdout) {
        logger.info(`${LOGTAG} ${stdout}`);
      }
      resolve();
    });
  });
}

module.exports = certificateApi;
