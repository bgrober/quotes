const { verify, sign } = require('jsonwebtoken');
const { secret } = require('../config.js');


const verifyToken = (req, res, next) => {
  console.log("verifying");
  const token = req.query.token || req.body.token;
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
  const token = sign(id, secret, { expiresIn: '1h' });
  return token;
};

module.exports = { verifyToken, signToken };
