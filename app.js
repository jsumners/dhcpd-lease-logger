'use strict';
// Node core modules
var fs = require('fs');

// Third party modules
var anydb = require('any-db');
var moment = require('moment');
var sha256 = require('js-sha256').sha256;
var winston = require('winston');

// Local variables
var config = (function() {
  let argc = process.argv.length;
  let configFile = './config.json';

  if (argc > 2) {
    configFile = (process.argv[2].charAt(0) === '/') ?
      process.argv[2] : './' + process.argv[2];
  }

  return require(configFile);
}());
var shouldExit = false;
var log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(config.winston.console),
    new (winston.transports.File)(config.winston.file)
  ]
});

// Short circuit processing if the lease file doesn't exist
if (!fs.existsSync(config.app.leasesFile)) {
  log.error('Leases file, `{}`, was not found. Exiting', config.app.leasesFile);
  process.exit(1);
}

function logLease(lease) {
  log.debug('lease: `%s`', JSON.stringify(lease));
  let chr39 = String.fromCharCode(39);
  let hash = sha256(lease.ip + lease.startDate + lease.hardwareAddress);
  log.debug('hash: `%s`', hash);
  let query = 'insert into leases (record_date, ip, start_date, end_date, tstp, tsfp, ' +
    'atsfp, cltt, hardware_address, hardware_type, uid, client_hostname, hash) values (' +
    chr39 + moment().toISOString() + chr39 + ',' +
    lease.psqlValuesString() + ',' + chr39 + hash + chr39 + ')';

  db.query(
    query,
    [],
    function(err, res) {
      if (err) {
        log.error('error: %s', JSON.stringify(err));
        log.debug('query: %s', query);
      } else {
        log.debug('recorded inserted: `%s`', JSON.stringify(res));
        if (shouldExit) {
          process.exit();
        }
      }
    }
  );
}

function* parseFileData(data) {
  let lines = data.split(String.fromCharCode(10));
  let j = lines.length;
  for (let i = 0; i < j; i += 1) {
    log.debug("line %s = %s", i, lines[i]);
    yield lines[i];
  }
}

var db = anydb.createPool(config.db.url, config.db.poolOptions);
let parser = new require('./lib/Parser')();
let leasesFile = fs.readFileSync(config.app.leasesFile).toString();
let lines = parseFileData(leasesFile);
let line = lines.next();

do {
  parser.parseLine(line.value, logLease);
  line = lines.next();
} while (!line.done);

shouldExit = true;