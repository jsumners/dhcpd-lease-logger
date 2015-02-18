'use strict';

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
  var n = 'null,';

  function ts(time) {
    return (time) ? `cast('${time}' as timestamp with time zone),` : n;
  }

  result += (this.ip) ? `cast('${this.ip}' as inet),` : n;
  result += ts(this.startDate);
  result += ts(this.endDate);
  result += ts(this.tstp);
  result += ts(this.tsfp);
  result += ts(this.atsfp);
  result += ts(this.cltt);
  result += (this.hardwareAddress) ? `'${this.hardwareAddress}',` : n;
  result += (this.hardwareType) ? `'${this.hardwareType}',` : n;
  result += (this.uid) ? `'${this.uid}',` : n;
  result += (this.clientHostname) ? `'${this.clientHostname}',` : n;

  return result.substring(0, result.length - 1);
};

Lease.prototype.psqlSetValuesString = function psqlSetValuesString() {
  var result = '';
  var n = 'null, ';

  function ts(time) {
    return (time) ? `cast('${time}' as timestamp with time zone), ` : n;
  }

  function val(v) {
    return (v) ? `'${v}', ` : n;
  }

  result += (this.ip) ? `ip = cast('${this.ip}' as inet), ` : n;
  result += `start_date = ${ts(this.startDate)}`;
  result += `end_date = ${ts(this.endDate)}`;
  result += `tstp = ${ts(this.tstp)}`;
  result += `tsfp = ${ts(this.tsfp)}`;
  result += `atsfp = ${ts(this.atsfp)}`;
  result += `cltt = ${ts(this.cltt)}`;
  result += `hardware_address = ${val(this.hardwareAddress)}`;
  result += `hardware_type = ${val(this.hardwareType)}`;
  result += `uid = ${val(this.uid)}`;
  result += `client_hostname = ${val(this.clientHostname)}`;

  return result.substring(0, result.length - 2);
};

exports = module.exports = Lease;
