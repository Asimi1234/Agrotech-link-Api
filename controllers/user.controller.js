const User = require('../models/user.model');
const asyncHandler = require('../middleware/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.parsedQuery;
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
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
  const { googleId, username, email, role } = req.body;
  const user = await User.create({ googleId, username, email, role });
  res.status(201).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const { username, role } = req.body;

  if (role === 'admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only an admin may assign the admin role' });
  }

  const update = {};
  if (username !== undefined) update.username = username;
  if (role !== undefined) update.role = role;

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
