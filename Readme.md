# dhcpd-lease-logger

Parses a dhcpd.leases file and stores/updates entries in a database. The
database records are uniquely identified by a hash of the following lease
properties:

* IP address
* Start date/time
* MAC address
