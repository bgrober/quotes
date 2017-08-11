const { Router } = require('express');
const { createUser, getUser } = require('../db/users.js');
const { createQuote, getQuotes, getHeardBy } = require('../db/quotes.js');
const { verifyToken, signToken } = require('../middlewares/verify_token.js');
const { validatePhoneNumber } = require('../middlewares/validate_phone.js');
const { comparePassword } = require('../utils/utils.js');

const router = Router();


// GET status check.
router.get('/', (req, res) => {
  res.send('ok');
});

// POST Login
// POST endpoint for users to login.
// This will validate the phone number, validate the password and then 
// respond with the user information and a session token.
router.post('/login', validatePhoneNumber, async (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  const user = await getUser(id);
  const compared = await comparePassword(password, user.password);
  if (compared) {
  const token = await signToken({ id: user.id });
    res.send({ 
      token, 
      user: {
        id: id
      }
    });
  } else {
    res.sendStatus(403);
  };
});

// New User Page
router.get('/create', (req, res) => {
  res.render('create');
});

// Register User
router.post('/register', validatePhoneNumber, async (req, res) => {
  const data = {
    id: req.body.phone,
    name: req.body.name,
    password: req.body.password,
  };

  try {
    const id = await createUser(data);
    const token = await signToken(id);
    res.redirect(`/profile?token=${token}`);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// Login User
router.get('/profile', verifyToken, async (req, res) => {
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

// Get User's Quotes
router.get('/said_by', verifyToken, async (req, res) => {
  const id = req.body.decoded.id;

  try {
    const quotes = await getQuotes(id);
    res.render('said_by', {
      quotes,
      token: req.query.token,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// Get User's Heard By
router.get('/heard_by', verifyToken, async (req, res) => {
  const id = req.body.decoded.id;

  try {
    const quotes = await getHeardBy(id);
    res.render('said_by', {
      quotes,
      token: req.query.token,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// Post Quote
router.post('/speak', verifyToken, async (req, res) => {
  const data = {
    text: req.body.text,
    said_by: req.body.decoded.id,
    heard_by: req.body.heard,
  };

  try {
    createQuote(data);
    res.redirect(`/profile?token=${req.body.token}`);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});


module.exports = router;
