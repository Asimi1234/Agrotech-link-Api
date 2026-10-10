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

const SELF_ID = '6aca9fbd16cf60f48d192332';
const OTHER_ID = '652f1c2e5a1b2c3d4e5f6a7b';
const MISSING_ID = '652f1c2e5a1b2c3d4e5f6a7c';
const INVALID_ID = '123';

const asUser = (user) => {
  mockAuthUser = user;
};

beforeEach(() => {
  mockAuthUser = null;
  jest.clearAllMocks();
});

describe('users', () => {
  test('GET /users without a session returns 401', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(401);
  });

  test('GET /users as a non-admin returns 403', async () => {
    asUser({ id: SELF_ID, role: 'buyer' });
    const res = await request(app).get('/users');
    expect(res.status).toBe(403);
  });

  test('GET /users as an admin returns 200 with an array', async () => {
    asUser({ id: SELF_ID, role: 'admin' });
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /users/:id reading yourself returns 200', async () => {
    asUser({ id: SELF_ID, role: 'buyer' });
    User.findById.mockResolvedValueOnce({ id: SELF_ID, username: 'self' });
    const res = await request(app).get(`/users/${SELF_ID}`);
    expect(res.status).toBe(200);
  });

  test('GET /users/:id reading someone else returns 403', async () => {
    asUser({ id: SELF_ID, role: 'buyer' });
    const res = await request(app).get(`/users/${OTHER_ID}`);
    expect(res.status).toBe(403);
  });

  test('GET /users/:id with an invalid id returns 400', async () => {
    asUser({ id: SELF_ID, role: 'admin' });
    const res = await request(app).get(`/users/${INVALID_ID}`);
    expect(res.status).toBe(400);
  });

  test('GET /users/:id for a missing user returns 404', async () => {
    asUser({ id: SELF_ID, role: 'admin' });
    User.findById.mockResolvedValueOnce(null);
    const res = await request(app).get(`/users/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('listings', () => {
  test('GET /listings returns 200 with an array', async () => {
    const res = await request(app).get('/listings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /listings?limit=0 returns 400', async () => {
    const res = await request(app).get('/listings?limit=0');
    expect(res.status).toBe(400);
  });

  test('GET /listings with a valid status filter returns 200', async () => {
    const res = await request(app).get('/listings?status=available');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /listings with commodity[$ne] injection returns 400', async () => {
    const res = await request(app).get('/listings?commodity[$ne]=x');
    expect(res.status).toBe(400);
  });

  test('GET /listings/:id with an invalid id returns 400', async () => {
    const res = await request(app).get(`/listings/${INVALID_ID}`);
    expect(res.status).toBe(400);
  });

  test('GET /listings/:id for a missing listing returns 404', async () => {
    const res = await request(app).get(`/listings/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('cooperatives', () => {
  test('GET /cooperatives returns 200 with an array', async () => {
    const res = await request(app).get('/cooperatives');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /cooperatives?limit=0 returns 400', async () => {
    const res = await request(app).get('/cooperatives?limit=0');
    expect(res.status).toBe(400);
  });

  test('GET /cooperatives with page[$ne] injection returns 400', async () => {
    const res = await request(app).get('/cooperatives?page[$ne]=x');
    expect(res.status).toBe(400);
  });

  test('GET /cooperatives/:id with an invalid id returns 400', async () => {
    const res = await request(app).get(`/cooperatives/${INVALID_ID}`);
    expect(res.status).toBe(400);
  });

  test('GET /cooperatives/:id for a missing cooperative returns 404', async () => {
    const res = await request(app).get(`/cooperatives/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('advisories', () => {
  test('GET /advisories returns 200 with an array', async () => {
    const res = await request(app).get('/advisories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /advisories?limit=0 returns 400', async () => {
    const res = await request(app).get('/advisories?limit=0');
    expect(res.status).toBe(400);
  });

  test('GET /advisories with a valid severity filter returns 200', async () => {
    const res = await request(app).get('/advisories?severity=warning');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /advisories with crop[$ne] injection returns 400', async () => {
    const res = await request(app).get('/advisories?crop[$ne]=x');
    expect(res.status).toBe(400);
  });

  test('GET /advisories/:id with an invalid id returns 400', async () => {
    const res = await request(app).get(`/advisories/${INVALID_ID}`);
    expect(res.status).toBe(400);
  });

  test('GET /advisories/:id for a missing advisory returns 404', async () => {
    const res = await request(app).get(`/advisories/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /auth/me', () => {
  test('returns 401 without a session', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns 200 with a session', async () => {
    asUser({ id: SELF_ID, role: 'buyer' });
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(200);
  });
});
