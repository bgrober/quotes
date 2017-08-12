const validateParams = (params) => {
  return (req, res, next) => {
    let key;
    let missing;
    params.every((param) => {
      if (!req.body[param] && !req.query[param]) {
        missing = true;
        key = param;
        return false;
      } else {
        return true;
      }
    });
    missing ? res.status(400).send({ error: `Bad param ${key}` }) : next()
  };
};

module.exports = { validateParams };
