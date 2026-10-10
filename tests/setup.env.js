process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/agrolink-test-never-connected';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/auth/google/callback';
