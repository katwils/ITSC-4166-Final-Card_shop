# Cardboard Kingdom API Testing Plan

## Overview
This testing plan provides step-by-step instructions for testing all API endpoints using Swagger UI. The API includes authentication, authorization, and CRUD operations for cards, categories, and orders.

## Base URL
- Development: `http://localhost:3000`
- Production: [Deployed URL on Render]

## Authentication Setup
All protected endpoints require JWT authentication. To test protected endpoints:

1. Navigate to `/api-docs` in your browser
2. Click the "Authorize" button at the top
3. Enter JWT token in the format: `Bearer <token>`
4. Click "Authorize"

### Test Credentials
- **Admin User**: `admin@example.com` / `Password123!`
- **Regular User**: `user@example.com` / `Password123!`

---

## 1. Authentication Endpoints

### POST /api/auth/signup
**Access Control**: Public

#### Success Case (201 Created)
1. Click "Try it out"
2. Enter request body:
```json
{
  "email": "newuser@example.com",
  "password": "Password123!"
}
```
3. Click "Execute"
4. **Expected**: 201 status with user data and JWT token

#### Error Cases
- **400 Bad Request**: Missing email or password fields
- **409 Conflict**: Use existing email (user@example.com)

### POST /api/auth/login
**Access Control**: Public

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter request body:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
3. Click "Execute"
4. **Expected**: 200 status with JWT token
5. **Copy the token** for use in subsequent authenticated requests

#### Error Cases
- **400 Bad Request**: Missing email or password
- **401 Unauthorized**: Invalid email or password

---

## 2. Card Endpoints

### GET /api/cards
**Access Control**: Public

#### Success Case (200 OK)
1. Click "Try it out"
2. Click "Execute"
3. **Expected**: 200 status with array of all cards

### POST /api/cards
**Access Control**: Admin only

#### Setup
1. Login as admin (admin@example.com / Password123!)
2. Authorize with JWT token

#### Success Case (201 Created)
1. Click "Try it out"
2. Enter request body:
```json
{
  "name": "Test Card",
  "description": "A test trading card",
  "price": 9.99,
  "stock": 10,
  "categoryId": 1
}
```
3. Click "Execute"
4. **Expected**: 201 status with created card data

#### Error Cases
- **400 Bad Request**: Missing required fields (name, price, stock, categoryId)
- **401 Unauthorized**: No JWT token provided
- **403 Forbidden**: Login as regular user instead of admin

### GET /api/cards/{id}
**Access Control**: Public

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = 1`
3. Click "Execute"
4. **Expected**: 200 status with card details

#### Error Cases
- **400 Bad Request**: Invalid ID format (use "abc")
- **404 Not Found**: Use non-existent ID (9999)

### PUT /api/cards/{id}
**Access Control**: Admin only

#### Setup
1. Login as admin
2. Authorize with JWT token

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = 1`
3. Enter request body:
```json
{
  "name": "Updated Card Name",
  "price": 19.99
}
```
4. Click "Execute"
5. **Expected**: 200 status with updated card data

#### Error Cases
- **400 Bad Request**: Invalid ID or missing required fields
- **401 Unauthorized**: No JWT token
- **403 Forbidden**: Login as regular user
- **404 Not Found**: Use non-existent card ID

### DELETE /api/cards/{id}
**Access Control**: Admin only

#### Setup
1. Login as admin
2. Authorize with JWT token

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = [ID of card created in POST test]`
3. Click "Execute"
4. **Expected**: 200 status with success message

#### Error Cases
- **400 Bad Request**: Invalid ID
- **401 Unauthorized**: No JWT token
- **403 Forbidden**: Login as regular user
- **404 Not Found**: Use non-existent card ID

---

## 3. Category Endpoints

### GET /api/categories
**Access Control**: Public

#### Success Case (200 OK)
1. Click "Try it out"
2. Click "Execute"
3. **Expected**: 200 status with array of all categories

### POST /api/categories
**Access Control**: Admin only

#### Setup
1. Login as admin
2. Authorize with JWT token

#### Success Case (201 Created)
1. Click "Try it out"
2. Enter request body:
```json
{
  "name": "Test Category"
}
```
3. Click "Execute"
4. **Expected**: 201 status with created category data

#### Error Cases
- **400 Bad Request**: Missing name field
- **401 Unauthorized**: No JWT token
- **403 Forbidden**: Login as regular user
- **409 Conflict**: Use existing category name ("Pokemon")

### GET /api/categories/{id}
**Access Control**: Public

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = 1`
3. Click "Execute"
4. **Expected**: 200 status with category details

