'use strict';

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var Lease = require('../lib/Lease');
var Parser = require('../lib/Parser');

lab.experiment('lease', function leaseExperiment() {
  var lease;

  lab.beforeEach(function clearLease(done) {
    lease = new Lease();

    done();
  });

  lab.test('returns true when all fields are null', function nullTest(done) {
    Code.expect(lease.ip).to.equal(null);
    Code.expect(lease.startDate).to.equal(null);
    Code.expect(lease.endDate).to.equal(null);
    Code.expect(lease.tstp).to.equal(null);
    Code.expect(lease.tsfp).to.equal(null);
    Code.expect(lease.atsfp).to.equal(null);
    Code.expect(lease.cltt).to.equal(null);
    Code.expect(lease.hardwareAddress).to.equal(null);
    Code.expect(lease.hardwareType).to.equal(null);
    Code.expect(lease.uid).to.equal(null);
    Code.expect(lease.clientHostname).to.equal(null);

    done();
  });

  var valuesString = `cast('0.0.0.0' as inet),null,null,null,null,null,null,null,null,null,null`;
  lab.test(`returns true when psqlValuesString = '${valuesString}'`, function valuesTest(done) {
    lease.ip = '0.0.0.0';
    Code.expect(lease.psqlValuesString()).to.equal(valuesString);

    done();
  });

  var setString = `ip = cast('0.0.0.0' as inet), start_date = null, ` +
    'end_date = null, tstp = null, tsfp = null, atsfp = null, cltt = null, ' +
    'hardware_address = null, hardware_type = null, uid = null, ' +
    'client_hostname = null';
  lab.test(`returns true when psqlSetVaulesString = '${setString}'`, function setValuesTest(done) {
    lease.ip = '0.0.0.0';
    Code.expect(lease.psqlSetValuesString()).to.equal(setString);

    done();
  });
});

lab.experiment('parser', function parserExperiment() {
  var leaseInput = `lease 172.28.101.91 {
      starts 2 2013/02/05 19:45:45;
      ends 3 2013/02/06 19:45:45;
      tstp 3 2013/02/06 19:45:45;
      binding state free;
      hardware ethernet 00:09:6e:0a:fc:54;
      set hwprint = "00:09:6e:0a:fc:54";
      set hostline = "AVE0AFC54";
      set testvar = %11;
    }`;

  function* leaseLines() {
    let lines = leaseInput.split(String.fromCharCode(10));
    let j = lines.length;
    for (let i = 0; i < j; i += 1) {
      yield lines[i];
    }
  }

  lab.test('returns true when lease parses correctly', function parserTest(done) {
    var parser = new Parser();
    var leaseParsed = function leaseParsed(lease) {
      Code.expect(lease.ip).to.equal('172.28.101.91');
      Code.expect(lease.startDate).to.equal('2013-02-05 19:45:45-05:00');
      Code.expect(lease.endDate).to.equal('2013-02-06 19:45:45-05:00');
      Code.expect(lease.tstp).to.equal('2013-02-06 19:45:45-05:00');
      Code.expect(lease.tsfp).to.equal(null);
      Code.expect(lease.atsfp).to.equal(null);
      Code.expect(lease.cltt).to.equal(null);
      Code.expect(lease.hardwareAddress).to.equal('00:09:6e:0a:fc:54');
      Code.expect(lease.hardwareType).to.equal('ethernet');
      Code.expect(lease.uid).to.equal(null);
      Code.expect(lease.clientHostname).to.equal('AVE0AFC54');


      done();
    };

    for (let line of leaseLines()) {
      parser.parseLine(line, leaseParsed);
    }
  });
});