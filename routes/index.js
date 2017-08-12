const { Router } = require('express');
const { createUser, getUser } = require('../db/users');
const { createQuote, getQuotes, getHeardBy } = require('../db/quotes');
const { verifyToken, signToken } = require('../middlewares/verify_token');
const { validatePhoneNumber } = require('../middlewares/validate_phone');
const { comparePassword } = require('../utils/utils');

const router = Router();


// GET status check.
router.get('/', (req, res) => {
  res.sendStatus(200);
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
