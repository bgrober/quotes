const { Router } = require('express');
const { createUser, getUser } = require('../db/users');
const { updateName } = require('../db/quotes');
const { verifyToken, signToken } = require('../middlewares/verifyToken');
const { validatePhoneNumber } = require('../middlewares/validatePhone');
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
    await updateName(data);
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
    res.sendStatus(404);
  };
});

// GET User
// If a user is not found 404.
// Currently this just returns the name since no other user data is stored.
// Any other user data the client requires would return here
router.get('/profile', verifyToken, async (req, res) => {
  const id = req.body.decoded.id;

  try {
    const user = await getUser(id);
    const { name } = user;
    console.log(name);
    res.send({ name });
  } catch (err) {
    console.log(err);
    res.sendStatus(404);
  }
});

module.exports = router;
