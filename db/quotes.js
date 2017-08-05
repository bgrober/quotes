const { Client } = require('pg');

const connectionString = 'postgres://localhost:5432/quotes';
const client = new Client({ connectionString });

client.connect();

const createQuote = async (data) => {
  const query = {
    text: 'INSERT INTO quotes(text, said_by, heard_by, ts) VALUES($1, $2, $3, to_timestamp($4))',
    values: [data.text, data.said_by, data.heard_by, Date.now() / 1000],
  };

  const result = await client.query(query);
  return result.rows[0];
};

const getQuotes = async (id) => {
  const query = {
    text: 'SELECT * from quotes where said_by = $1',
    values: [id],
  };

  const quotes = await client.query(query);

  return quotes.rows;
};

const getHeardBy = async (id) => {
  const query = {
    text: 'SELECT * from quotes where heard_by like $1',
    values: [`%${id}%`],
  };

  const quotes = await client.query(query);

  return quotes.rows;
};

const search = async (id, text) => {
  const query = {
    text: 'SELECT * from quotes where (heard_by like $1 OR said_by=$1) AND text like $2',
    values: [`%${id}%`, `%${text}%`],
  };

  const quotes = await client.query(query);

  return quotes.rows;
};

module.exports = { createQuote, getQuotes, getHeardBy, search };
