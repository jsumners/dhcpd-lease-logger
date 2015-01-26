'use strict';
var string = require('useful-string');
var chr39 = String.fromCharCode(39);

function Lease() {
  if (! (this instanceof Lease)) {
    return new Lease();
  }
}

Lease.prototype = {
  ip: null,
  startDate: null,
  endDate: null,
  tstp: null,
  tsfp: null,
  atsfp: null,
  cltt: null,
  hardwareAddress: null,
  hardwareType: null,
  uid: null,
  clientHostname: null
};

Lease.prototype.psqlValuesString = function psqlValuesString() {
  var result = '';
  var c = ',';
  var n = 'null,';

  function quote(value) {
    return string.format('{0}{1}{2}', chr39, value, chr39);
  }

  function val(prop) {
    return (prop) ? quote(prop) + c : n;
  }

  function ts(time) {
    return (time) ?
    'cast(' + quote(time) + ' as timestamp with time zone),' : n;
  }

  result += (this.ip) ? 'cast(' + quote(this.ip) + ' as inet),' : n;
  result += ts(this.startDate);
  result += ts(this.endDate);
  result += ts(this.tstp);
  result += ts(this.tsfp);
  result += ts(this.atsfp);
  result += ts(this.cltt);
  result += val(this.hardwareAddress);
  result += val(this.hardwareType);
  result += val(this.uid);
  result += val(this.clientHostname);

  return result.substring(0, result.length - 1);
};

exports = module.exports = Lease;
