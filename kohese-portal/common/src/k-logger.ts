var bunyan = require('bunyan');

export class KLogger {
  private logger : any;

  constructor () {
    
  }

  createLogger(options) {
    this.logger = bunyan.createLogger({
      name : 'Default logger',
    })
  }
}