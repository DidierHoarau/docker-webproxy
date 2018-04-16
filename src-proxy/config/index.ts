import * as fs from 'fs';

const CONFIG_FILE = `${__dirname}/config-${process.env.NODE_ENV || 'default'}.json`;

class Config {
  //
  public port: number = 3000;
  public apiPath: string = '/api';
  public nginx: INginxConfig;
  public letsencrypt: ILetsencryptConfig;

  public constructor() {
    const content = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    this.nginx = content.nginx;
    this.letsencrypt = content.letsencrypt;
  }
}

export const config = new Config();

interface INginxConfig {
  configDir: string;
  reloadCommand: string;
}

interface ILetsencryptConfig {
  renewCommand: string;
  certbotRoot: string;
  letsencryptDir: string;
}
