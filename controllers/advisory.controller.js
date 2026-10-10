const Advisory = require('../models/advisory.model');
const asyncHandler = require('../middleware/asyncHandler');

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

const getAdvisories = asyncHandler(async (req, res) => {
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
});

const getAdvisoryById = asyncHandler(async (req, res) => {
  const advisory = await Advisory.findById(req.params.id);
  if (!advisory) {
    return res.status(404).json({ message: 'Advisory not found' });
  }
  res.status(200).json(advisory);
});

const createAdvisory = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);
  data.authorId = req.user.id;

  const advisory = await Advisory.create(data);
  res.status(201).json(advisory);
});

const updateAdvisory = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);

  const advisory = await Advisory.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true
  });

  if (!advisory) {
    return res.status(404).json({ message: 'Advisory not found' });
  }
  res.status(200).json(advisory);
});

const deleteAdvisory = asyncHandler(async (req, res) => {
  const advisory = await Advisory.findByIdAndDelete(req.params.id);
  if (!advisory) {
    return res.status(404).json({ message: 'Advisory not found' });
  }
  res.status(204).send();
});

module.exports = {
  getAdvisories,
  getAdvisoryById,
  createAdvisory,
  updateAdvisory,
  deleteAdvisory
};
