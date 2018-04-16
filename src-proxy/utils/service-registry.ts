import * as _ from 'lodash';
import { Nginx } from './nginx';
import { Logger } from './logger';

const LOGTAG = '[service-registry]';

export class ServiceRegistry {
  //
  private servicesKnown: any[];
  private servicesRegistered: any[];

  constructor() {
    this.servicesKnown = [];
    this.servicesRegistered = [];
  }

  public update(node: string, updatedServices: any): Promise<void> {
    return Promise.resolve().then(() => {
      // Check new services
      _.forEach(updatedServices, updatedService => {
        const knownItem = _.find(this.servicesKnown, {
          name: updatedService.name
        });
        // Service unknown
        if (!knownItem) {
          this.servicesKnown.push({
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
          const previousNodeEntry: any = _.find(knownItem.entries, { node });
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
      _.forEach(this.servicesKnown, knownItem => {
        if (!_.find(updatedServices, { name: knownItem.name })) {
          const indexToRemove = _.findIndex(knownItem.entries, { node });
          if (indexToRemove >= 0) {
            knownItem.entries.splice(indexToRemove, 1);
          }
        }
      });

      // Compute new list of services to registered
      const servicesRegisteredNew = [];
      _.forEach(this.servicesKnown, knownItem => {
        if (knownItem.entries.length > 0) {
          servicesRegisteredNew.push({
            name: knownItem.name,
            details: knownItem.entries[0].details
          });
        }
        servicesRegisteredNew;
      });

      // Register to Nginx
      if (!_.isEqual(this.servicesRegistered, servicesRegisteredNew)) {
        this.servicesRegistered = servicesRegisteredNew;
        Logger.info(LOGTAG, `Updates found`);
        return this.reload();
      } else {
        this.servicesRegistered = servicesRegisteredNew;
        Logger.info(LOGTAG, `No updates found`);
        return Promise.resolve();
      }
    });
  }

  public reload(): Promise<void> {
    return new Promise(resolve => {
      Logger.info(LOGTAG, `Reseting proxy rules`);
      Nginx.reset().then(() => {
        let nbRulesTodo = this.servicesKnown.length;
        const checkFinished = () => {
          if (nbRulesTodo <= 0) {
            Logger.info(LOGTAG, `Rules reset done`);
            resolve();
          }
        };
        checkFinished();
        _.forEach(this.servicesRegistered, registeredItem => {
          Nginx.register(registeredItem.details)
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
