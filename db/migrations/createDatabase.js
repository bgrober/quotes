const pg = require('pg');

const connectionString = 'postgres://localhost:5432/';

const client = new pg.Client(connectionString);

const createDatabase = async () => {
  await client.connect();
  const query = client.query('CREATE DATABASE quotes');
  await query;
  client.end();
};

createDatabase();
