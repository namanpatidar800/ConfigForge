# 💻 Laptop Configuration & Pricing Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.x-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

> A **full-stack MERN web application** built for sales executives to manage laptop components, build custom configurations, get automatic price breakdowns, and maintain a searchable history of past quotations — with an ironclad guarantee that **price changes never affect already-saved quotes**.

---

## 🌐 Live Demo

> 🔗 **[Click here to view the live demo](#)** ← Replace with your Render/Vercel URL after deployment

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure login/register with role-based access (`admin` / `sales_executive`) |
| 🧩 **Component Management** | Full CRUD across 8 hardware categories with soft-delete and price history audit trail |
| 🛠️ **Configuration Builder** | One-dropdown-per-category builder with live price preview before saving |
| 💰 **Automatic Pricing** | Server-side price calculation with a complete component-wise breakdown |
| 📜 **Historical Quotations** | Price snapshots are frozen at save time — catalog changes never corrupt old quotes |
| 🔍 **Search & Filter** | Search components by name/brand/SKU/category; search quotes by name/customer/email/status |
| 📄 **Pagination** | Server-side paginated quote listing (configurable page size, max 100) |
| 📱 **Responsive UI** | Mobile-first design built with Tailwind CSS and Lucide React icons |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Redux Toolkit, Tailwind CSS, Axios, Vite |
| **Backend** | Node.js, Express.js, JWT (jsonwebtoken), bcryptjs, Morgan |
| **Database** | MongoDB + Mongoose |
| **Dev Tools** | Nodemon, ESLint, Vite HMR |

---

## 🧠 Core Design Decision — Historical Pricing

This is the most important architectural decision in the system. Two distinct Mongoose collections handle two separate concerns:

**`Component` (Live Catalog)** — Every component has a `price` field and a `priceHistory[]` array. When a price is edited, the *old* price is automatically pushed into `priceHistory` before being overwritten — giving you a full audit trail of how any component's price moved over time.

**`Configuration` (Saved Quote)** — When a configuration is saved, each line item is stored as a **snapshot** containing `priceAtSelection`, `name`, `category`, `brand`, and `specs` — all copied directly from the component *at that exact moment*. The snapshot holds a reference (`_id`) to the original component for traceability, but the price is **frozen** and **never recomputed** from the live catalog.

✅ This means: editing a component's price later, or even deactivating it entirely, has **zero effect** on any quotation that was already saved.

---

## 📂 Project Structure

```
laptop-configurator/
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection via Mongoose
│   ├── models/
│   │   ├── User.js                 # User schema with role & bcrypt password hashing
│   │   ├── Component.js            # Component schema with 8 categories & priceHistory[]
│   │   └── Configuration.js        # Quote schema with frozen snapshot line items
│   ├── controllers/
│   │   ├── authController.js       # register, login, getMe
│   │   ├── componentController.js  # CRUD + soft-delete + price snapshot on update
│   │   └── configurationController.js # CRUD + price-preview endpoint
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── componentRoutes.js
│   │   └── configurationRoutes.js
│   ├── middleware/
│   │   └── auth.js                 # JWT protect middleware
│   ├── seed.js                     # Seeds demo users, components & 1 sample quote
│   ├── server.js                   # Express app entry point
│   ├── .env.example                # Environment variable template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js            # Axios instance with JWT interceptor
    │   ├── store/                  # Redux Toolkit slices (auth, components, configurations)
    │   ├── components/             # Shared: Navbar, PrivateRoute, PriceBreakdown
    │   ├── pages/                  # Login, Dashboard, Components, ConfigBuilder,
    │   │                           # ConfigList, ConfigDetail
    │   ├── App.jsx                 # Route definitions
    │   └── main.jsx                # React + Redux Provider entry
    ├── index.html
    ├── vite.config.js              # Dev-server proxy → backend :5000
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** 18 or higher
- **MongoDB** — either local `mongod` or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster

---

### Step 1 — Backend

```bash
cd backend
copy .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/laptop-config
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=http://localhost:5173
```

```bash
npm install
npm run seed      # Creates demo users, sample components & one sample quote
npm run dev       # Starts backend at http://localhost:5000
```

---

### Step 2 — Frontend

```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server at http://localhost:5173
```

---

### 🔑 Demo Accounts (created by seed script)

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `Admin@123` | `admin` |
| `sales@example.com` | `Sales@123` | `sales_executive` |

---

## 🌐 API Overview

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and receive JWT |
| `GET` | `/me` | ✅ | Get current user info |

### Component Routes — `/api/components`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List all components (supports `?category=&search=&active=`) |
| `GET` | `/categories` | ✅ | Get the list of valid categories |
| `GET` | `/:id` | ✅ | Get a single component |
| `POST` | `/` | ✅ Admin | Create a new component |
| `PUT` | `/:id` | ✅ Admin | Update component (price change auto-archives old price) |
| `DELETE` | `/:id` | ✅ Admin | Soft-delete (sets `isActive = false`) |

### Configuration Routes — `/api/configurations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List quotes (supports `?search=&status=&page=&limit=`) |
| `GET` | `/:id` | ✅ | Full quote detail with price breakdown |
| `POST` | `/` | ✅ | Create new configuration (prices frozen at save time) |
| `PUT` | `/:id` | ✅ | Update configuration (re-snapshots on component change) |
| `DELETE` | `/:id` | ✅ | Permanently delete a quote |
| `POST` | `/price-preview` | ✅ | Live price preview without saving |

---

## ☁️ Deployment

See the step-by-step deployment guide in [`DEPLOYMENT.md`](./DEPLOYMENT.md) for pushing to GitHub and deploying to Render.

---

## 🔮 Future Improvements

- PDF export of quotations for clients
- Email quotation delivery via SendGrid/Nodemailer
- Multi-currency support with real-time FX rates
- Admin dashboard with analytics (total quotes, revenue trends)
- Component comparison tool in the builder
- Unit & integration tests with Jest and Supertest
- Refresh token rotation for long-lived sessions

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
