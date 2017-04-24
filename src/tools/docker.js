/**
 * Docker Container Information Tools
 */


/**
 * Push the value to the array if new and defined
 * @param {Array} array Array to scan
 * @param {Array} value The value to add
 * @return {undefined}
 */
function arrayPushIfNew(array, value) {
  if (!value) {
    return;
  }
  for (let i = 0; i < array.length; i++) {
    if (array[i] == value) {
      return;
    }
  }
  array.push(value);
}



// Public Functions
module.exports = {


  /**
   * Get the name of the service
   * Name only checked in label: tg.discovery.service.name
   * @param {Object} container Container Object
   * @return {Object} { name , coordinates :
   *                      { private: [ { host , port } ] ,
   *                        public:  [ { host , port } ] } }
   */
  getService: function (container) {

    // Init
    let service = {
      name: null,
      coordinates: {
        public: {
          host: '0.0.0.0',
          ports: []
        },
        private: {
          host: null,
          ports: []
        }
      }
    };

    // If not supported
    if (!container.Labels || !container.Labels['discovery.service.name']) {
      return null;
    }

    // Name
    service.name = container.Labels['discovery.service.name'];

    // Public Host
    for (let net_definition_key in container.NetworkSettings.Networks) {
      let net_definition = container.NetworkSettings.Networks[net_definition_key];
      service.coordinates.private.host = net_definition.IPAddress;
      break;
    }

    // Ports
    for (let i = 0; i < container.Ports.length; i++) {
      let port_definition = container.Ports[i];

      arrayPushIfNew(service.coordinates.private.ports, port_definition.PrivatePort);
      arrayPushIfNew(service.coordinates.public.ports, port_definition.PublicPort);

    }

    // If Specified port
    if (container.Labels['discovery.service.port']) {
      service.coordinates.private.ports = [container.Labels['discovery.service.port']];
    }

    // HTTPS?
    if (container.Labels['discovery.service.https'] === 'y') {
      service.https = true;
    }


    // Results
    return service;
  }



};
