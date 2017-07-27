/**
 * Docker Container Information Tools
 */

const _ = require('lodash');
const config = require('./config');

const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
let nodeId;

class Services {
  /**
   * Get the list of container Push the value to the array if new and defined
   * @return {Prommise<any[]>}
   */
  list() {
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

  /**
   * Get the node ID
   * @return {string} node id
   */

  getNodeId() {
    return nodeId;
  }
}

module.exports = new Services();

function validateService(container) {
  // Init
  let service = {
    id: null,
    node: null,
    name: null,
    node: null,
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
    service.address =
      container.NetworkSettings.Networks[config.network].IPAddress;
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
