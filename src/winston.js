const appRoot = require('app-root-path');
const winston = require('winston');

//
// Requiring `winston-papertrail` will expose
// `winston.transports.Papertrail`
//
require('winston-papertrail').Papertrail;

let winstonPapertrail;
if (process.env.PT_PORT && process.env.PT_HOST) {
  winstonPapertrail = new winston.transports.Papertrail({
    host: process.env.PT_HOST,
    port: process.env.PT_PORT,
    hostname: process.env.PUBLIC_ADDRESS,
    level: 'info',
    handleExceptions: true,
    colorize: true
  });
  // eslint-disable-next-line no-unused-vars
  winstonPapertrail.on('error', function(err) {
    // Handle, report, or silently ignore connection errors and failures
  });
}

const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: 'info',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};
const transports = [];
if (winstonPapertrail) {
  transports.push(winstonPapertrail);
} else {
  transports.push(new winston.transports.File(options.file));
}
transports.push(new winston.transports.Console(options.console));
const logger = new winston.Logger({
  transports,
  exitOnError: false // do not exit on handled exceptions
});

logger.stream = {
  // eslint-disable-next-line no-unused-vars
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
