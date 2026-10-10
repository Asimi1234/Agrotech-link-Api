const express = require('express');
const { SEVERITIES } = require('../models/advisory.model');
const validate = require('../middleware/validate');
const validateQuery = require('../middleware/validateQuery');
const validateObjectId = require('../middleware/validateObjectId');
const { requireRole } = require('../middleware/auth');
const {
  getAdvisories,
  getAdvisoryById,
  createAdvisory,
  updateAdvisory,
  deleteAdvisory
} = require('../controllers/advisory.controller');

const router = express.Router();

const advisorySpec = {
  title: { type: 'string', required: true },
  content: { type: 'string', required: true },
  crop: { type: 'string', required: true },
  region: { type: 'string', required: true },
  severity: { type: 'string', enum: SEVERITIES }
};

const listQuerySpec = {
  page: { type: 'integer', default: 1 },
  limit: { type: 'integer', default: 20, max: 100 },
  crop: { type: 'string' },
  region: { type: 'string' },
  severity: { type: 'string', enum: SEVERITIES }
};

/**
 * @openapi
 * tags:
 *   - name: Advisories
 *     description: Agricultural advisories
 */

/**
 * @openapi
 * /advisories:
 *   get:
 *     tags: [Advisories]
 *     summary: Get all advisories
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
 *         name: crop
 *         schema:
 *           type: string
 *         description: Exact-match filter on crop
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Exact-match filter on region
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, warning, critical]
 *         description: Exact-match filter on severity
 *     responses:
 *       200:
 *         description: List of advisories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Advisory'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Advisories]
 *     summary: Create an advisory
 *     description: Admin only. authorId is taken from the session and is not writable.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdvisoryInput'
 *     responses:
 *       201:
 *         description: Created advisory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Advisory'
 *       400:
 *         description: Validation failed or unknown field (e.g. authorId)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not signed in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateQuery(listQuerySpec), getAdvisories);
router.post('/', requireRole('admin'), validate(advisorySpec), createAdvisory);

/**
 * @openapi
 * /advisories/{id}:
 *   get:
 *     tags: [Advisories]
 *     summary: Get an advisory by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Advisory found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Advisory'
 *       400:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Advisory not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags: [Advisories]
 *     summary: Update an advisory
 *     description: Admin only. authorId is not writable.
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
 *             $ref: '#/components/schemas/AdvisoryInput'
 *     responses:
 *       200:
 *         description: Updated advisory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Advisory'
 *       400:
 *         description: Invalid id or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not signed in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Advisory not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Advisories]
 *     summary: Delete an advisory
 *     description: Admin only.
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
 *       401:
 *         description: Not signed in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Advisory not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateObjectId(), getAdvisoryById);
router.put(
  '/:id',
  validateObjectId(),
  requireRole('admin'),
  validate(advisorySpec, { partial: true }),
  updateAdvisory
);
router.delete('/:id', validateObjectId(), requireRole('admin'), deleteAdvisory);

module.exports = router;
