# Backend API Documentation

This document describes the API endpoints your Node.js/Express backend needs to implement for the Credit Jambo frontend.

## Configuration

Set the backend URL in your environment:
- Create a `.env.local` file in the root directory
- Add: `VITE_API_URL=http://localhost:3000/api` (or your backend URL)

## Authentication

All authenticated endpoints should expect a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication Endpoints

#### 1. Sign Up
- **Endpoint:** `POST /api/auth/signup`
- **Body:**
  ```json
  {
    "fullName": "string",
    "email": "string",
    "phone": "string (optional)",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": "string",
      "email": "string",
      "fullName": "string",
      "phone": "string"
    },
    "token": "string (JWT)"
  }
  ```

#### 2. Sign In
- **Endpoint:** `POST /api/auth/signin`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": "string",
      "email": "string",
      "fullName": "string",
      "phone": "string"
    },
    "token": "string (JWT)"
  }
  ```

#### 3. Get Current User
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "phone": "string"
  }
  ```

### Account Endpoints

#### 4. Get Account
- **Endpoint:** `GET /api/accounts`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "id": "string",
    "user_id": "string",
    "balance": "number",
    "currency": "string (default: RWF)"
  }
  ```

### Transaction Endpoints

#### 5. Get Transactions
- **Endpoint:** `GET /api/transactions?limit=20`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:**
  - `limit`: number (optional, default: 20)
- **Response:**
  ```json
  [
    {
      "id": "string",
      "type": "string (deposit|withdraw)",
      "amount": "number",
      "description": "string",
      "created_at": "string (ISO 8601)",
      "status": "string",
      "balance_before": "number",
      "balance_after": "number"
    }
  ]
  ```

#### 6. Create Deposit
- **Endpoint:** `POST /api/transactions/deposit`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "amount": "number",
    "description": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Deposit successful",
    "transaction": {
      "id": "string",
      "type": "deposit",
      "amount": "number",
      "balance_before": "number",
      "balance_after": "number"
    }
  }
  ```

#### 7. Create Withdrawal
- **Endpoint:** `POST /api/transactions/withdraw`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "amount": "number",
    "description": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Withdrawal successful",
    "transaction": {
      "id": "string",
      "type": "withdraw",
      "amount": "number",
      "balance_before": "number",
      "balance_after": "number"
    }
  }
  ```
- **Error Response (Insufficient Balance):**
  ```json
  {
    "error": "Insufficient balance"
  }
  ```

## Database Schema

Your backend should implement these tables:

### Users Table
```sql
- id (uuid, primary key)
- email (string, unique)
- password (hashed string)
- full_name (string)
- phone (string, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

### Accounts Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- balance (decimal, default: 0.00)
- currency (string, default: 'RWF')
- created_at (timestamp)
- updated_at (timestamp)
```

### Transactions Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- account_id (uuid, foreign key to accounts)
- type (enum: 'deposit', 'withdraw')
- amount (decimal)
- balance_before (decimal)
- balance_after (decimal)
- description (string, optional)
- status (string, default: 'completed')
- created_at (timestamp)
```

## Error Handling

All error responses should follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Security Considerations

1. **Password Hashing:** Use bcrypt or similar to hash passwords
2. **JWT Tokens:** Sign tokens with a secure secret key
3. **Input Validation:** Validate all inputs on the backend
4. **Rate Limiting:** Implement rate limiting on authentication endpoints
5. **CORS:** Configure CORS to allow requests from your frontend domain
6. **SQL Injection:** Use parameterized queries or ORMs
7. **Transaction Atomicity:** Ensure deposit/withdraw operations are atomic

## Frontend Polling

The frontend uses polling to update data:
- Account balance: Every 5 seconds
- Transactions: Every 10 seconds

For better performance, consider implementing WebSocket connections for real-time updates.
