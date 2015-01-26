'use strict';
var moment = require('moment');

var Lease = require('./Lease');
var lease = null;

// TODO: support epoch times
var leaseStartLine = /^lease (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) {$/;
var startsLine = /^\s+starts (\d+ \d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2});$/;
var endsLine = /^\s+ends (\d+ \d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2});$/;
var tstpLine = /^\s+tstp (\d+ \d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2});$/;
var tsfpLine = /^\s+tsfp (\d+ \d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2});$/;
var atsfpLine = /^\s+atsfp (\d+ \d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2});$/;
var clttLine = /^\s+cltt (\d+ \d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2});$/;
var hardwareLine = /^\s+hardware (\w+) (\w{2}:\w{2}:\w{2}:\w{2}:\w{2}:\w{2});$/;
var leaseEndLine = /^}$/;

function getPsql84Date(inputString) {
  return moment(inputString, 'E YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ssZ');
}

/**
 * A <code>Parser</code> has a single {@link Parser#parseLine} method that
 * is used to parse a DHCPDv4 lease block one line at a time.
 *
 * @returns {Parser}
 * @constructor
 */
function Parser() {
  if (! (this instanceof Parser)) {
    return new Parser();
  }
}

/**
 * This callback is invoked when a lease has been fully parsed.
 *
 * @callback Parser~LeaseParsedCallback
 * @param {object} lease An instance of {@link Lease}
 */

/**
 * Parses an ISC DHCPDv4 line and updates a {@link Lease} accordingly. When
 * the last line of a lease has been parsed, the passed in callback,
 * <code>cb</code> will be invoked.
 *
 * @param {string} line The line to parse for lease information
 * @param {Parser~LeaseParsedCallback} cb The callback to invoke after fully
 *        parsing the lease block
 */
Parser.prototype.parseLine = function parseLine(line, cb) {
  if (leaseStartLine.test(line)) {
    lease = new Lease();
    lease.ip = leaseStartLine.exec(line)[1];
    return;
  }

  if (startsLine.test(line)) {
    lease.startDate = getPsql84Date(startsLine.exec(line)[1]);
    return;
  }

  if (endsLine.test(line)) {
    lease.endDate = getPsql84Date(endsLine.exec(line)[1]);
    return;
  }

  if (tstpLine.test(line)) {
    lease.tstp = getPsql84Date(tstpLine.exec(line)[1]);
    return;
  }

  if (tsfpLine.test(line)) {
    lease.tsfp = getPsql84Date(tsfpLine.exec(line)[1]);
    return;
  }

  if (atsfpLine.test(line)) {
    lease.atsfp = getPsql84Date(atsfpLine.exec(line)[1]);
    return;
  }

  if (clttLine.test(line)) {
    lease.cltt = getPsql84Date(clttLine.exec(line)[1]);
    return;
  }

  if (hardwareLine.test(line)) {
    var parts = hardwareLine.exec(line);
    lease.hardwareType = parts[1];
    lease.hardwareAddress = parts[2];
    return;
  }

  if (leaseEndLine.test(line)) {
    cb(lease);
    return;
  }
};

exports = module.exports = Parser;
