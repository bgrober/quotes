const { Router } = require('express');
const { validateParams } = require('../middlewares/validateParams');
const { verifyToken } = require('../middlewares/verifyToken');
const { 
  createQuote,
  findSaidBy,
  findHeardBy,
  findAll,
  search
} = require('../db/quotes');

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

// Get User's Heard by and Said by
router.get('/all', verifyToken, async (req, res) => {
  const id = req.body.decoded.id;

  const data = {
    id,
    limit: req.query.limit || 10,
    scrollId: req.query.scrollId || Date.now()
  };

  try {
    const quotes = await findAll(data);
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

// Get User's Heard by and Said by, and filter by text
router.get('/search', verifyToken, async (req, res) => {
  const id = req.body.decoded.id;

  const data = {
    id,
    text: req.query.text || ' ',
    limit: req.query.limit || 10,
    scrollId: req.query.scrollId || Date.now()
  };

  try {
    const quotes = await search(data);
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
