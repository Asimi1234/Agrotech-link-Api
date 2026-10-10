const Listing = require('../models/listing.model');

const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

const requireSelfOrAdmin = (param = 'id') => (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (req.user.role === 'admin' || req.user.id === req.params[param]) {
    return next();
  }
  return res.status(403).json({ message: 'Insufficient permissions' });
};

const requireListingOwner = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    if (req.user.role !== 'admin' && listing.supplierId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    req.listing = listing;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAuth, requireRole, requireSelfOrAdmin, requireListingOwner };
