import * as child_process from 'child_process';

const exec = child_process.exec;

export class SystemCommand {
  //
  public static execute(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        if (stderr) {
          return reject(stderr);
        }
        if (stdout) {
          resolve(stdout);
        }
      });
    });
  }
}
