const express = require('express');
const validate = require('../middleware/validate');
const validateQuery = require('../middleware/validateQuery');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth, requireCooperativeLead } = require('../middleware/auth');
const {
  getCooperatives,
  getCooperativeById,
  createCooperative,
  updateCooperative,
  deleteCooperative
} = require('../controllers/cooperative.controller');

const router = express.Router();

const cooperativeSpec = {
  name: { type: 'string', required: true },
  description: { type: 'string' },
  location: { type: 'string', required: true },
  primaryCommodity: { type: 'string' },
  memberIds: { type: 'objectIdArray' }
};

const listQuerySpec = {
  page: { type: 'integer', default: 1 },
  limit: { type: 'integer', default: 20, max: 100 }
};

/**
 * @openapi
 * tags:
 *   - name: Cooperatives
 *     description: Farmer cooperatives
 */

/**
 * @openapi
 * /cooperatives:
 *   get:
 *     tags: [Cooperatives]
 *     summary: Get all cooperatives
 *     description: Public.
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
 *     responses:
 *       200:
 *         description: List of cooperatives
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cooperative'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Invalid query parameters
 *               errors:
 *                 - page must be a positive integer
 *   post:
 *     tags: [Cooperatives]
 *     summary: Create a cooperative
 *     description: Any signed-in user. The creator becomes the lead and is added to memberIds. leadId is not writable.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CooperativeInput'
 *     responses:
 *       201:
 *         description: Created cooperative
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cooperative'
 *       400:
 *         description: Validation failed, unknown field (e.g. leadId), or memberIds reference missing users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: 'Unknown field(s): leadId'
 *       401:
 *         description: Not signed in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Authentication required
 *       409:
 *         description: Duplicate cooperative name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: name already exists
 */
router.get('/', validateQuery(listQuerySpec), getCooperatives);
router.post('/', requireAuth, validate(cooperativeSpec), createCooperative);

/**
 * @openapi
 * /cooperatives/{id}:
 *   get:
 *     tags: [Cooperatives]
 *     summary: Get a cooperative by id
 *     description: Public.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cooperative found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cooperative'
 *       400:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Invalid id
 *       404:
 *         description: Cooperative not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Cooperative not found
 *   put:
 *     tags: [Cooperatives]
 *     summary: Update a cooperative
 *     description: The lead or an admin. leadId is not writable.
 *     security:
 *       - cookieAuth: []
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
 *             $ref: '#/components/schemas/CooperativeUpdateInput'
 *     responses:
 *       200:
 *         description: Updated cooperative
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cooperative'
 *       400:
 *         description: Invalid id, validation failed, unknown field (e.g. leadId), or memberIds reference missing users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: memberIds must all reference existing users
 *       401:
 *         description: Not signed in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Authentication required
 *       403:
 *         description: Not the lead
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Insufficient permissions
 *       404:
 *         description: Cooperative not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Cooperative not found
 *       409:
 *         description: Duplicate cooperative name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: name already exists
 *   delete:
 *     tags: [Cooperatives]
 *     summary: Delete a cooperative
 *     description: The lead or an admin.
 *     security:
 *       - cookieAuth: []
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
 *             example:
 *               message: Invalid id
 *       401:
 *         description: Not signed in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Authentication required
 *       403:
 *         description: Not the lead
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Insufficient permissions
 *       404:
 *         description: Cooperative not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Cooperative not found
 */
router.get('/:id', validateObjectId(), getCooperativeById);
router.put(
  '/:id',
  validateObjectId(),
  requireCooperativeLead,
  validate(cooperativeSpec, { partial: true }),
  updateCooperative
);
router.delete('/:id', validateObjectId(), requireCooperativeLead, deleteCooperative);

module.exports = router;
