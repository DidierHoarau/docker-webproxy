/**
 * Docker Container Information Tools
 */

const _ = require('lodash');
const nginx = require('./nginx');
const logger = require('./logger');

const LOGTAG = '[known-services]';
const servicesRegistry = [];

// Public Functions
class KnownServices {
  //
  update(node, updatedServices) {
    return new Promise(resolve => {
      let isUpdated = false;
      // Check new services
      _.forEach(updatedServices, updatedService => {
        const registryItem = _.find(servicesRegistry, {
          name: updatedService.name
        });
        // Service name unknown
        if (!registryItem) {
          isUpdated = true;
          servicesRegistry.push({
            name: updatedService.name,
            entries: [{ timestamp: new Date(), node, details: updatedService }]
          });
        } else {
          // Service name known but not for this node
          if (!_.find(registryItem.entries, { node })) {
            isUpdated = true;
            registryItem.entries.push({
              timestamp: new Date(),
              node,
              details: updatedService
            });
          }
        }
      });
      // Remove obsolete services from this node
      _.forEach(servicesRegistry, registryItem => {
        if (!_.find(updatedServices, { name: registryItem.name })) {
          const indexToRemove = _.findIndex(registryItem.entries, { node });
          if (indexToRemove >= 0) {
            isUpdated = true;
            registryItem.entries.splice(indexToRemove, 1);
          }
        }
      });
      // Continue
      if (isUpdated) {
        logger.info(`${LOGTAG} Updates found`);
        logger.info(`${LOGTAG} Reseting proxy rules`);
        nginx.reset().then(() => {
          let nbRulesTodo = servicesRegistry.length;
          const checkFinished = () => {
            if (nbRulesTodo <= 0) {
              logger.info(`${LOGTAG} Rules reset done`);
              resolve();
            }
          };
          checkFinished();
          _.forEach(servicesRegistry, registryItem => {
            if (registryItem.entries.length == 0) {
              nbRulesTodo--;
              checkFinished();
            } else {
              nginx
                .register(registryItem.entries[0].details)
                .then(() => {
                  nbRulesTodo--;
                  checkFinished();
                })
                .catch(() => {
                  nbRulesTodo--;
                  checkFinished();
                });
            }
          });
        });
        resolve();
      } else {
        logger.info(`${LOGTAG} No updates found`);
        resolve();
      }
    });
  }
}

module.exports = new KnownServices();
