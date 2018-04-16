/**
 * Start of the watcher
 * The watchers are on each node and watch new container going up/down
 * and notify the proxy
 */

import * as dockerMonitor from 'node-docker-monitor';
import { Services } from './utils/services';
import { Proxy } from './utils/proxy';
import { Logger } from './utils/logger';
import { config } from './config';

const LOGTAG = '[app]';
let refreshInProgress = false;
let refreshAgain = false;

Logger.info(LOGTAG, `Starting watcher app`);

(dockerMonitor as any)({
  // Called when Docker Container is started (Also called on Startup)
  onContainerUp: function(container) {
    Logger.info(LOGTAG, `Container Up: ${container.Names[0]}`);
    refreshServices();
  },

  // Called when Docker Container is stoped
  onContainerDown: function(container) {
    Logger.info(LOGTAG, `Container Down: ${container.Names[0]}`);
    refreshServices();
  }
});

function refreshServices() {
  if (refreshInProgress) {
    refreshAgain = true;
    return;
  }
  refreshInProgress = true;
  Logger.info(LOGTAG, `Refreshing`);
  Services.list()
    .then(serviceList => {
      Logger.info(LOGTAG, `Found ${serviceList.length} valid service(s)`);
      return Proxy.send(Services.getNodeId(), serviceList);
    })
    .then(() => {
      doNextRefresh();
    })
    .catch(error => {
      Logger.error(LOGTAG, `Error refreshing services: ${error}`);
      doNextRefresh();
    });
}

function doNextRefresh(): void {
  refreshInProgress = false;
  if (refreshAgain) {
    refreshAgain = false;
    Logger.info(LOGTAG, `Refreshing again in 10s`);
    setTimeout(() => {
      refreshServices();
    }, 10000);
  } else {
    Logger.info(LOGTAG, `Next refresh in ${config.refreshInterval / 1000}s`);
    setTimeout(() => {
      refreshServices();
    }, config.refreshInterval);
  }
}
