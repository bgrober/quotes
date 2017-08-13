const { Router } = require('express');

const router = Router();

// GET status check.
// Helpful for status checks and being aware when the api is up and running.
router.get('/', (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
