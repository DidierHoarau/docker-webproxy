/**
 * Start of the watcher
 * The watchers are on each node and watch new container going up/down
 * and notify the proxy
 */

const dockerMonitor = require('node-docker-monitor');
const services = require('./tools/services');
const proxy = require('./tools/proxy');
const logger = require('./tools/logger');
const config = require('./tools/config');

const LOGTAG = '[app]';
let refreshInProgress = false;
let refreshAgain = false;

logger.info(`${LOGTAG} Starting watcher app`);

dockerMonitor({
  // Called when Docker Container is started (Also called on Startup)
  onContainerUp: function(container) {
    logger.info(`${LOGTAG} Container Up: ${container.Names[0]}`);
    refreshServices();
  },

  // Called when Docker Container is stoped
  onContainerDown: function(container) {
    logger.info(`${LOGTAG} Container Down: ${container.Names[0]}`);
    refreshServices();
  }
});

function refreshServices() {
  if (refreshInProgress) {
    refreshAgain = true;
    return;
  }
  refreshInProgress = true;
  logger.info(`${LOGTAG} Refreshing`);
  services
    .list()
    .then(serviceList => {
      logger.info(`${LOGTAG} Found ${serviceList.length} valid service(s)`);
      return proxy.send(services.getNodeId(), serviceList);
    })
    .then(() => {
      doNextRefresh();
    })
    .catch(error => {
      logger.error(`${LOGTAG} Error refreshing services: ${error}`);
      doNextRefresh();
    });
}

function doNextRefresh() {
  refreshInProgress = false;
  if (refreshAgain) {
    refreshAgain = false;
    logger.info(`${LOGTAG} Refreshing again in 10s`);
    setTimeout(() => {
      refreshServices();
    }, 10000);
  } else {
    logger.info(`${LOGTAG} Next refresh in ${config.refreshInterval / 1000}s`);
    setTimeout(() => {
      refreshServices();
    }, config.refreshInterval);
  }
}
