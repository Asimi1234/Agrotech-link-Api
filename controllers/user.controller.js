const User = require('../models/user.model');
const asyncHandler = require('../middleware/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user);
});

const createUser = asyncHandler(async (req, res) => {
  const { githubId, username, email, role } = req.body;
  const user = await User.create({ githubId, username, email, role });
  res.status(201).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const { githubId, username, email, role } = req.body;
  const update = { githubId, username, email, role };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(204).send();
});

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
