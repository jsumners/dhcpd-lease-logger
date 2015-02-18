'use strict';
// Node core modules
var events = require('events');
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
var log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(config.winston.console),
    new (winston.transports.File)(config.winston.file)
  ]
});
var emitter = new events.EventEmitter();

// Short circuit processing if the lease file doesn't exist
if (!fs.existsSync(config.app.leasesFile)) {
  log.error('Leases file, `{}`, was not found. Exiting', config.app.leasesFile);
  process.exit(1);
}

function logLease(lease) {
  log.debug('lease: `%s`', JSON.stringify(lease));
  var recordDate = moment().toISOString();
  var leaseValues = lease.psqlValuesString();
  var hash = new Buffer(
    sha256(lease.ip + lease.startDate + lease.hardwareAddress)
  );


  function doInsert() {
    let query = `insert into leases (record_date, ip, start_date, end_date, tstp, tsfp,
      atsfp, cltt, hardware_address, hardware_type, uid, client_hostname, hash) values (
      '${recordDate}', ${leaseValues}, cast('${hash}' as bytea))`;
    log.debug('query: `%s`', query);

    db.query(
      query,
      function(err, res) {
        emitter.emit('leaseProcessed');
        if (err) {
          log.error('Could not insert new record: `%s`', JSON.stringify(err));
          return;
        }

        log.debug('record inserted: `%s`', JSON.stringify(res));
      }
    );
  }

  function doUpdate() {
    let query = `update leases set record_date = '${recordDate}',
      ${lease.psqlSetValuesString()}, hash = cast('${hash}' as bytea) where
      hash = cast('${hash}' as bytea)`;
    log.debug('query: `%s`', query);

    db.query(
      query,
      function(err, res) {
        emitter.emit('leaseProcessed');
        if (err) {
          log.error('Could not update existing record: `%s`', JSON.stringify(err));
          return;
        }

        log.debug('record updated: `%s`', JSON.stringify(res));
      }
    );
  }

  db.query(
    `select count(1) as c from leases where hash = cast('${hash}' as bytea)`,
    function(err, res) {
      if (err) {
        log.error('Could not determine query type: `%s`', JSON.stringify(err));
        emitter.emit('recordProcessed');
        return;
      }

      if (parseInt(res.rows[0].c, 10) === 0) {
        doInsert();
      } else {
        doUpdate();
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

var leaseCount = 0;
function handleLease(lease) {
  leaseCount += 1;
  logLease(lease);
}

var processedCount = 0;
emitter.on('leaseProcessed', function recordProcessedHandler() {
  processedCount += 1;
  log.debug('[leaseCount: %s, processedCount: %s]', leaseCount, processedCount);
  if (processedCount === leaseCount) {
    db.end(); // clear the event queue so the app can exit
  }
});

var db = anydb.createConnection(config.db.url);
let parser = new require('./lib/Parser')();
let leasesFile = fs.readFileSync(config.app.leasesFile).toString();
let lines = parseFileData(leasesFile);
let line = lines.next();

do {
  parser.parseLine(line.value, handleLease);
  line = lines.next();
} while (!line.done);