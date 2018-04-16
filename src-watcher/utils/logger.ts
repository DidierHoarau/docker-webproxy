import * as logger from 'winston';

logger.configure({
  level: 'debug',
  transports: [
    new logger.transports.Console({
      colorize: true
    })
  ]
});

export class Logger {
  public static debug(tag: string, message: Error | string): void {
    logger.debug(tag, message);
  }
  public static info(tag: string, message: Error | string): void {
    logger.info(tag, message);
  }
  public static warn(tag: string, message: Error | string): void {
    logger.warn(tag, message);
  }
  public static error(tag: string, message: Error | string): void {
    logger.error(tag, message);
  }
}
