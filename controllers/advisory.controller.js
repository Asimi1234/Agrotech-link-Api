const Advisory = require('../models/advisory.model');

const ADVISORY_FIELDS = ['title', 'content', 'crop', 'region', 'severity'];

const pickFields = (body) => {
  const data = {};
  for (const field of ADVISORY_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
};

const getAdvisories = async (req, res, next) => {
  try {
    const { page, limit, crop, region, severity } = req.parsedQuery;

    const filter = {};
    if (crop !== undefined) filter.crop = crop;
    if (region !== undefined) filter.region = region;
    if (severity !== undefined) filter.severity = severity;

    const advisories = await Advisory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json(advisories);
  } catch (err) {
    next(err);
  }
};

const getAdvisoryById = async (req, res, next) => {
  try {
    const advisory = await Advisory.findById(req.params.id);
    if (!advisory) {
      return res.status(404).json({ message: 'Advisory not found' });
    }
    res.status(200).json(advisory);
  } catch (err) {
    next(err);
  }
};

const createAdvisory = async (req, res, next) => {
  try {
    const data = pickFields(req.body);
    data.authorId = req.user.id;

    const advisory = await Advisory.create(data);
    res.status(201).json(advisory);
  } catch (err) {
    next(err);
  }
};

const updateAdvisory = async (req, res, next) => {
  try {
    const data = pickFields(req.body);

    const advisory = await Advisory.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    if (!advisory) {
      return res.status(404).json({ message: 'Advisory not found' });
    }
    res.status(200).json(advisory);
  } catch (err) {
    next(err);
  }
};

const deleteAdvisory = async (req, res, next) => {
  try {
    const advisory = await Advisory.findByIdAndDelete(req.params.id);
    if (!advisory) {
      return res.status(404).json({ message: 'Advisory not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdvisories,
  getAdvisoryById,
  createAdvisory,
  updateAdvisory,
  deleteAdvisory
};
