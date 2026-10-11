const { request, app, Advisory, ids, reset } = require('./helpers');

beforeEach(reset);

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

  test('GET /advisories/:id returns 200 with the document', async () => {
    const doc = { id: ids.MISSING_ID, title: 'Fall armyworm', crop: 'Maize', region: 'Benue', severity: 'warning' };
    Advisory.findById.mockResolvedValueOnce(doc);
    const res = await request(app).get(`/advisories/${ids.MISSING_ID}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(doc);
  });

  test('GET /advisories/:id with an invalid id returns 400', async () => {
    const res = await request(app).get(`/advisories/${ids.INVALID_ID}`);
    expect(res.status).toBe(400);
  });

  test('GET /advisories/:id for a missing advisory returns 404', async () => {
    const res = await request(app).get(`/advisories/${ids.MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});
