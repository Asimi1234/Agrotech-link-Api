const validateQuery = (spec) => (req, res, next) => {
  const parsed = {};
  const errors = [];

  for (const [key, rules] of Object.entries(spec)) {
    const raw = req.query[key];

    if (raw === undefined || raw === '') {
      if ('default' in rules) {
        parsed[key] = rules.default;
      }
      continue;
    }

    if (typeof raw !== 'string') {
      errors.push(`${key} must be a single string value`);
      continue;
    }

    if (rules.type === 'integer') {
      if (!/^\d+$/.test(raw)) {
        errors.push(`${key} must be a positive integer`);
        continue;
      }
      const value = Number(raw);
      if (value < 1) {
        errors.push(`${key} must be at least 1`);
        continue;
      }
      if (typeof rules.max === 'number' && value > rules.max) {
        errors.push(`${key} must not exceed ${rules.max}`);
        continue;
      }
      parsed[key] = value;
      continue;
    }

    if (rules.enum && !rules.enum.includes(raw)) {
      errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
      continue;
    }
    parsed[key] = raw;
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid query parameters', errors });
  }

  req.parsedQuery = parsed;
  next();
};

module.exports = validateQuery;
