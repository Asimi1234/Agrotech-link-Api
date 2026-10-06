const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const userRoutes = require('./routes/user.routes');
const listingRoutes = require('./routes/listing.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'AgroLink API', docs: '/api-docs' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/users', userRoutes);
app.use('/listings', listingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
