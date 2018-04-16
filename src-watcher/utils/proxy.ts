/**
 * Communication to the proxy
 */

import { config } from '../config';
import { Logger } from './logger';
import * as request from 'request';

const LOGTAG = '[proxy]';
const timeout = 10000;

export class Proxy {
  //
  public static send(nodeId, services): Promise<void> {
    return new Promise((resolve, reject) => {
      Logger.info(LOGTAG, `Sending services list to Proxy`);
      const param = {
        url: `${config.proxyUrl}/api/services`,
        json: { node: nodeId, services },
        timeout
      };
      request.post(param, (error, response, body) => {
        if (!error && response.statusCode == 201) {
          Logger.info(LOGTAG, `Services list sent to Proxy`);
          resolve();
        } else {
          const errorMsg = error || body;
          Logger.error(LOGTAG, `Error sending list to Proxy: ${errorMsg}`);
          reject(errorMsg);
        }
      });
    });
  }
}
