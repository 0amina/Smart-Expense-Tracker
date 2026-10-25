# 💸 Smart Expense Tracker API — v1

A clean, production-ready REST API for student expense tracking. Built with Node.js, Express, MongoDB, and JWT authentication.

---

## 📁 Project Structure

```
src/
├── controllers/
│   ├── auth.controller.js         # Register, login, profile
│   ├── transaction.controller.js  # CRUD + filtering
│   ├── dashboard.controller.js    # Summary stats
│   └── stats.controller.js        # Aggregation analytics
├── middleware/
│   ├── auth.middleware.js          # JWT protect guard
│   ├── error.middleware.js         # Centralized error handler
│   └── validate.middleware.js      # Request body validation
├── models/
│   ├── User.model.js               # User schema + password hashing
│   └── Transaction.model.js        # Transaction schema + indexes
├── routes/
│   ├── auth.routes.js
│   ├── transaction.routes.js
│   ├── dashboard.routes.js
│   └── stats.routes.js
├── services/
│   └── notificationService.js      # Placeholder (TODO)
└── server.js                        # App entry point
```

---

## ⚙️ Architecture Decisions

| Decision | Rationale |
|---|---|
| Business logic in controllers, not routes | Routes are just routing. Controllers own logic. |
| Centralized error handler | One place to format all errors consistently |
| `select: false` on password | Never accidentally leaked in query results |
| Compound indexes on transactions | Fast queries by user+date, user+type, user+category |
| `Promise.all()` for parallel queries | Dashboard/stats fetch multiple datasets concurrently |
| MongoDB aggregation for stats | Server-side grouping, far more efficient than JS loops |
| Rate limiting on `/api/*` | Protects all API routes from abuse |
| `toSafeObject()` on User | Controlled output shape — password never serialized |

---

## 🚀 Installation

```bash
# 1. Clone and enter directory
git clone <repo-url>
cd smart-expense-tracker

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT_SECRET

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

---

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <token>
```

---

### 🔑 Auth Endpoints

#### POST /api/auth/register
```json
// Request
{
  "name": "Alex Johnson",
  "email": "alex@university.edu",
  "password": "secure123",
  "monthlyBudget": 500
}

// Response 201
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64a1b2c3d4e5f6789012345a",
      "name": "Alex Johnson",
      "email": "alex@university.edu",
      "monthlyBudget": 500,
      "createdAt": "2024-05-01T10:30:00.000Z"
    }
  }
}
```

#### POST /api/auth/login
```json
// Request
{ "email": "alex@university.edu", "password": "secure123" }

// Response 200
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "_id": "...", "name": "Alex Johnson", "email": "alex@university.edu", "monthlyBudget": 500 }
  }
}
```

#### GET /api/auth/me *(protected)*
```json
// Response 200
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Alex Johnson", "email": "alex@university.edu", "monthlyBudget": 500, "createdAt": "..." }
  }
}
```

---

### 💳 Transaction Endpoints

#### POST /api/transactions *(protected)*
```json
// Request
{
  "type": "expense",
  "amount": 12.50,
  "category": "Food",
  "description": "Coffee and lunch at campus cafe",
  "date": "2024-05-15"
}

// Response 201
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "_id": "64b2c3d4e5f67890123456ab",
      "user": "64a1b2c3d4e5f6789012345a",
      "type": "expense",
      "amount": 12.5,
      "category": "Food",
      "description": "Coffee and lunch at campus cafe",
      "date": "2024-05-15T00:00:00.000Z",
      "createdAt": "2024-05-15T11:20:00.000Z"
    }
  }
}
```

#### GET /api/transactions *(protected)*

Supports query param filtering — all combinable:

| Param | Example | Description |
|---|---|---|
| `type` | `?type=expense` | Filter by income or expense |
| `category` | `?category=Food` | Filter by category |
| `month` | `?month=5` | Filter by month (1–12) |
| `year` | `?year=2024` | Filter by year |
| `search` | `?search=coffee` | Search in description |
| `page` | `?page=2` | Pagination (default: 1) |
| `limit` | `?limit=10` | Per page (default: 20, max: 100) |

