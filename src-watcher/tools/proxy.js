/**
 * Communication to the proxy
 */

const config = require('./config');
const logger = require('./logger');
const request = require('request');

const LOGTAG = '[proxy]';
const timeout = 10000;

class Proxy {
  /**
   * Send the list of services for current node
   * @param {Object} services Full list of services for this node
   * @return {Promise<void>}
   */
  send(nodeId, services) {
    return new Promise((resolve, reject) => {
      logger.info(`${LOGTAG} Sending services list to Proxy`);
      const param = {
        url: `${config.proxyUrl}/api/services`,
        json: { node: nodeId, services },
        timeout
      };
      request.post(param, (error, response, body) => {
        if (!error && response.statusCode == 201) {
          logger.info(`${LOGTAG} Services list sent to Proxy`);
          resolve();
        } else {
          const errorMsg = error || body;
          logger.error(`${LOGTAG} Error sending list to Proxy: ${errorMsg}`);
          reject(errorMsg);
        }
      });
    });
  }
}

// Public Interface
module.exports = new Proxy();
