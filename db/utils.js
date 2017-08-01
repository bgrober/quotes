const { hash, compare } = require('bcryptjs');

const salt = 10;

const hashPassword = async (password) => {
  const hashed = await hash(password, salt);
  return hashed;
};

const comparePassword = async (password, hashed) => {
  const decoded = await compare(password, hashed);
  return decoded;
};

module.exports = { hashPassword, comparePassword };