```json
// GET /api/transactions?type=expense&month=5&search=coffee
// Response 200
{
  "success": true,
  "data": {
    "transactions": [
      { "_id": "...", "type": "expense", "amount": 4.5, "category": "Food", "description": "coffee from library cafe", "date": "..." }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### GET /api/transactions/:id — single transaction
#### PUT /api/transactions/:id — update (partial allowed)
#### DELETE /api/transactions/:id
```json
// DELETE Response 200
{ "success": true, "message": "Transaction deleted successfully", "data": null }
```

---

### 📊 Dashboard

#### GET /api/dashboard/summary *(protected)*
```json
// GET /api/dashboard/summary?month=5&year=2024
// Response 200
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 1200.00,
      "totalExpenses": 430.75,
      "balance": 769.25,
      "incomeCount": 2,
      "expenseCount": 18,
      "monthlyBudget": 500,
      "budgetUsedPercent": 86,
      "budgetStatus": "warning"
    },
    "recentTransactions": [
      { "_id": "...", "type": "expense", "amount": 12.5, "category": "Food", "description": "Lunch", "date": "..." }
    ],
    "period": { "month": 5, "year": 2024 }
  }
}
```

`budgetStatus` values: `"on_track"` | `"warning"` (≥80%) | `"exceeded"` (≥100%) | `"not_set"`

---

### 📈 Stats

#### GET /api/stats/categories *(protected)*
```json
// GET /api/stats/categories?type=expense&month=5
// Response 200
{
  "success": true,
  "data": {
    "categories": [
      { "category": "Food", "total": 180.50, "count": 12, "avgAmount": 15.04, "percentage": 41.9 },
      { "category": "Transport", "total": 95.00, "count": 5, "avgAmount": 19.00, "percentage": 22.1 },
      { "category": "Entertainment", "total": 60.00, "count": 3, "avgAmount": 20.00, "percentage": 13.9 }
    ],
    "grandTotal": 430.75,
    "type": "expense"
  }
}
```

#### GET /api/stats/monthly *(protected)*
```json
// GET /api/stats/monthly?months=3
// Response 200
{
  "success": true,
  "data": {
    "monthly": [
      { "year": 2024, "month": 3, "period": "2024-03", "income": 1200, "expense": 380, "incomeCount": 2, "expenseCount": 14, "balance": 820 },
      { "year": 2024, "month": 4, "period": "2024-04", "income": 1200, "expense": 510, "incomeCount": 2, "expenseCount": 19, "balance": 690 },
      { "year": 2024, "month": 5, "period": "2024-05", "income": 1200, "expense": 430.75, "incomeCount": 2, "expenseCount": 18, "balance": 769.25 }
    ],
    "periodMonths": 3,
    "startDate": "2024-03-01"
  }
}
```

---

### GET /api/export/csv
Authorization: Bearer <token>


### ❌ Error Responses

All errors follow this shape:
```json
// 401 Unauthorized
{ "success": false, "message": "Access denied. No token provided." }

// 422 Validation Failed
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" },
    { "field": "type", "message": "Type must be \"income\" or \"expense\"" }
  ]
}

// 404 Not Found
{ "success": false, "message": "Transaction not found" }

// 409 Conflict
{ "success": false, "message": "Email already exists" }

// 429 Rate Limited
{ "success": false, "message": "Too many requests from this IP, please try again later." }
```

---

## 🏷️ Valid Categories

**Expense:** Food, Transport, Housing, Entertainment, Healthcare, Education, Shopping, Utilities, Other

**Income:** Salary, Freelance, Gift, Scholarship, Investment, Other

---

## 🔭 Planned (v2+)

- [ ] Email notifications (Nodemailer)
- [ ] Weekly spending summaries (node-cron)
- [ ] Budget alerts (notificationService implementation)
- [ ] Export to CSV
- [ ] Recurring transactions
