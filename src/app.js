/**
 * Start of the application
 */

const
  dockerMonitor = require('node-docker-monitor'),
  dockerTools = require('./tools/docker'),
  proxy = require('./tools/proxy'),
  logger = require('./tools/logger');

const LOGTAG = '[app] ';

logger.log('info', LOGTAG + 'Starting app');

proxy.reset();

dockerMonitor({

  /**
   * Called when Docker Container is started (Also called on Startup)
   * @param {Object} container Container information
   * @return {undefined}
   */
  onContainerUp: function(container) {
    const service = dockerTools.getService(container);
    if (!service) { return; }
    logger.log('info', LOGTAG + 'Service UP: ' + JSON.stringify(service));
    proxy.register(service);
  },


  /**
   * Called when Docker Container is stoped
   * @param {Object} container Container information
   * @return {undefined}
   */
  onContainerDown: function(container) {
    const service = dockerTools.getService(container);
    if (!service) { return; }
    logger.log(LOGTAG + 'Service DOWN: ' + JSON.stringify(service).substring(0,20));
    proxy.deregister(service);
  }
  
});
