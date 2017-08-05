const { Router } = require('express');
const { createUser, getUser } = require('../db/users.js');
const { createQuote, getQuotes, getHeardBy } = require('../db/quotes.js');
const { verifyToken, signToken } = require('../middlewares/verify_token.js');
const { comparePassword } = require('../db/utils.js');

const router = Router();


// GET home page.
router.get('/', (req, res) => {
  res.render('index');
});

// Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

// POST Login
router.post('/login', async (req, res) => {
  const data = {
    id: req.body.phone,
    password: req.body.password,
  };
  try {
    const user = await getUser(data.id);
    const compared = await comparePassword(data.password, user.password);
    if (compared) {
      const token = await signToken({ id: user.id });
      res.redirect(`/profile?token=${token}`);
    } else {
      res.sendStatus(403);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// New User Page
router.get('/create', (req, res) => {
  res.render('create');
});

// Register User
router.post('/register', async (req, res) => {
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
