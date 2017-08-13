const { Pool } = require('pg')

const connectionString = 'postgres://localhost:5432/quotes';
const pool = new Pool({ connectionString })
const TABLE = 'quotes';


const createQuote = async (data) => {
  const client = await pool.connect();

  const query = {
    text: `INSERT INTO ${TABLE}(text, phone, name, heard_by, ts) VALUES($1, $2, $3, $4, $5)`,
    values: [
      data.text, 
      data.said.phone, 
      data.said.name,
      JSON.stringify(data.heard),
      data.ts
    ]
  };

  try {
    const result = await client.query(query);
    return result;
  } catch (e) {
    throw e
  } finally {
    client.release()
  }
};

const findSaidBy = async (data) => {
  const { id, limit, scrollId } = data;
  const client = await pool.connect();

  const query = {
    text: `SELECT text, name, heard_by, ts FROM ${TABLE} where phone=$1 AND ts < $2 ORDER BY ts DESC LIMIT $3`,
    values: [id, scrollId, limit]
  }
  try {
    const result = await client.query(query);
    return result.rows
  } catch (e) {
    throw e
  } finally {
    client.release()
  };
};

const findHeardBy = async (data) => {
  const { id, limit, scrollId } = data;
  const client = await pool.connect();

  const query = {
    text: `SELECT text, name, heard_by, ts FROM ${TABLE} where heard_by @> $1 AND ts < $2 ORDER BY ts DESC LIMIT $3`,
    values: [JSON.stringify([{phone: id}]), scrollId, limit]
  }
  try {
    const result = await client.query(query);
    return result.rows
  } catch (e) {
    throw e
  } finally {
    client.release()
  };
};

const findAll = async (data) => {
  const { id, limit, scrollId } = data;
  const client = await pool.connect();

  const query = {
    text: `SELECT text, name, heard_by, ts FROM ${TABLE} where (heard_by @> $1 OR phone=$2) AND ts < $3 ORDER BY ts DESC LIMIT $4`,
    values: [JSON.stringify([{phone: id}]), id, scrollId, limit]
  }
  try {
    const result = await client.query(query);
    return result.rows
  } catch (e) {
    throw e
  } finally {
    client.release()
  };
};

const deleteAllQuotes = async (data) => {
  const client = await pool.connect();
  const query = `TRUNCATE TABLE ${TABLE}`
  console.log(query);
  try {
    const result = await client.query(query);
    console.log(result);
  } catch (e) {
    throw e
  } finally {
    client.release()
  };
};

module.exports = { createQuote, findSaidBy, findHeardBy, deleteAllQuotes };
