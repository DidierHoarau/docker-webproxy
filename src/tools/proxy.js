/**
 * Consult registration tools
 * http://serverfault.com/questions/768509/lets-encrypt-with-an-nginx-reverse-proxy
 */


const
  config = require('./config'),
  logger = require('./logger'),
  exec = require('child_process').exec,
  fs = require('fs');

const LOGTAG = '[proxy] ';



class Proxy {

  /**
   * Un-Register the service to nginx
   * @param {Object} service Service Object
   * @return {undefined}
   */
  deregister(service) {
    const fileName = config.nginx.configDir + '/' + service.name + '.conf';
    if (fs.existsSync(fileName)) {
      fs.unlink(fileName, (err) => {
        if (err) { throw err; }
        logger.log('info', 'Successfully deleted ' + fileName);
      });
    }
    const fileNameHttps = config.nginx.configDir + '/' + service.name + '_https.conf';
    if (fs.existsSync(fileNameHttps)) {
      fs.unlink(fileNameHttps, (err) => {
        if (err) { throw err; }
        logger.log('info', 'Successfully deleted ' + fileName);
      });
    }
  }

  /**
   * Register the service to nginx
   * @param {Object} service Service Object
   * @return {undefined}
   */
  register(service) {

    // Common rules
    let httpsConfig = '';
    let configContent = '';
    let configServerName = 'server_name ' + service.name + ' www.' + service.name + '; \n';
    const configContentLocation = 'location / { \n\
      resolver        127.0.0.1; \n\
      proxy_pass http://' + service.coordinates.private.host + ':' + service.coordinates.private.ports[0] + '; \n\
      proxy_redirect off; \n\
      proxy_set_header Host $host; \n\
      proxy_set_header X-Real-IP $remote_addr; \n\
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \n\
      proxy_set_header X-Forwarded-Proto $scheme; \n\
    } \n\ ';


    // Http Config
    if (service.https) {
      logger.log('info', LOGTAG + service.name + ': Enable .well-known');
      httpsConfig = ' \n\
      location /.well-known { \n\
        alias ' + config.nginx.wellKnownDir + '/' + service.name + '/.well-known; \n\
      } \n\
      ';
    }
    if (service.https && fs.existsSync(config.nginx.letsencryptDir + '/live/' + service.name + '/fullchain.pem')) {
      logger.log('info', LOGTAG + service.name + ': Enable Https');
      configContent = 'server { \n\
        listen 80; \n\
        ' + configServerName + ' \n\
        return 301 https://$host$request_uri; \n\
      }';
    } else {
      configContent = 'server { \n\
        listen 80; \n\
        ' + configServerName + ' \n\
        ' + httpsConfig + '\n\
        ' + configContentLocation + '\n\
      }\n';
    }
    fs.writeFile(config.nginx.configDir + '/' + service.name + '.conf', configContent, function (err) {
      if (err) {
        logger.log('error', LOGTAG + err);
        throw err;
      }
      reload();
    });

    // Https Config
    if (service.https && fs.existsSync(config.nginx.letsencryptDir + '/live/' + service.name + '/fullchain.pem')) {
      const configContentHttps = 'server { \n\
        listen 443 ssl http2; \n\
        server_name ' + service.name + ' www.' + service.name + '; \n\
        ssl_certificate ' + config.nginx.letsencryptDir + '/live/' + service.name + '/fullchain.pem; \n\
        ssl_certificate_key ' + config.nginx.letsencryptDir + '/live/' + service.name + '/privkey.pem; \n\
        ssl_stapling on; \n\
        ssl_stapling_verify on; \n\
        add_header Strict-Transport-Security "max-age=31536000"; \n\
        location /.well-known { \n\
          alias ' + config.nginx.wellKnownDir + '/' + service.name + '/.well-known; \n\
        } \n\
        ' + configContentLocation + '\n\
      }\n';

      fs.writeFile(config.nginx.configDir + '/' + service.name + '_https.conf', configContentHttps, function (err) {
        if (err) {
          logger.log('error', LOGTAG + err);
          throw err;
        }
        reload();
      });
    }
  }

  /**
   * Reset the Configuration
   * @return {Promise} Th promise is resolved once the configuration is reset
   */
  reset() {
    logger.log('info', LOGTAG + 'Removing old configuration files...');
    const configFiles = fs.readdirSync(config.nginx.configDir);
    for (let i =0 ; i<configFiles.length ; i++) {
      logger.log('info', LOGTAG + 'Removing: ' + configFiles[i]);
      fs.unlinkSync(config.nginx.configDir + '/' + configFiles[i]);
    }
  }

}


/**
 * Reload NGINX
 * @return {undefined}
 */
function reload() {
  exec(config.nginx.reloadCommand,
    (error, stdout, stderr) => {
      if (stdout) {
        logger.log('info', LOGTAG + stdout);
      }
      if (error) {
        logger.log('error', LOGTAG + error);
      }
      if (stderr) {
        logger.log('error', LOGTAG + stderr);
      }
    }
  );
}




// Public Interface
module.exports = new Proxy();
