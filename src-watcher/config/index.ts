import * as fs from 'fs';

const CONFIG_FILE = `${__dirname}/config-${process.env.NODE_ENV || 'default'}.json`;

class Config {
  //
  public proxyUrl: string = 'http://webproxy-proxy:3000';
  public network: string = 'webproxy-network';
  public refreshInterval: number = 2 * 60 * 1000;

  public constructor() {
    const content = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const setIfSet = fieldName => {
      if (content[fieldName]) {
        this[fieldName] = content[fieldName];
      }
    };
    setIfSet('proxyUrl');
    setIfSet('network');
    setIfSet('refreshInterval');
  }
}

export const config = new Config();
