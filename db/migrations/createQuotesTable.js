const pg = require('pg');

const connectionString = 'postgres://localhost:5432/quotes';

const client = new pg.Client(connectionString);

const createTable = async () => {
  await client.connect();
  const query = client.query(
    'CREATE TABLE quotes(text VARCHAR, phone VARCHAR not null, name VARCHAR, heard_by JSONb, ts BIGINT);'
  )
  await query;
  await client.end();
};

createTable();
