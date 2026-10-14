const Listing = require('../models/listing.model');

const LISTING_FIELDS = [
  'title',
  'description',
  'commodity',
  'pricePerUnit',
  'unit',
  'quantityAvailable',
  'location',
  'status'
];

const pickFields = (body) => {
  const data = {};
  for (const field of LISTING_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
};

const getListings = async (req, res, next) => {
  try {
    const { page, limit, commodity, location, status } = req.parsedQuery;

    const filter = {};
    if (commodity !== undefined) filter.commodity = commodity;
    if (location !== undefined) filter.location = location;
    if (status !== undefined) filter.status = status;

    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json(listings);
  } catch (err) {
    next(err);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
};

const createListing = async (req, res, next) => {
  try {
    const data = pickFields(req.body);
    data.supplierId = req.user.id;

    const listing = await Listing.create(data);
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const data = pickFields(req.body);

    const listing = await Listing.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
};
