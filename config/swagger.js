const swaggerJsdoc = require('swagger-jsdoc');
const { ROLES } = require('../models/user.model');
const { UNITS, STATUSES } = require('../models/listing.model');

const serverUrl =
  process.env.SWAGGER_SERVER_URL ||
  (process.env.RENDER_EXTERNAL_URL
    ? process.env.RENDER_EXTERNAL_URL
    : `http://localhost:${process.env.PORT || 3000}`);

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'AgroLink API',
      version: '1.0.0',
      description: 'Marketplace API connecting agricultural suppliers and buyers.'
    },
    servers: [{ url: serverUrl }],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              readOnly: true,
              description: 'Database-generated identifier',
              example: '652f1c2e5a1b2c3d4e5f6a7b'
            },
            googleId: {
              type: 'string',
              description: 'Google account ID',
              example: '113087632548723904521'
            },
            username: { type: 'string', example: 'jane_farmer' },
            email: { type: 'string', example: 'jane@example.com' },
            role: { type: 'string', enum: ROLES, example: 'farmer' },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true }
          }
        },
        UserInput: {
          type: 'object',
          required: ['googleId', 'username', 'email'],
          properties: {
            googleId: {
              type: 'string',
              description: 'Google account ID',
              example: '113087632548723904521'
            },
            username: { type: 'string', example: 'jane_farmer' },
            email: { type: 'string', example: 'jane@example.com' },
            role: { type: 'string', enum: ROLES, example: 'farmer' }
          }
        },
        Listing: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '652f1c2e5a1b2c3d4e5f6a7c' },
            title: { type: 'string', example: 'Fresh Maize - 2024 Harvest' },
            description: { type: 'string', example: 'Grade A yellow maize, sun dried.' },
            commodity: { type: 'string', example: 'Maize' },
            pricePerUnit: { type: 'number', example: 180.5 },
            unit: { type: 'string', enum: UNITS, example: 'bag' },
            quantityAvailable: { type: 'number', example: 120 },
            location: { type: 'string', example: 'Kaduna, Nigeria' },
            supplierId: { type: 'string', example: '652f1c2e5a1b2c3d4e5f6a7b' },
            status: { type: 'string', enum: STATUSES, default: 'available', example: 'available' },
            createdAt: { type: 'string', format: 'date-time', readOnly: true },
            updatedAt: { type: 'string', format: 'date-time', readOnly: true }
          }
        },
        ListingInput: {
          type: 'object',
          required: [
            'title',
            'description',
            'commodity',
            'pricePerUnit',
            'unit',
            'quantityAvailable',
            'location',
            'supplierId'
          ],
          properties: {
            title: { type: 'string', example: 'Fresh Maize - 2024 Harvest' },
            description: { type: 'string', example: 'Grade A yellow maize, sun dried.' },
            commodity: { type: 'string', example: 'Maize' },
            pricePerUnit: { type: 'number', minimum: 0, example: 180.5 },
            unit: { type: 'string', enum: UNITS, example: 'bag' },
            quantityAvailable: { type: 'number', minimum: 0, example: 120 },
            location: { type: 'string', example: 'Kaduna, Nigeria' },
            supplierId: { type: 'string', example: '652f1c2e5a1b2c3d4e5f6a7b' },
            status: { type: 'string', enum: STATUSES, default: 'available', example: 'available' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: ['email is required']
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);
