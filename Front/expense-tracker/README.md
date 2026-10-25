# Spendly — Smart Expense Tracker

A clean, production-ready React frontend for tracking personal expenses. Built as a junior portfolio project following real-world best practices.

---

## Tech Stack

| Concern         | Library / Tool       |
|----------------|----------------------|
| UI framework    | React 18 (Vite)      |
| Routing         | React Router v6      |
| HTTP client     | Axios                |
| Form validation | React Hook Form      |
| Auth            | JWT (localStorage)   |
| Styling         | CSS Modules          |

---

## Project Structure

```
src/
├── assets/
│   └── styles/
│       └── global.css          # Design tokens + reset
│
├── components/
│   ├── ui/                     # Reusable primitives
│   │   ├── Alert.jsx / .module.css
│   │   ├── Badge.jsx / .module.css
│   │   ├── Button.jsx / .module.css
│   │   ├── Card.jsx / .module.css
│   │   ├── Input.jsx / .module.css
│   │   ├── Modal.jsx / .module.css
│   │   ├── Select.jsx / .module.css
│   │   └── Spinner.jsx / .module.css
│   ├── ProtectedRoute.jsx      # Redirects unauthenticated users
│   └── PublicRoute.jsx         # Redirects authenticated users away from auth pages
│
├── context/
│   └── AuthContext.jsx         # JWT auth state + login/logout/register
│
├── hooks/
│   └── useExpenses.js          # CRUD operations + loading/error states
│
├── layouts/
│   ├── AuthLayout.jsx          # Split-panel for login/register
│   └── DashboardLayout.jsx     # Sidebar + topbar shell
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── Auth.module.css
│   ├── dashboard/
│   │   ├── OverviewPage.jsx    # Stats + recent expenses
│   │   ├── ExpensesPage.jsx    # Full list with filter + delete
│   │   ├── ExpenseFormPage.jsx # Create & edit (same form)
│   │   └── ProfilePage.jsx
│   └── NotFoundPage.jsx
│
├── services/
│   ├── api.js                  # Axios instance + JWT interceptors
│   ├── authService.js          # login / register / getProfile / updateProfile
│   └── expenseService.js       # getAll / getById / create / update / remove / getSummary
│
└── utils/
    ├── constants.js            # CATEGORIES, CURRENCIES
    └── formatters.js           # formatCurrency, formatDate, getCategoryIcon
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure API URL
cp .env.example .env
# Edit VITE_API_URL to point at your backend

# 3. Start dev server
npm run dev
```

---

## Expected Backend API

### Auth
| Method | Endpoint        | Body / Response                         |
|--------|-----------------|-----------------------------------------|
| POST   | /auth/register  | `{name, email, password}` → `{token, user}` |
| POST   | /auth/login     | `{email, password}` → `{token, user}`  |
| GET    | /auth/profile   | → `user`                                |
| PUT    | /auth/profile   | `{name, email}` → `user`               |

### Expenses
| Method | Endpoint              | Notes                                  |
|--------|-----------------------|----------------------------------------|
| GET    | /expenses             | Supports `?category=&limit=` query     |
| GET    | /expenses/:id         |                                        |
| POST   | /expenses             | `{description, amount, category, date, notes?}` |
| PUT    | /expenses/:id         |                                        |
| DELETE | /expenses/:id         |                                        |
| GET    | /expenses/summary     | `{thisMonth, lastMonth, totalCount, topCategory}` |

All protected routes require `Authorization: Bearer <token>` header (added automatically by Axios interceptor).

---

## Key Features

- **JWT auth** stored in `localStorage`, attached to every request via Axios interceptor
- **Auto-logout** on 401 responses
- **Protected routes** — unauthenticated users are redirected to `/login`, with return path preserved
- **Public routes** — authenticated users are redirected away from login/register
- **Form validation** — React Hook Form with inline error messages, no submit until valid
- **Loading + error states** — every async operation has proper UX
- **Responsive** — mobile-first, sidebar collapses on small screens
- **CSS Modules** — zero global style conflicts, co-located with components

---

## Design System

CSS custom properties defined in `global.css`:

```css
--accent        : #C4612A   /* primary CTA */
--bg            : #F9F6F0   /* warm parchment background */
--font-display  : 'DM Serif Display'
--font-body     : 'DM Sans'
```

All spacing, radii, shadows, and transitions use tokens — easy to retheme.
