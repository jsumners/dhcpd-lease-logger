create user dhcpd;
-- Change location to an empty directory owned by the postgres user
create tablespace dhcpd owner dhcpd location '/opt/local/var/db/postgresql94/dhcpd/';
create database dhcpd owner=dhcpd tablespace=dhcpd;

create table leases (
  id bigserial primary key,
  record_date timestamp with time zone,
  ip inet,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  tstp timestamp with time zone,
  tsfp timestamp with time zone,
  atsfp timestamp with time zone,
  cltt timestamp with time zone,
  hardware_address macaddr,
  hardware_type text,
  uid text,
  client_hostname text
) tablespace dhcpd;

create index record_date_index on leases (ip) tablespace dhcpd;
create index start_date_index on leases (start_date) tablespace dhcpd;
create index end_date_index on leases (end_date) tablespace dhcpd;
create index ip_index on leases (ip) tablespace dhcpd;
create index hardware_address_index on leases (hardware_address) tablespace dhcpd;
create index hardware_type_index on leases (hardware_type) tablespace dhcpd;
create index uid_index on leases (uid) tablespace dhcpd;
create index client_hostname_index on leases (client_hostname) tablespace dhcpd;

grant select on leases to dhcpd;
grant insert on leases to dhcpd;
grant delete on leases to dhcpd;
grant all privileges on leases_id_seq to dhcpd;