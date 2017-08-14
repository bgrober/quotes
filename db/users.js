const { Client } = require('pg');

const { hashPassword } = require('../utils/utils.js');

const connectionString = 'postgres://localhost:5432/quotes';
const client = new Client({ connectionString });
client.connect();

const createUser = async (data) => {
  const hashedPassword = await hashPassword(data.password);

  const query = {
    text: 'INSERT INTO users(id, name, password) VALUES($1, $2, $3) RETURNING id',
    values: [data.id, data.name, hashedPassword],
  };
  try {
    const result = await client.query(query);
    return result.rows[0];
  } catch (err) {
    throw err
  }
};

const getUser = async (id) => {
  const query = {
    text: 'SELECT * from users where id = $1',
    values: [id],
  };

  try {
    const user = await client.query(query);
    return user.rows[0];
  } catch (err) {
    throw err
  };
};

const deleteAllUsers = async () => {
  const query = 'TRUNCATE TABLE users'
  await client.query(query);
  return 'ok';
};

module.exports = { createUser, getUser, deleteAllUsers };
