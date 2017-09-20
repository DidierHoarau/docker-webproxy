/**
 * Docker Container Information Tools
 */

const _ = require('lodash');
const nginx = require('./nginx');
const logger = require('./logger');

const LOGTAG = '[known-services]';
const servicesKnown = [];
let servicesRegistered = [];

// Public Functions
class KnownServices {
  //
  update(node, updatedServices) {
    return Promise.resolve().then(() => {
      // Check new services
      _.forEach(updatedServices, updatedService => {
        const knownItem = _.find(servicesKnown, {
          name: updatedService.name
        });
        // Service unknown
        if (!knownItem) {
          servicesKnown.push({
            name: updatedService.name,
            entries: [
              {
                timestamp: new Date(),
                node,
                details: updatedService
              }
            ]
          });
        } else {
          // Service name known but not for this node
          const previousNodeEntry = _.find(knownItem.entries, { node });
          if (!previousNodeEntry) {
            knownItem.entries.push({
              timestamp: new Date(),
              node,
              details: updatedService
            });
          } else {
            // If content different
            if (previousNodeEntry.details.id !== updatedService.id) {
              previousNodeEntry.timestamp = new Date();
              previousNodeEntry.details = updatedService;
            }
          }
        }
      });
      // Remove obsolete services from this node
      _.forEach(servicesKnown, knownItem => {
        if (!_.find(updatedServices, { name: knownItem.name })) {
          const indexToRemove = _.findIndex(knownItem.entries, { node });
          if (indexToRemove >= 0) {
            knownItem.entries.splice(indexToRemove, 1);
          }
        }
      });

      // Compute new list of services to registered
      const servicesRegisteredNew = [];
      _.forEach(servicesKnown, knownItem => {
        if (knownItem.entries.length > 0) {
          servicesRegisteredNew.push({
            name: knownItem.name,
            details: knownItem.entries[0].details
          });
        }
        servicesRegisteredNew;
      });

      // Register to Nginx
      if (!_.isEqual(servicesRegistered, servicesRegisteredNew)) {
        servicesRegistered = servicesRegisteredNew;
        logger.info(`${LOGTAG} Updates found`);
        return this.reload();
      } else {
        servicesRegistered = servicesRegisteredNew;
        logger.info(`${LOGTAG} No updates found`);
        return Promise.resolve();
      }
    });
  }

  reload() {
    return new Promise(resolve => {
      logger.info(`${LOGTAG} Reseting proxy rules`);
      nginx.reset().then(() => {
        let nbRulesTodo = servicesKnown.length;
        const checkFinished = () => {
          if (nbRulesTodo <= 0) {
            logger.info(`${LOGTAG} Rules reset done`);
            resolve();
          }
        };
        checkFinished();
        _.forEach(servicesRegistered, registeredItem => {
          nginx
            .register(registeredItem.details)
            .then(() => {
              nbRulesTodo--;
              checkFinished();
            })
            .catch(() => {
              nbRulesTodo--;
              checkFinished();
            });
        });
      });
    });
  }
}

module.exports = new KnownServices();
