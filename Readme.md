# dhcpd-lease-logger

Parses a dhcpd.leases file and stores/updates entries in a database. The
database records are uniquely identified by a hash of the following lease
properties:

* IP address
* Start date/time
* MAC address

## Engines

This applicaiton uses [ES6][es6] features. Specifically, generators and
templates. If you are not using an engine that supports these features,
then this application will not work for you. The following engines
are supported:

* [IO.js][iojs] (>=1.0.4)
* [Node][nodejs] (>=0.12) -- Must use `--harmony` or
  (`--harmony-generators --harmony-strings`) switches

[es6]: https://people.mozilla.org/~jorendorff/es6-draft.html
[iojs]: http://iojs.org/
[nodejs]: http://nodejs.org/