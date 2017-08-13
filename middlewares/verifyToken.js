const { verify, sign } = require('jsonwebtoken');
const { secret } = require('../config.js');


const verifyToken = (req, res, next) => {
  const token = req.query.token || req.body.token || req.headers['x-access-token'];
  if (token) {
    verify(token, secret, (err, decoded) => {
      if (err) {
        return res.send({ error: 'Token invalid' });
      }
      req.body.decoded = decoded;
      next();
    });
  } else {
    return res.status(403).send({ error: 'No Token Found' });
  }
};

const signToken = (id) => {
  const token = sign(id, secret);
  return token;
};

module.exports = { verifyToken, signToken };
