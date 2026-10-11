const { request, app, User, ids, setUser, reset } = require('./helpers');

beforeEach(reset);

describe('users', () => {
  test('GET /users without a session returns 401', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(401);
  });

  test('GET /users as a non-admin returns 403', async () => {
    setUser({ id: ids.SELF_ID, role: 'buyer' });
    const res = await request(app).get('/users');
    expect(res.status).toBe(403);
  });

  test('GET /users as an admin returns 200 with an array', async () => {
    setUser({ id: ids.SELF_ID, role: 'admin' });
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /users/:id reading yourself returns 200', async () => {
    setUser({ id: ids.SELF_ID, role: 'buyer' });
    User.findById.mockResolvedValueOnce({ id: ids.SELF_ID, username: 'self' });
    const res = await request(app).get(`/users/${ids.SELF_ID}`);
    expect(res.status).toBe(200);
  });

  test('GET /users/:id reading someone else returns 403', async () => {
    setUser({ id: ids.SELF_ID, role: 'buyer' });
    const res = await request(app).get(`/users/${ids.OTHER_ID}`);
    expect(res.status).toBe(403);
  });

  test('GET /users/:id with an invalid id returns 400', async () => {
    setUser({ id: ids.SELF_ID, role: 'admin' });
    const res = await request(app).get(`/users/${ids.INVALID_ID}`);
    expect(res.status).toBe(400);
  });

  test('GET /users/:id for a missing user returns 404', async () => {
    setUser({ id: ids.SELF_ID, role: 'admin' });
    User.findById.mockResolvedValueOnce(null);
    const res = await request(app).get(`/users/${ids.MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});
