const express = require('express');
const { UNITS, STATUSES } = require('../models/listing.model');
const validate = require('../middleware/validate');
const validateQuery = require('../middleware/validateQuery');
const validateObjectId = require('../middleware/validateObjectId');
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} = require('../controllers/listing.controller');

const router = express.Router();

const listingSpec = {
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  commodity: { type: 'string', required: true },
  pricePerUnit: { type: 'number', required: true, min: 0 },
  unit: { type: 'string', required: true, enum: UNITS },
  quantityAvailable: { type: 'number', required: true, min: 0 },
  location: { type: 'string', required: true },
  supplierId: { type: 'objectId', required: true },
  status: { type: 'string', enum: STATUSES }
};

const listQuerySpec = {
  page: { type: 'integer', default: 1 },
  limit: { type: 'integer', default: 20, max: 100 },
  commodity: { type: 'string' },
  location: { type: 'string' },
  status: { type: 'string', enum: STATUSES }
};

/**
 * @openapi
 * tags:
 *   - name: Listings
 *     description: Commodity listings
 */

/**
 * @openapi
 * /listings:
 *   get:
 *     tags: [Listings]
 *     summary: Get all listings
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page (default 20, max 100)
 *       - in: query
 *         name: commodity
 *         schema:
 *           type: string
 *         description: Exact-match filter on commodity
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Exact-match filter on location
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, sold]
 *         description: Exact-match filter on status
 *     responses:
 *       200:
 *         description: List of listings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Listings]
 *     summary: Create a listing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListingInput'
 *     responses:
 *       201:
 *         description: Created listing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Validation failed or supplierId does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateQuery(listQuerySpec), getListings);
router.post('/', validate(listingSpec), createListing);

/**
 * @openapi
 * /listings/{id}:
 *   get:
 *     tags: [Listings]
 *     summary: Get a listing by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Listing found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags: [Listings]
 *     summary: Update a listing
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListingInput'
 *     responses:
 *       200:
 *         description: Updated listing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Invalid id, validation failed, or supplierId does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Listings]
 *     summary: Delete a listing
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       400:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateObjectId(), getListingById);
router.put('/:id', validateObjectId(), validate(listingSpec, { partial: true }), updateListing);
router.delete('/:id', validateObjectId(), deleteListing);

module.exports = router;
