const pg = require('pg');

const connectionString = 'postgres://localhost:5432/quotes';

const client = new pg.Client(connectionString);

const createTable = async () => {
  try {
    await client.connect();
    const query = client.query(
      'CREATE TABLE users(id VARCHAR PRIMARY KEY, name VARCHAR not null, password VARCHAR not null)',
    );
    await query;
    await client.end();
  } catch(err) {
    await client.end();
  }
};

createTable();
