const mongoose = require('mongoose');

const checkType = (value, type) => {
  switch (type) {
    case 'string':
      return typeof value === 'string' && value.trim().length > 0;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'objectId':
      return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
    default:
      return false;
  }
};

const validate = (spec, { partial = false } = {}) => (req, res, next) => {
  const body = req.body;

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object' });
  }

  const allowed = Object.keys(spec);
  const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    return res.status(400).json({
      message: `Unknown field(s): ${unknown.join(', ')}`
    });
  }

  if (partial && Object.keys(body).length === 0) {
    return res.status(400).json({ message: 'At least one field is required' });
  }

  const errors = [];

  for (const [field, rules] of Object.entries(spec)) {
    const present = Object.prototype.hasOwnProperty.call(body, field);
    const value = body[field];

    if (!present) {
      if (rules.required && !partial) {
        errors.push(`${field} is required`);
      }
      continue;
    }

    if (!checkType(value, rules.type)) {
      errors.push(`${field} must be a valid ${rules.type}`);
      continue;
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }

    if (rules.type === 'number' && typeof rules.min === 'number' && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = validate;
