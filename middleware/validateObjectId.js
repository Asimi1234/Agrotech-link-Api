const mongoose = require('mongoose');

const validateObjectId = (param = 'id') => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
    return res.status(400).json({ message: `Invalid ${param}` });
  }
  next();
};

module.exports = validateObjectId;
