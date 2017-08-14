const { Pool } = require('pg');
const uuid = require('uuid/v1');

const connectionString = 'postgres://localhost:5432/quotes';
const pool = new Pool({ connectionString });
const saidTable = 'said';
const heardTable = 'heard';

const createQuote = async (data) => {
  const client = await pool.connect();
  const qid = uuid();

  const saidQuery = {
    text: `INSERT INTO ${saidTable}(qid, text, phone, name, ts) VALUES($1, $2, $3, $4, $5)`,
    values: [
      qid,
      data.text,
      data.said.phone,
      data.said.name,
      data.ts,
    ],
  };

  try {
    await client.query('BEGIN');
    await client.query(saidQuery);

    data.heard.forEach(async (obj) => {
      const heardQuery = {
        text: `INSERT INTO ${heardTable}(qid, phone, name) VALUES($1, $2, $3)`,
        values: [qid, obj.phone, obj.name],
      };
      await client.query(heardQuery);
    });
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
    return 'ok'
  }
};

const findSaidBy = async (data) => {
  const { id, limit, scrollId } = data;
  const client = await pool.connect();

  const query = {
    text: `SELECT * FROM (${saidTable} JOIN (SELECT t.qid, array_agg(t.heard) as heard, array_agg(t.heardphone) as heardphone FROM (SELECT s.qid, s.name as said, s.phone as saidphone, s.text, s.ts, h.name as heard, h.phone as heardphone FROM ${saidTable} s JOIN ${heardTable} h ON s.qid=h.qid) t GROUP BY t.qid) d ON ${saidTable}.qid=d.qid) WHERE phone=$1 AND ts < $2 ORDER BY ts DESC LIMIT $3;`,
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
    text: `SELECT * FROM (${saidTable} JOIN (SELECT t.qid, array_agg(t.heard) as heard, array_agg(t.heardphone) as heardphone FROM (SELECT s.qid, s.name as said, s.phone as saidphone, s.text, s.ts, h.name as heard, h.phone as heardphone FROM ${saidTable} s JOIN ${heardTable} h ON s.qid=h.qid) t GROUP BY t.qid) d ON ${saidTable}.qid=d.qid) WHERE heardphone @> $1 AND ts < $2 ORDER BY ts DESC LIMIT $3;`,
    values: [`{${id}}`, scrollId, limit]
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
    text: `SELECT * FROM (${saidTable} JOIN (SELECT t.qid, array_agg(t.heard) as heard, array_agg(t.heardphone) as heardphone FROM (SELECT s.qid, s.name as said, s.phone as saidphone, s.text, s.ts, h.name as heard, h.phone as heardphone FROM ${saidTable} s JOIN ${heardTable} h ON s.qid=h.qid) t GROUP BY t.qid) d ON ${saidTable}.qid=d.qid) WHERE (phone=$1 OR heardphone @> $2) AND ts < $3 ORDER BY ts DESC LIMIT $4;`,
    values: [id, `{${id}}`, scrollId, limit]
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

const search = async (data) => {
  const { id, text, limit, scrollId } = data;
  const client = await pool.connect();

  const query = {
    text: `SELECT * FROM (${saidTable} JOIN (SELECT t.qid, array_agg(t.heard) as heard, array_agg(t.heardphone) as heardphone FROM (SELECT s.qid, s.name as said, s.phone as saidphone, s.text, s.ts, h.name as heard, h.phone as heardphone FROM ${saidTable} s JOIN ${heardTable} h ON s.qid=h.qid) t GROUP BY t.qid) d ON ${saidTable}.qid=d.qid) WHERE (phone=$1 OR heardphone @> $2) AND text ILIKE $3 AND ts < $4 ORDER BY ts DESC LIMIT $5;`,
    values: [id, `{${id}}`, `%${text}%`, scrollId, limit]
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

const updateName = async (data) => {
  const client = await pool.connect();
  const qid = uuid();

  const saidQuery = {
    text: `UPDATE ${saidTable} SET name=$1 where phone=$2;`,
    values: [data.name, data.id],
  };

  const heardQuery = {
    text: `UPDATE ${heardTable} SET name=$1 where phone=$2;`,
    values: [data.name, data.id],
  };

  try {
    await client.query('BEGIN');
    await client.query(saidQuery);
    await client.query(heardQuery);
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
    return 'ok'
  }
};

const deleteAllQuotes = async (data) => {
  const client = await pool.connect();
  const query = `TRUNCATE TABLE ${saidTable}, ${heardTable};`
  try {
    const result = await client.query(query);
  } catch (e) {
    throw e
  } finally {
    client.release()
  };
};

module.exports = { 
  createQuote,
  findSaidBy,
  findHeardBy, 
  findAll,
  search,
  updateName,
  deleteAllQuotes 
};
