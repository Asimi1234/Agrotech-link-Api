const Cooperative = require('../models/cooperative.model');
const User = require('../models/user.model');
const asyncHandler = require('../middleware/asyncHandler');

const COOPERATIVE_FIELDS = ['name', 'description', 'location', 'primaryCommodity', 'memberIds'];

const pickFields = (body) => {
  const data = {};
  for (const field of COOPERATIVE_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
};

const membersExist = async (ids) => {
  if (ids.length === 0) {
    return true;
  }
  const count = await User.countDocuments({ _id: { $in: ids } });
  return count === ids.length;
};

const getCooperatives = asyncHandler(async (req, res) => {
  const { page, limit } = req.parsedQuery;
  const cooperatives = await Cooperative.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.status(200).json(cooperatives);
});

const getCooperativeById = asyncHandler(async (req, res) => {
  const cooperative = await Cooperative.findById(req.params.id);
  if (!cooperative) {
    return res.status(404).json({ message: 'Cooperative not found' });
  }
  res.status(200).json(cooperative);
});

const createCooperative = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);
  data.leadId = req.user.id;

  const members = [...new Set([...(data.memberIds || []), req.user.id])];
  if (!(await membersExist(members))) {
    return res.status(400).json({ message: 'memberIds must all reference existing users' });
  }
  data.memberIds = members;

  const cooperative = await Cooperative.create(data);
  res.status(201).json(cooperative);
});

const updateCooperative = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);

  if (data.memberIds !== undefined) {
    const members = [...new Set(data.memberIds)];
    if (!(await membersExist(members))) {
      return res.status(400).json({ message: 'memberIds must all reference existing users' });
    }
    data.memberIds = members;
  }

  const cooperative = await Cooperative.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true
  });

  if (!cooperative) {
    return res.status(404).json({ message: 'Cooperative not found' });
  }
  res.status(200).json(cooperative);
});

const deleteCooperative = asyncHandler(async (req, res) => {
  const cooperative = await Cooperative.findByIdAndDelete(req.params.id);
  if (!cooperative) {
    return res.status(404).json({ message: 'Cooperative not found' });
  }
  res.status(204).send();
});

module.exports = {
  getCooperatives,
  getCooperativeById,
  createCooperative,
  updateCooperative,
  deleteCooperative
};
