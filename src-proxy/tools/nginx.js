/**
 * Manages Nginx rules
 * http://serverfault.com/questions/768509/lets-encrypt-with-an-nginx-reverse-proxy
 */

const config = require('../config');
const logger = require('./logger');
const exec = require('child_process').exec;
const fs = require('fs-extra');

const LOGTAG = '[nginx]';

class Nginx {
  /**
   * Register the service to nginx
   * @param {Object} service Service Object
   * @return {undefined}
   */
  register(service) {
    return new Promise((resolve, reject) => {
      let wellKnownConfig = '';
      let configContent = '';
      let configContentHttps;

      const configServerName = `server_name ${service.name} www.${service.name}; `;
      let configContentLocation = `
          location / {
            resolver        127.0.0.1;
            proxy_pass http://${service.address}:${service.port};
            proxy_redirect off;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
          }  `;
      const configContentLocationHttps = configContentLocation;

      // Https Config
      if (service.https) {
        logger.info(`${LOGTAG} ${service.name}: Enable .well-known`);
        wellKnownConfig = `
            location /.well-known/ {
              alias ${config.letsencrypt.certbotRoot}/${service.name}/.well-known/;
            } `;
      }
      if (service.https && fs.existsSync(`${config.letsencrypt.letsencryptDir}/live/${service.name}/fullchain.pem`)) {
        logger.info(`${LOGTAG} ${service.name}: Enable Https`);
        configContentLocation = `
            location / {
               return 301 https://$host$request_uri;
            }`;
        configContentHttps = `
            server {
              listen 443 ssl http2;
              server_name ${service.name} www.${service.name};
              ssl_certificate ${config.letsencrypt.letsencryptDir}/live/${service.name}/fullchain.pem;
              ssl_certificate_key ${config.letsencrypt.letsencryptDir}/live/${service.name}/privkey.pem;
              ssl_stapling on;
              ssl_stapling_verify on;
              add_header Strict-Transport-Security "max-age=31536000";
              ${wellKnownConfig}
              ${configContentLocationHttps}
            }`;
      }
      configContent = `
          server {
            listen 80;
            ${configServerName}
            ${wellKnownConfig}
            ${configContentLocation}
          }`;
      fs.ensureDir(`${config.letsencrypt.certbotRoot}/${service.name}/.well-known`).then(() => {
        return fs
          .writeFile(`${config.nginx.configDir}/${service.name}.conf`, configContent)
          .then(() => {
            if (configContentHttps) {
              return fs.writeFile(`${config.nginx.configDir}/${service.name}_https.conf`, configContentHttps);
            } else {
              return Promise.resolve();
            }
          })
          .then(() => {
            return reload();
          })
          .then(() => {
            resolve();
          })
          .catch(error => {
            logger.error(`${LOGTAG} ${error}`);
            reject(error);
          });
      });
    });
  }

  /**
   * Reset the Configuration
   * @return {Promise<void>} Th promise is resolved once the configuration is reset
   */
  reset() {
    return new Promise(resolve => {
      logger.info(`${LOGTAG} Removing old configuration files...`);
      fs.ensureDir(config.nginx.configDir).then(() => {
        const configFiles = fs.readdirSync(config.nginx.configDir);
        for (let i = 0; i < configFiles.length; i++) {
          logger.info(`${LOGTAG} Removing: ${configFiles[i]}`);
          fs.unlinkSync(`${config.nginx.configDir}/${configFiles[i]}`);
        }
        resolve();
      });
    });
  }
}

/**
 * Reload NGINX
 * @return {undefined}
 */
function reload() {
  return new Promise((resolve, reject) => {
    exec(config.nginx.reloadCommand, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        return reject(stderr);
      }
      if (stdout) {
        logger.info(`${LOGTAG} ${stdout}`);
        resolve();
      }
    });
  });
}

// Public Interface
module.exports = new Nginx();
