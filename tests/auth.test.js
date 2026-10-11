const { request, app, ids, setUser, reset } = require('./helpers');

beforeEach(reset);

describe('GET /auth/me', () => {
  test('returns 401 without a session', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns 200 with a session', async () => {
    setUser({ id: ids.SELF_ID, role: 'buyer' });
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(200);
  });
});
