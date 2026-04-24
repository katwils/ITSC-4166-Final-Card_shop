import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { connectToDatabase } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cardboard Kingdom API',
      version: '1.0.0',
      description: 'REST API for Cardboard Kingdom - Trading Card Ecommerce Platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve static files from public directory
app.use(express.static('public'));

// Serve static files from images directory
app.use('/images', express.static('images'));

// Health check route (important for Render + debugging)
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    message: 'Cardboard Kingdom API is running',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login'
      },
      cards: {
        getAll: 'GET /api/cards',
        create: 'POST /api/cards (admin only)',
        getById: 'GET /api/cards/:id',
        update: 'PUT /api/cards/:id (admin only)',
        delete: 'DELETE /api/cards/:id (admin only)'
      },
      categories: {
        getAll: 'GET /api/categories',
        create: 'POST /api/categories (admin only)',
        getById: 'GET /api/categories/:id',
        update: 'PUT /api/categories/:id (admin only)',
        delete: 'DELETE /api/categories/:id (admin only)'
      },
      orders: {
        create: 'POST /api/orders',
        getAll: 'GET /api/orders',
        getById: 'GET /api/orders/:id',
        update: 'PUT /api/orders/:id (admin only)'
      }
    },
    docs: 'Use tools like Postman or curl to test the API endpoints',
    frontend: 'Visit / to use the web interface'
  });
});

/*
  TODO: Add routes here later
  Example:
  import cardRoutes from './routes/cards.js';
  app.use('/api/cards', cardRoutes);
*/

import authRoutes from './routes/authRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

async function startServer() {
  try {
    // Connect to database first
    await connectToDatabase();

    // Start server only after DB is ready
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

startServer();