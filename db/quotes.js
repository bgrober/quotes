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

const search = async (data) => {
  const { id, text, limit, scrollId } = data;
  const client = await pool.connect();

  const query = {
    text: `SELECT text, name, heard_by, ts FROM ${TABLE} where (heard_by @> $1 OR phone=$2) AND text ILIKE $3 AND ts < $4 ORDER BY ts DESC LIMIT $5`,
    values: [JSON.stringify([{phone: id}]), id, `%${text}%`, scrollId, limit]
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
  try {
    const result = await client.query(query);
    console.log(result);
  } catch (e) {
    throw e
  } finally {
    client.release()
  };
};

//Update quotes SET name='Jon Snow' where phone='234-134-2434';
//
// SELECT
//     jsonb_set(
//         '[{"phone": "234-13-2434"}]'::jsonb,
//         '{name}',
//         '"Jon Snow"'::jsonb,
//         false);

/*
 *
 * create table said(key int, name varchar, phone int);
 *
 * create table heard(key int, name varchar, phone int);
 *
 *insert into said(key, name, phone) VALUES (1, 'jon', 123);
INSERT 0 1
quotes=# insert into heard(key, name, phone) VALUES (1, 'arya', 223);
INSERT 0 1
quotes=# insert into heard(key, name, phone) VALUES (1, 'rob', 323);
INSERT 0 1
quotes=# select * from heard;
 key | name | phone
-----+------+-------
   1 | arya |   223
   1 | rob  |   323
(2 rows)

quotes=# insert into heard(key, name, phone) VALUES (2, 'jon', 123);
INSERT 0 1
quotes=# insert into said(key, name, phone) VALUES (2, 'arya', 223);
 *
 *
 *
 *
 *
 *
 *
 *
 * select * from (select said.key, said.name as said, said.phone as saidphone, heard.name as heard, heard.phone as heardphone from said JOIN heard ON said.key=heard.key) t;
 */
module.exports = { 
  createQuote,
  findSaidBy,
  findHeardBy, 
  findAll,
  search,
  deleteAllQuotes 
};
