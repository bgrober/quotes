const { Router } = require('express');
const { createQuote, findSaidBy, findHeardBy } = require('../db/quotes');
const { validateParams } = require('../middlewares/validateParams');
const { verifyToken } = require('../middlewares/verifyToken');

const router = Router();

// Get User's Quotes
router.get('/said', verifyToken, async (req, res) => {
  const id = req.body.decoded.id;

  const data = {
    id,
    limit: req.query.limit || 10,
    scrollId: req.query.scrollId || Date.now(),
  };

  try {
    const quotes = await findSaidBy(data);
    if (quotes.length === 0) {
      return res.sendStatus(204);
    }
    return res.send({
      quotes,
      scrollId: quotes[quotes.length - 1].ts
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

// Get User's Heard By
router.get('/heard', verifyToken, async (req, res) => {
  const id = req.body.decoded.id;

  const data = {
    id,
    limit: req.query.limit || 10,
    scrollId: req.query.scrollId || Date.now()
  };

  try {
    const quotes = await findHeardBy(data);
    if (quotes.length === 0) {
      return res.sendStatus(204);
    }
    return res.send({
      quotes,
      scrollId: quotes[quotes.length -1].ts
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

// Post Quote
router.post('', validateParams([
  'text',
  'said',
  'heard',
  'ts'
]), verifyToken, async (req, res) => {
  const data = {
    text: req.body.text,
    said: req.body.said,
    heard: req.body.heard,
    ts: req.body.ts,
  };

  try {
    await createQuote(data);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