#### Error Cases
- **400 Bad Request**: Invalid ID
- **404 Not Found**: Use non-existent ID

### PUT /api/categories/{id}
**Access Control**: Admin only

#### Setup
1. Login as admin
2. Authorize with JWT token

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = [ID of category created in POST test]`
3. Enter request body:
```json
{
  "name": "Updated Category Name"
}
```
4. Click "Execute"
5. **Expected**: 200 status with updated category data

#### Error Cases
- **400 Bad Request**: Invalid ID or missing name
- **401 Unauthorized**: No JWT token
- **403 Forbidden**: Login as regular user
- **404 Not Found**: Use non-existent category ID

### DELETE /api/categories/{id}
**Access Control**: Admin only

#### Setup
1. Login as admin
2. Authorize with JWT token

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = [ID of category created in POST test]`
3. Click "Execute"
4. **Expected**: 200 status with success message

#### Error Cases
- **400 Bad Request**: Invalid ID
- **401 Unauthorized**: No JWT token
- **403 Forbidden**: Login as regular user
- **404 Not Found**: Use non-existent category ID

---

## 4. Order Endpoints

### POST /api/orders
**Access Control**: Authenticated users

#### Setup
1. Login as regular user (user@example.com / Password123!)
2. Authorize with JWT token

#### Success Case (201 Created)
1. Click "Try it out"
2. Enter request body:
```json
{
  "totalPrice": 49.99,
  "status": "pending"
}
```
3. Click "Execute"
4. **Expected**: 201 status with created order data

#### Error Cases
- **400 Bad Request**: Missing totalPrice
- **401 Unauthorized**: No JWT token

### GET /api/orders
**Access Control**: Authenticated users (users see own orders, admins see all)

#### Setup
1. Login as regular user
2. Authorize with JWT token

#### Success Case (200 OK)
1. Click "Try it out"
2. Click "Execute"
3. **Expected**: 200 status with array of user's orders

#### Admin View
1. Login as admin
2. Authorize with JWT token
3. Click "Try it out"
4. Click "Execute"
5. **Expected**: 200 status with all orders

#### Error Cases
- **401 Unauthorized**: No JWT token

### GET /api/orders/{id}
**Access Control**: Order owner or admin

#### Setup
1. Login as regular user
2. Authorize with JWT token

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = [ID of order created in POST test]`
3. Click "Execute"
4. **Expected**: 200 status with order details

#### Error Cases
- **400 Bad Request**: Invalid ID
- **401 Unauthorized**: No JWT token
- **403 Forbidden**: Try to access another user's order
- **404 Not Found**: Use non-existent order ID

### PUT /api/orders/{id}
**Access Control**: Admin only

#### Setup
1. Login as admin
2. Authorize with JWT token

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = [ID of order created in POST test]`
3. Enter request body:
```json
{
  "status": "shipped"
}
```
4. Click "Execute"
5. **Expected**: 200 status with updated order data

#### Error Cases
- **400 Bad Request**: Invalid ID or missing status
- **401 Unauthorized**: No JWT token
- **403 Forbidden**: Login as regular user
- **404 Not Found**: Use non-existent order ID

### DELETE /api/orders/{id}
**Access Control**: Order owner or admin

#### Setup
1. Login as regular user
2. Authorize with JWT token

#### Success Case (200 OK)
1. Click "Try it out"
2. Enter path parameter: `id = [ID of order created in POST test]`
3. Click "Execute"
4. **Expected**: 200 status with success message

#### Error Cases
- **400 Bad Request**: Invalid ID
- **401 Unauthorized**: No JWT token
- **403 Forbidden**: Try to delete another user's order
- **404 Not Found**: Use non-existent order ID

---

## Testing Checklist

- [ ] Authentication signup/login
- [ ] Public card/category access
- [ ] Admin card CRUD operations
- [ ] Admin category CRUD operations
- [ ] User order creation
- [ ] User order access
- [ ] Admin order management
- [ ] Error handling for all endpoints
- [ ] Authorization restrictions

## Notes

1. Always test error cases after success cases
2. Use different user accounts to test authorization
3. Clean up test data (delete created cards/categories/orders)
4. Verify that regular users cannot access admin-only endpoints
5. Verify that users cannot access other users' private data