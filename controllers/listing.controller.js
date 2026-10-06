const Listing = require('../models/listing.model');
const User = require('../models/user.model');
const asyncHandler = require('../middleware/asyncHandler');

const LISTING_FIELDS = [
  'title',
  'description',
  'commodity',
  'pricePerUnit',
  'unit',
  'quantityAvailable',
  'location',
  'supplierId',
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

const getListings = asyncHandler(async (req, res) => {
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
});

const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }
  res.status(200).json(listing);
});

const createListing = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);

  const supplier = await User.exists({ _id: data.supplierId });
  if (!supplier) {
    return res.status(400).json({ message: 'supplierId does not reference an existing user' });
  }

  const listing = await Listing.create(data);
  res.status(201).json(listing);
});

const updateListing = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);

  if (data.supplierId) {
    const supplier = await User.exists({ _id: data.supplierId });
    if (!supplier) {
      return res.status(400).json({ message: 'supplierId does not reference an existing user' });
    }
  }

  const listing = await Listing.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true
  });

  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }
  res.status(200).json(listing);
});

const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }
  res.status(204).send();
});

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
};
