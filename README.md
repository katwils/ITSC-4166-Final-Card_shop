# Cardboard Kingdom API

A REST API for Cardboard Kingdom - an ecommerce platform specializing in trading cards (Pokemon, Magic: The Gathering, and Riftbound).

## Live Demo

- **API Base URL**: [https://cardboard-kingdom-api.onrender.com](https://cardboard-kingdom-api.onrender.com)
- **API Documentation**: [https://cardboard-kingdom-api.onrender.com/api-docs](https://cardboard-kingdom-api.onrender.com/api-docs)

## Project Requirements Checklist

### Technologies Used
- **Node.js** as the runtime environment
- **Express.js** as the web framework
- **PostgreSQL** as the relational database
- **Prisma ORM** for database modeling and data access

### Prisma Schema
- ER diagram converted to Prisma schema
- All relationships and cardinalities implemented
- Primary keys, foreign keys, and essential attributes included

### API Resources & Authentication
- **Authentication Endpoints**:
  - POST `/api/auth/signup` - User registration with bcrypt password hashing
  - POST `/api/auth/login` - JWT-based authentication
- **Main Resource Endpoints** (Full CRUD):
  - Cards: `/api/cards` (Admin only for CUD, Public for R)
  - Categories: `/api/categories` (Admin only for CUD, Public for R)
  - Orders: `/api/orders` (User/Admin access with proper authorization)
- **Authorization**:
  - JWT authentication for protected endpoints
  - Role-based authorization (Admin vs User)
  - Ownership-based authorization for orders

### API Documentation
- OpenAPI/Swagger specification
- Complete endpoint documentation with request/response examples
- Security configuration for JWT authentication
- Swagger UI accessible at `/api-docs`

### Database Seeding
- Automated seeding during Render deployment
- Sample data for all resources
- Test credentials included:
  - **Admin**: `admin@example.com` / `Password123!`
  - **User**: `user@example.com` / `Password123!`

### Deployment
- Deployed to Render with persistent PostgreSQL database
- Environment variables properly configured
- Public API accessible via live URL

### Testing Plan
- Comprehensive testing plan in `TESTING_PLAN.md`
- Step-by-step instructions for all endpoints
- Authentication and authorization test cases
- Error handling verification steps

## Architecture

### Database Schema
```
User (id, email, password, role)
├── 1:N → Order (id, userId, totalPrice, status, createdAt)
├── 1:N → (Ownership-based auth)

Category (id, name)
├── 1:N → Card (id, name, description, image, price, stock, categoryId)

Card belongs to Category
Order belongs to User
```

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and receive JWT

#### Cards (Trading Cards)
- `GET /api/cards` - Get all cards (Public)
- `GET /api/cards/:id` - Get card by ID (Public)
- `POST /api/cards` - Create card (Admin only)
- `PUT /api/cards/:id` - Update card (Admin only)
- `DELETE /api/cards/:id` - Delete card (Admin only)

#### Categories
- `GET /api/categories` - Get all categories (Public)
- `GET /api/categories/:id` - Get category by ID (Public)
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

#### Orders
- `GET /api/orders` - Get orders (User: own orders, Admin: all orders)
- `GET /api/orders/:id` - Get order by ID (Owner or Admin)
- `POST /api/orders` - Create order (Authenticated users)
- `PUT /api/orders/:id` - Update order (Admin only)
- `DELETE /api/orders/:id` - Delete order (Owner or Admin)

## Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/CardStoreDB"
   JWT_SECRET="your_jwt_secret_key_here"
   JWT_EXPIRATION="24h"
   PORT=3000
   NODE_ENV="development"
   ```
4. Set up the database:
   ```bash
   npm run migrate
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run build` - Generate Prisma client
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

## API Documentation

Access the interactive API documentation at `/api-docs` when the server is running.

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Test Credentials
- **Admin User**: `admin@example.com` / `Password123!`
- **Regular User**: `user@example.com` / `Password123!`

## Testing

See `TESTING_PLAN.md` for comprehensive testing instructions covering:
- Authentication flows
- CRUD operations for all resources
- Authorization and access control
- Error handling scenarios
- Step-by-step Swagger UI testing guide

## Deployment

The application is configured for deployment on Render with:
- Web service for the API
- PostgreSQL database
- Automated build and database setup
- Environment variable management

## Project Structure

```
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/              # Route handlers
│   │   ├── authController.js
│   │   ├── cardController.js
│   │   ├── categoryController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── repositories/             # Data access layer
│   │   └── index.js
│   ├── routes/                   # API routes
│   │   ├── authRoutes.js
│   │   ├── cardRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── orderRoutes.js
│   ├── services/                 # Business logic
│   │   └── authService.js
│   └── server.js                 # Express app setup
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Database seeding
├── TESTING_PLAN.md               # Testing documentation
├── render.yaml                   # Render deployment config
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the ISC License.
