const pg = require('pg');

const connectionString = 'postgres://localhost:5432/quotes';

const client = new pg.Client(connectionString);

const createTable = async () => {
  await client.connect();
  const query = client.query(
    'CREATE TABLE quotes(text VARCHAR, said_by VARCHAR not null, heard_by VARCHAR, ts TIMESTAMP)',
  );
  await query;
  await client.end();
};

createTable();
