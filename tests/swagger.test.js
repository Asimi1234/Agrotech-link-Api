const { request, app, reset } = require('./helpers');

beforeEach(reset);

describe('GET /swagger.json', () => {
  test('returns 200 with an OpenAPI document', async () => {
    const res = await request(app).get('/swagger.json');
    expect(res.status).toBe(200);
    expect(typeof res.body.openapi).toBe('string');
    expect(typeof res.body.paths).toBe('object');
    expect(res.body.paths).not.toBeNull();
  });
});
