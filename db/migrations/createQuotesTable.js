const pg = require('pg');

const connectionString = 'postgres://localhost:5432/quotes';

const client = new pg.Client(connectionString);

const createTable = async () => {
  await client.connect();
  const query = client.query(
    'CREATE TABLE said(qid varchar PRIMARY KEY, text VARCHAR, phone VARCHAR not null, name VARCHAR, ts BIGINT);CREATE TABLE heard(qid varchar, phone VARCHAR not null, name VARCHAR);'
  )
  await query;
  await client.end();
};

createTable();
