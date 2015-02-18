# dhcpd-lease-logger

Parses a dhcpd.leases file and stores/updates entries in a database. The
database records are uniquely identified by a hash of the following lease
properties:

* IP address
* Start date/time
* MAC address

## Usage

```bash
$ node app.js
```

When you run the application, as shown in the preceeding example, it
will look for a `config.json` in the same directory as `app.js`. This
`config.js` details where the lease file is to process, what sort
of logging should be done (and to where), and the database information.

Included in the same directory as `app.js` is the follwing
`config.json.example` file:

```javascript
{
  "app": {
    "leasesFile": "/var/lib/dhcpd/dhcpd.leases"
  },
  "winston": {
    "console": {
      "level": "debug",
      "silent": false,
      "colorize": true,
      "timestamp": true
    },
    "file": {
      "level": "info",
      "silent": true,
      "colorize": false,
      "timestamp": true,
      "filename": "/tmp/dhcpd-tracker.log"
    }
  },
  "db": {
    "url": {
      "adapter": "postgres",
      "host": "127.0.0.1",
      "port": 5432,
      "database": "dhcpd",
      "user": "dhcpd",
      "password": ""
    }
  }
}
```

Copy the `config.json.example` file to `config.json` and edit it to
fit your needs.

Additionally, you can specify an alternate `config.json` by passing
it as a parameter:

```bash
$ node app.js /path/to/alternate-config.json
```

For information on the logger options, see the [Winston][winston]
documentation.

[winston]: https://github.com/flatiron/winston

## Database

Included in the same directory as `app.js` is a `schema.sql` file. This
SQL file includes all of the statements necessary to setup the required
PostgreSQL database. You can run it as is:

```bash
$ psql -U postgres < schema.sql
```

However, it is recommended that you make a copy, adjust the copy to your
environment, and then import your copy.

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

# License

The [MIT][mit] license.

[mit]: http://jsumners.mit-license.org/