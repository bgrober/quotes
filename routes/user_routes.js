const { Router } = require('express');
const { createUser, getUser } = require('../db/users');
const { verifyToken, signToken } = require('../middlewares/verify_token');
const { validatePhoneNumber } = require('../middlewares/validate_phone');
const { validateParams } = require('../middlewares/validateParams');
const { comparePassword } = require('../utils/utils');

const router = Router();

// Register User
router.post('/register', validateParams([ 
  'id',
  'name',
  'password'
]), validatePhoneNumber, async (req, res) => {
  const data = {
    id: req.body.id,
    name: req.body.name,
    password: req.body.password,
  };

  try {
    const id = await createUser(data);
    const token = await signToken(id);
    res.send({ token });
  } catch (err) {
    console.log(err);
    res.status(403).send({ error: 'User already exists' });
  }
});

// POST Login
// POST endpoint for users to login.
// This will validate the phone number, validate the password and then 
// respond with the user information and a session token.
router.post('/login', validateParams(['id', 'password']), validatePhoneNumber, async (req, res) => {
  const id = req.body.id;
  const password = req.body.password;

  const user = await getUser(id);
  if (user) {
    const compared = await comparePassword(password, user.password);
    if (compared) {
    const token = await signToken({ id: user.id });
      res.send({ token });
    } else {
      res.sendStatus(401);
    };
  } else {
    res.sendStatus(401);
  };
});

// Login User
router.get('/user/profile', verifyToken, async (req, res) => {
  const id = req.body.decoded.id;

  try {
    const user = await getUser(id);
    res.render('profile', {
      user,
      token: req.query.token,
      said_by_link: `/said_by?token=${req.query.token}`,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
