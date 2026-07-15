const catchAsync = require('../utils/catchAsync');

const validate = (schema) => {
  return catchAsync(async (req, res, next) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
};

module.exports = validate;
