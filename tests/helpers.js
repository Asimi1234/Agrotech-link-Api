let mockAuthUser = null;

jest.mock('connect-mongo', () => ({
  create: () => new (require('express-session').MemoryStore)()
}));

jest.mock('../config/passport', () => {
  const inject = (req, res, next) => {
    req.user = mockAuthUser || undefined;
    req.isAuthenticated = () => Boolean(mockAuthUser);
    req.login = (user, cb) => cb && cb();
    req.logout = (cb) => cb && cb();
    next();
  };
  return {
    initialize: () => inject,
    session: () => (req, res, next) => next(),
    authenticate: () => (req, res, next) => next(),
    use: () => {},
    serializeUser: () => {},
    deserializeUser: () => {}
  };
});

jest.mock('../models/user.model', () => {
  const model = {
    find: jest.fn(() => ({ sort: () => ({ skip: () => ({ limit: () => Promise.resolve([]) }) }) })),
    findById: jest.fn(() => Promise.resolve(null))
  };
  model.ROLES = ['farmer', 'supplier', 'buyer', 'admin'];
  return model;
});

jest.mock('../models/listing.model', () => {
  const model = {
    find: jest.fn(() => ({ sort: () => ({ skip: () => ({ limit: () => Promise.resolve([]) }) }) })),
    findById: jest.fn(() => Promise.resolve(null))
  };
  model.UNITS = ['kg', 'bag', 'tonne', 'crate', 'litre', 'piece'];
  model.STATUSES = ['available', 'sold'];
  return model;
});

jest.mock('../models/cooperative.model', () => ({
  find: jest.fn(() => ({ sort: () => ({ skip: () => ({ limit: () => Promise.resolve([]) }) }) })),
  findById: jest.fn(() => Promise.resolve(null))
}));

jest.mock('../models/advisory.model', () => {
  const model = {
    find: jest.fn(() => ({ sort: () => ({ skip: () => ({ limit: () => Promise.resolve([]) }) }) })),
    findById: jest.fn(() => Promise.resolve(null))
  };
  model.SEVERITIES = ['info', 'warning', 'critical'];
  return model;
});

const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Listing = require('../models/listing.model');
const Cooperative = require('../models/cooperative.model');
const Advisory = require('../models/advisory.model');

const ids = {
  SELF_ID: '6aca9fbd16cf60f48d192332',
  OTHER_ID: '652f1c2e5a1b2c3d4e5f6a7b',
  MISSING_ID: '652f1c2e5a1b2c3d4e5f6a7c',
  INVALID_ID: '123'
};

const setUser = (user) => {
  mockAuthUser = user;
};

const reset = () => {
  mockAuthUser = null;
  jest.clearAllMocks();
};

module.exports = { request, app, User, Listing, Cooperative, Advisory, ids, setUser, reset };
