/**
 * Docker Container Information Tools
 */

import * as _ from 'lodash';
import { config } from '../config';

const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
let nodeId;

export class Services {
  //
  public static list(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const serviceList = [];
      docker.listContainers((err, containers) => {
        if (err) {
          return reject(err);
        }
        containers.forEach(containerInfo => {
          checkNode(containerInfo);
          const serviceInfo = validateService(containerInfo);
          if (serviceInfo) {
            serviceList.push(serviceInfo);
          }
        });
        resolve(serviceList);
      });
    });
  }

  public static getNodeId(): string {
    return nodeId;
  }
}

function validateService(container) {
  // Init
  const service = {
    id: null,
    node: null,
    name: null,
    address: null,
    port: null,
    https: false
  };

  // If not supported
  if (!container.Labels || !container.Labels['discovery.service.name']) {
    return null;
  }

  service.id = container.Id;
  service.name = container.Labels['discovery.service.name'];
  service.port = container.Labels['discovery.service.port'];
  if (_.has(container, 'NetworkSettings.Networks.' + config.network)) {
    service.address = container.NetworkSettings.Networks[config.network].IPAddress;
  }
  if (container.Labels['discovery.service.https'] === 'y') {
    service.https = true;
  }
  if (container.Labels['com.docker.swarm.node.id']) {
    service.node = container.Labels['com.docker.swarm.node.id'];
  }
  return service;
}

function checkNode(container) {
  // If already set
  if (nodeId) {
    return;
  }
  if (!container.Labels || !container.Labels['com.docker.swarm.node.id']) {
    nodeId = 'local';
  } else {
    nodeId = container.Labels['com.docker.swarm.node.id'];
  }
}
