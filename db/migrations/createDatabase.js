const pg = require('pg');

const connectionString = 'postgres://localhost:5432/';

const client = new pg.Client(connectionString);

const createDatabase = async () => {
  try { 
    await client.connect();
    const query = client.query('CREATE DATABASE quotes');
    await query;
    await client.end();
  } catch(err) {
    console.log('looks like migrations ran already');
    await client.end();
  }
};

createDatabase();
