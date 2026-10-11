const { request, app, Listing, ids, reset } = require('./helpers');

beforeEach(reset);

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

  test('GET /listings/:id returns 200 with the document', async () => {
    const doc = { id: ids.MISSING_ID, title: 'Fresh Maize', commodity: 'Maize' };
    Listing.findById.mockResolvedValueOnce(doc);
    const res = await request(app).get(`/listings/${ids.MISSING_ID}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(doc);
  });

  test('GET /listings/:id with an invalid id returns 400', async () => {
    const res = await request(app).get(`/listings/${ids.INVALID_ID}`);
    expect(res.status).toBe(400);
  });

  test('GET /listings/:id for a missing listing returns 404', async () => {
    const res = await request(app).get(`/listings/${ids.MISSING_ID}`);
    expect(res.status).toBe(404);
  });
});
