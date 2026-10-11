const { request, app, Cooperative, ids, reset } = require('./helpers');

beforeEach(reset);

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

  test('GET /cooperatives/:id returns 200 with the document', async () => {
    const doc = { id: ids.MISSING_ID, name: 'Benue Grain Growers', location: 'Makurdi' };
    Cooperative.findById.mockResolvedValueOnce(doc);
    const res = await request(app).get(`/cooperatives/${ids.MISSING_ID}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(doc);
  });

  test('GET /cooperatives/:id with an invalid id returns 400', async () => {
    const res = await request(app).get(`/cooperatives/${ids.INVALID_ID}`);
    expect(res.status).toBe(400);
  });

  test('GET /cooperatives/:id for a missing cooperative returns 404', async () => {
    const res = await request(app).get(`/cooperatives/${ids.MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});
