export const curriculum = [
  {
    day: 1,
    title: "Node.js & Express Foundations",
    subtitle: "Set up your first server",
    topic: "express",
    color: "#10b981",
    icon: "⚡",
    sections: [
      {
        id: "what-is-express",
        title: "What is Express?",
        type: "concept",
        content: `Express is a **minimal, unopinionated web framework** for Node.js. Think of it like a React-but-for-servers — it gives you the essential tools to handle HTTP requests without dictating how you structure everything.

**Express handles:**
- Routing (GET /users, POST /products)
- Middleware (functions that run between request and response)
- Serving static files
- Request parsing (JSON bodies, URL params)

**Express does NOT:**
- Connect to databases on its own
- Handle authentication natively
- Manage sessions out of the box
- Replace your database driver (pg, mssql, etc.)

**Where it fits in your stack:**
Browser ↔ React Frontend ↔ Express API ↔ Database (PostgreSQL / SQL Server)`,
        notFor: "Express is not a database ORM, not a full MVC framework like Ruby on Rails, and not a replacement for a cloud function service like AWS Lambda (though it can run on them)."
      },
      {
        id: "installation",
        title: "Installation & Project Setup",
        type: "installation",
        content: `Create a new Express project from scratch:`,
        steps: [
          { cmd: "mkdir my-api && cd my-api", desc: "Create project folder" },
          { cmd: "npm init -y", desc: "Initialize Node.js project" },
          { cmd: "npm install express", desc: "Install Express" },
          { cmd: "npm install -D nodemon", desc: "Install Nodemon (auto-restart on save)" },
          { cmd: "npm install dotenv cors helmet morgan", desc: "Install essential middleware" },
          { cmd: "npm install pg", desc: "PostgreSQL driver" },
          { cmd: "npm install mssql", desc: "SQL Server driver (alternative)" }
        ],
        packageJson: `{
  "name": "my-api",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}`,
        folderStructure: `my-api/
├── server.js          ← Entry point
├── routes/
│   ├── users.js
│   └── products.js
├── middleware/
│   └── auth.js
├── db/
│   └── connection.js
├── .env               ← Never commit this!
└── package.json`
      },
      {
        id: "first-server",
        title: "Your First Express Server",
        type: "example",
        code: `// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────
app.use(cors());                    // Allow cross-origin requests
app.use(morgan('dev'));              // Log every request to console
app.use(express.json());            // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!', status: 'running' });
});

app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Layla Hassan', role: 'admin' },
    { id: 2, name: 'Omar Karimi', role: 'user' }
  ]);
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;          // From the URL
  const { format } = req.query;       // From ?format=json
  
  res.json({ id: Number(id), format: format || 'default' });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;   // From JSON body
  
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  
  res.status(201).json({ id: 3, name, email, created: new Date() });
});

// ── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', message: err.message });
});

// ── Start Server ──────────────────────────────
app.listen(PORT, () => {
  console.log(\`🚀 Server running at http://localhost:\${PORT}\`);
});`,
        explanation: "Every Express app follows this pattern: create app → add middleware → define routes → handle errors → listen on a port. Middleware runs in order, top to bottom."
      },
      {
        id: "routing",
        title: "Routing & Route Organization",
        type: "example",
        code: `// routes/users.js — Separate route files keep code organized
const express = require('express');
const router = express.Router();

// GET  /api/users          ← list all users
// GET  /api/users/:id      ← get one user
// POST /api/users          ← create user
// PUT  /api/users/:id      ← update user
// DELETE /api/users/:id   ← delete user

router.get('/', async (req, res, next) => {
  try {
    // Will connect to DB in Day 4
    const users = [{ id: 1, name: 'Test User' }];
    res.json(users);
  } catch (err) {
    next(err); // Pass to error handler
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    res.json({ id, name: 'Test User' });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, role = 'user' } = req.body;
    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email required' });
    }
    res.status(201).json({ id: Date.now(), name, email, role });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

// ── In server.js, mount the router: ──────────
// const usersRouter = require('./routes/users');
// app.use('/api/users', usersRouter);
// Now: GET /api/users, POST /api/users, etc.`,
        explanation: "Router files keep your server.js clean. Each router handles one resource (users, products, orders). Mount them with app.use() in server.js."
      },
      {
        id: "middleware",
        title: "Understanding Middleware",
        type: "concept",
        content: `Middleware is just a **function with (req, res, next)**. It runs between the request arriving and the response being sent.

Think of it as a pipeline: Request → [middleware1] → [middleware2] → [route handler] → Response

**Types of middleware:**
- **Application middleware**: Runs on every request (cors, morgan)
- **Route middleware**: Runs only on specific routes (auth check)
- **Error middleware**: Has 4 params: (err, req, res, next)
- **Built-in**: express.json(), express.static()`,
        code: `// Custom middleware examples

// 1. Logger middleware
const logger = (req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next(); // MUST call next() or the request hangs!
};

// 2. Auth middleware — attach to protected routes only
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    // verify token (using jwt in real apps)
    req.user = { id: 1, role: 'admin' }; // attach to request
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// 3. Request validator
const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];
  if (!name || name.length < 2) errors.push('name must be 2+ chars');
  if (!email || !email.includes('@')) errors.push('valid email required');
  if (errors.length) return res.status(400).json({ errors });
  next();
};

// Usage:
app.use(logger);                              // Global
app.get('/profile', requireAuth, handler);    // Route-specific
app.post('/users', validateUser, createUser); // Chain them`
      }
    ],
    challenge: {
      title: "Day 1 Challenge",
      description: "Build a Products API with Express that has 4 routes: list all products, get one by ID, create a product, and delete a product. Add a request logger middleware. No database yet — use an in-memory array.",
      hints: [
        "Start with let products = [] at the top of your file",
        "Use req.params.id to get the product ID from the URL",
        "Use req.body for POST data, remember app.use(express.json())",
        "Return 404 if a product with that ID doesn't exist"
      ]
    }
  },

  {
    day: 2,
    title: "Express Middleware Deep Dive",
    subtitle: "CORS, error handling, validation",
    topic: "express",
    color: "#10b981",
    icon: "🔧",
    sections: [
      {
        id: "cors-config",
        title: "CORS — Why It Matters",
        type: "concept",
        content: `**CORS (Cross-Origin Resource Sharing)** controls which domains can access your API. Your React app (localhost:5173) calling your Express API (localhost:3000) hits a CORS policy.

Without CORS configured: Browser blocks the response.
With CORS configured: Browser allows it.

CORS is a **browser security feature** — tools like Postman bypass it entirely. If your API works in Postman but not in the browser, it's CORS.`,
        code: `const cors = require('cors');

// Option 1: Allow everything (dev only!)
app.use(cors());

// Option 2: Allow specific origins (production)
app.use(cors({
  origin: ['http://localhost:5173', 'https://myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // Allow cookies to be sent
}));

// Option 3: Dynamic origin (for multi-tenant apps)
const allowedOrigins = ['https://app1.com', 'https://app2.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(\`Origin \${origin} not allowed\`));
    }
  }
}));

// Option 4: Different CORS per route
app.get('/public', cors(), publicHandler);
app.get('/private', cors({ origin: 'https://myapp.com' }), privateHandler);`
      },
      {
        id: "error-handling",
        title: "Error Handling Patterns",
        type: "example",
        code: `// ── Custom Error Class ───────────────────────
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Expected errors
  }
}

// ── Async wrapper — avoids try/catch in every route ──
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── Routes using asyncHandler ─────────────────
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await db.findUser(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.json(user);
}));

// ── Global Error Middleware (must be LAST) ────
app.use((err, req, res, next) => {
  let { statusCode = 500, message } = err;
  
  // Don't expose internal errors to clients
  if (!err.isOperational) {
    message = 'An unexpected error occurred';
    statusCode = 500;
    console.error('UNHANDLED ERROR:', err);
  }
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ── Handle 404 (route not found) ─────────────
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: \`Route \${req.originalUrl} not found\`
  });
});`,
        explanation: "The asyncHandler wrapper is a game-changer — instead of try/catch in every route, wrap async routes and errors bubble up to your global error handler automatically."
      },
      {
        id: "env-config",
        title: "Environment Variables & Config",
        type: "example",
        code: `// .env file (NEVER commit to git)
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
MSSQL_HOST=localhost
MSSQL_USER=sa
MSSQL_PASSWORD=YourPassword123
MSSQL_DATABASE=myapp
JWT_SECRET=super-secret-key-change-in-production
CORS_ORIGINS=http://localhost:5173,https://myapp.com

// .env.example (DO commit — template for others)
PORT=3000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
CORS_ORIGINS=

// config/index.js — Centralize all config
require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  
  postgres: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  },
  
  mssql: {
    host: process.env.MSSQL_HOST || 'localhost',
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    database: process.env.MSSQL_DATABASE,
    port: parseInt(process.env.MSSQL_PORT) || 1433
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',')
  }
};

// Validate required config at startup
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(\`Missing required env var: \${key}\`);
  }
}

module.exports = config;`
      },
      {
        id: "rate-limiting",
        title: "Rate Limiting & Security",
        type: "example",
        code: `const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// npm install express-rate-limit compression

// ── Security headers (helmet) ─────────────────
app.use(helmet()); // Sets 11 security HTTP headers automatically

// ── Compress responses ────────────────────────
app.use(compression());

// ── Global rate limiter ───────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in 15 minutes' }
});

// ── Strict limiter for auth routes ────────────
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // only 10 login attempts/hour
  message: { error: 'Too many login attempts, account temporarily locked' }
});

app.use('/api', globalLimiter);
app.post('/api/auth/login', authLimiter, loginHandler);
app.post('/api/auth/register', authLimiter, registerHandler);`
      }
    ],
    challenge: {
      title: "Day 2 Challenge",
      description: "Add proper error handling to your Products API from Day 1. Create a custom AppError class, wrap all routes in asyncHandler, add a global error middleware, handle 404 routes, and configure CORS to only allow http://localhost:5173.",
      hints: [
        "The error middleware must have 4 parameters: (err, req, res, next)",
        "Add app.use('*') AFTER all routes to catch 404s",
        "Test by visiting a route that doesn't exist — you should get a JSON error"
      ]
    }
  },

  {
    day: 3,
    title: "Axios — HTTP Client Mastery",
    subtitle: "Make HTTP requests like a pro",
    topic: "axios",
    color: "#6366f1",
    icon: "🌐",
    sections: [
      {
        id: "what-is-axios",
        title: "What is Axios?",
        type: "concept",
        content: `Axios is an **HTTP client library** that works in both browsers and Node.js. It wraps the native fetch API with a much cleaner interface and powerful features.

**Axios handles:**
- GET, POST, PUT, PATCH, DELETE requests
- Automatic JSON serialization/deserialization
- Request and response interceptors
- Timeout and cancellation
- Progress tracking for uploads/downloads
- Automatic error throwing for non-2xx status codes

**Axios does NOT:**
- Manage server state or caching (use React Query for that)
- Retry failed requests (you need to configure this)
- Store or sync data between components

**Axios vs fetch:**`,
        comparison: [
          { feature: "JSON auto-parse", axios: "✅ Automatic", fetch: "❌ Manual .json()" },
          { feature: "Error on 404/500", axios: "✅ Throws error", fetch: "❌ Resolves as success" },
          { feature: "Request cancellation", axios: "✅ Built-in", fetch: "⚠️ AbortController needed" },
          { feature: "Interceptors", axios: "✅ Built-in", fetch: "❌ Not available" },
          { feature: "Upload progress", axios: "✅ onUploadProgress", fetch: "❌ Limited" },
          { feature: "Timeout", axios: "✅ timeout: 5000", fetch: "❌ Manual only" },
          { feature: "Bundle size", axios: "⚠️ ~14KB", fetch: "✅ Zero (native)" }
        ],
        notFor: "Axios is not a state manager. Don't use it to store or share data across components — that's React Query's job. Axios just makes the HTTP call; React Query decides when to make it and what to do with the result."
      },
      {
        id: "installation-axios",
        title: "Installation & Setup",
        type: "installation",
        steps: [
          { cmd: "npm install axios", desc: "Install Axios in your React/Vite project" }
        ],
        content: `After installing, create a centralized API client so you don't repeat base URLs everywhere:`,
        code: `// src/lib/api.js — Your centralized Axios instance

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,  // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// ── Request Interceptor: attach auth token ────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    console.log(\`→ \${config.method?.toUpperCase()} \${config.url}\`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle auth errors ──
api.interceptors.response.use(
  (response) => {
    console.log(\`← \${response.status} \${response.config.url}\`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;`
      },
      {
        id: "axios-basics",
        title: "Core Request Methods",
        type: "example",
        code: `import api from './lib/api';

// ── GET requests ──────────────────────────────
// Simple GET
const { data } = await api.get('/users');
// data is already the parsed JSON array

// GET with query params: /users?role=admin&page=2
const { data: users } = await api.get('/users', {
  params: { role: 'admin', page: 2, limit: 10 }
});

// GET one item
const { data: user } = await api.get(\`/users/\${id}\`);

// ── POST requests ─────────────────────────────
const { data: newUser } = await api.post('/users', {
  name: 'Fatima Al-Rashid',
  email: 'fatima@example.com',
  role: 'admin'
});
// Axios auto-serializes the body to JSON

// ── PUT (full replace) & PATCH (partial) ──────
const { data: updated } = await api.put(\`/users/\${id}\`, {
  name: 'New Name',
  email: 'new@example.com',
  role: 'user'  // must send ALL fields
});

const { data: patched } = await api.patch(\`/users/\${id}\`, {
  name: 'Updated Name Only'  // only changed fields
});

// ── DELETE ────────────────────────────────────
await api.delete(\`/users/\${id}\`);
// Returns 204 No Content typically

// ── Multiple requests in parallel ────────────
const [usersRes, productsRes] = await Promise.all([
  api.get('/users'),
  api.get('/products')
]);
const { data: usersData } = usersRes;
const { data: productsData } = productsRes;`
      },
      {
        id: "axios-error-handling",
        title: "Error Handling with Axios",
        type: "example",
        code: `import api from './lib/api';
import axios from 'axios';

// ── Full error handling pattern ───────────────
async function fetchUser(id) {
  try {
    const { data } = await api.get(\`/users/\${id}\`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with 4xx or 5xx
        console.error('Server error:', error.response.status, error.response.data);
        throw new Error(error.response.data.message || 'Server error');
      } else if (error.request) {
        // Request sent, no response (server down, network error)
        throw new Error('No response from server. Check your connection.');
      } else {
        // Error setting up request
        throw new Error(\`Request error: \${error.message}\`);
      }
    }
    throw error; // Re-throw non-Axios errors
  }
}

// ── Extracting error details ──────────────────
api.get('/users').catch(error => {
  console.log(error.response?.status);      // HTTP status code (404, 500)
  console.log(error.response?.data);        // Response body from server
  console.log(error.response?.headers);     // Response headers
  console.log(error.request);               // The request that was made
  console.log(error.message);               // 'Network Error', 'timeout', etc.
  console.log(error.code);                  // 'ECONNABORTED', 'ERR_NETWORK'
});

// ── Request cancellation ─────────────────────
const controller = new AbortController();

api.get('/large-dataset', { signal: controller.signal })
  .catch(error => {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      console.log('Request cancelled');
    }
  });

// Cancel it (e.g., user navigates away)
controller.abort();

// ── In React useEffect — prevent stale requests ──
useEffect(() => {
  const controller = new AbortController();
  
  api.get(\`/users/\${userId}\`, { signal: controller.signal })
    .then(({ data }) => setUser(data))
    .catch(err => { if (!axios.isCancel(err)) setError(err.message); });
  
  return () => controller.abort(); // Cleanup on unmount
}, [userId]);`
      },
      {
        id: "file-uploads",
        title: "File Uploads & Download Progress",
        type: "example",
        code: `import api from './lib/api';

// ── File upload with progress ─────────────────
async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', '123');

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percent); // Update progress bar
    }
  });
  
  return data;
}

// ── In a React component ─────────────────────
function FileUploader() {
  const [progress, setProgress] = useState(0);
  
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    await uploadFile(file, setProgress);
  };
  
  return (
    <div>
      <input type="file" onChange={handleUpload} />
      <progress value={progress} max={100}>{progress}%</progress>
    </div>
  );
}

// ── File download ─────────────────────────────
async function downloadFile(fileId, filename) {
  const { data } = await api.get(\`/files/\${fileId}\`, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(\`Download: \${percent}%\`);
    }
  });
  
  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}`
      }
    ],
    challenge: {
      title: "Day 3 Challenge",
      description: "Create a React component called UserManager. It should fetch a list of users from JSONPlaceholder (https://jsonplaceholder.typicode.com/users), display them in a list, have a form to create a new user (POST), and a delete button per user. Handle loading states and errors. Use your centralized Axios instance.",
      hints: [
        "Create src/lib/api.js with baseURL pointing to jsonplaceholder",
        "Use useState for users, loading, and error",
        "POST to /users returns a 201 with the created user (JSONPlaceholder fakes it)",
        "Use async/await inside event handlers with try/catch"
      ]
    }
  },

  {
    day: 4,
    title: "PostgreSQL with Express",
    subtitle: "Real database integration",
    topic: "database",
    color: "#0ea5e9",
    icon: "🐘",
    sections: [
      {
        id: "pg-setup",
        title: "PostgreSQL Setup & Connection",
        type: "installation",
        steps: [
          { cmd: "npm install pg", desc: "Install the pg driver" },
          { cmd: "npm install pg-pool", desc: "Connection pooling (included with pg)" }
        ],
        content: "PostgreSQL uses **connection pools** — instead of opening/closing a connection per query (slow), a pool keeps N connections open and reuses them.",
        code: `// db/postgres.js
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.postgres.connectionString,
  // OR use individual params:
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'myapp',
  
  // Pool configuration
  max: 20,              // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('PostgreSQL connection error:', err.stack);
    process.exit(1);
  }
  console.log('✅ PostgreSQL connected');
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) return console.error('Query error:', err.stack);
    console.log('DB time:', result.rows[0].now);
  });
});

// Helper for clean query syntax
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };`
      },
      {
        id: "pg-queries",
        title: "CRUD Queries with PostgreSQL",
        type: "example",
        code: `// routes/users.js — Full CRUD with PostgreSQL
const { query } = require('../db/postgres');

// ── Schema (run once) ─────────────────────────
// CREATE TABLE users (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(100) NOT NULL,
//   email VARCHAR(255) UNIQUE NOT NULL,
//   role VARCHAR(50) DEFAULT 'user',
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );

// ── GET ALL users (with pagination) ──────────
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    const { rows: users } = await query(
      \`SELECT id, name, email, role, created_at
       FROM users
       WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3\`,
      [\`%\${search}%\`, limit, offset]
    );
    
    const { rows: [{ count }] } = await query(
      'SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1',
      [\`%\${search}%\`]
    );
    
    res.json({
      users,
      pagination: { page, limit, total: parseInt(count), pages: Math.ceil(count / limit) }
    });
  } catch (err) { next(err); }
});

// ── GET one user ──────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── POST create user ──────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { name, email, role = 'user' } = req.body;
    const { rows } = await query(
      'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *',
      [name, email, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
});

// ── PUT/PATCH update ──────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const { rows } = await query(
      \`UPDATE users 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           updated_at = NOW()
       WHERE id = $4 RETURNING *\`,
      [name, email, role, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── DELETE ────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM users WHERE id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});`
      },
      {
        id: "pg-transactions",
        title: "Transactions in PostgreSQL",
        type: "example",
        code: `const { pool } = require('../db/postgres');

// ── Transaction: transfer funds ───────────────
async function transferFunds(fromId, toId, amount) {
  const client = await pool.connect(); // Get dedicated connection
  
  try {
    await client.query('BEGIN');
    
    // Deduct from sender
    const { rows: [from] } = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING *',
      [amount, fromId]
    );
    if (!from) throw new Error('Insufficient funds or account not found');
    
    // Add to receiver
    const { rows: [to] } = await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING *',
      [amount, toId]
    );
    if (!to) throw new Error('Recipient account not found');
    
    // Log the transaction
    await client.query(
      'INSERT INTO transactions (from_id, to_id, amount) VALUES ($1, $2, $3)',
      [fromId, toId, amount]
    );
    
    await client.query('COMMIT');
    return { from, to };
    
  } catch (err) {
    await client.query('ROLLBACK'); // Undo all changes if anything fails
    throw err;
  } finally {
    client.release(); // ALWAYS release back to pool
  }
}

// ── Route using the transaction ───────────────
router.post('/transfer', async (req, res, next) => {
  try {
    const { fromId, toId, amount } = req.body;
    const result = await transferFunds(fromId, toId, amount);
    res.json({ message: 'Transfer successful', ...result });
  } catch (err) { next(err); }
});`
      }
    ],
    challenge: {
      title: "Day 4 Challenge",
      description: "Create a full Products CRUD API connected to PostgreSQL. Create the table with: id, name, price, stock, category, created_at. Implement all 5 routes (list with pagination + search, get one, create, update stock, delete). Handle the unique constraint error if name must be unique.",
      hints: [
        "Use SERIAL PRIMARY KEY for auto-incrementing IDs",
        "ILIKE is case-insensitive LIKE in PostgreSQL",
        "COALESCE($1, column_name) in UPDATE lets you do partial updates",
        "Error code '23505' means unique constraint violation"
      ]
    }
  },

  {
    day: 5,
    title: "SQL Server with Express",
    subtitle: "Microsoft SQL Server integration",
    topic: "database",
    color: "#0ea5e9",
    icon: "🗄️",
    sections: [
      {
        id: "mssql-setup",
        title: "SQL Server Setup & Connection",
        type: "installation",
        steps: [
          { cmd: "npm install mssql", desc: "Install the mssql driver" }
        ],
        code: `// db/mssql.js
const sql = require('mssql');

const config = {
  server: process.env.MSSQL_HOST || 'localhost',
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE || 'myapp',
  port: parseInt(process.env.MSSQL_PORT) || 1433,
  
  options: {
    encrypt: process.env.NODE_ENV === 'production', // Required for Azure
    trustServerCertificate: process.env.NODE_ENV !== 'production',
    enableArithAbort: true
  },
  
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Singleton connection pool
let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅ SQL Server connected');
  }
  return pool;
}

// Helper — returns recordset directly
async function query(queryText, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  
  // Add parameters safely (prevents SQL injection)
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  
  const result = await request.query(queryText);
  return result.recordset; // Array of rows
}

module.exports = { query, getPool, sql };`
      },
      {
        id: "mssql-queries",
        title: "CRUD with SQL Server",
        type: "example",
        code: `// routes/products.js — SQL Server version
const { query, sql, getPool } = require('../db/mssql');

// ── SQL Server Schema ─────────────────────────
// CREATE TABLE Products (
//   Id INT IDENTITY(1,1) PRIMARY KEY,
//   Name NVARCHAR(100) NOT NULL,
//   Price DECIMAL(10,2) NOT NULL,
//   Stock INT DEFAULT 0,
//   Category NVARCHAR(50),
//   CreatedAt DATETIME2 DEFAULT GETUTCDATE()
// );

// ── GET ALL with pagination ───────────────────
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    // SQL Server uses OFFSET...FETCH instead of LIMIT...OFFSET
    const products = await query(
      \`SELECT Id, Name, Price, Stock, Category, CreatedAt
       FROM Products
       WHERE Name LIKE @search OR Category LIKE @search
       ORDER BY CreatedAt DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY\`,
      { search: \`%\${search}%\`, offset, limit }
    );
    
    const [{ total }] = await query(
      'SELECT COUNT(*) AS total FROM Products WHERE Name LIKE @search',
      { search: \`%\${search}%\` }
    );
    
    res.json({ products, pagination: { page, limit, total } });
  } catch (err) { next(err); }
});

// ── POST create product ───────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { name, price, stock = 0, category } = req.body;
    
    // SQL Server returns INSERTED.* for the new row
    const [product] = await query(
      \`INSERT INTO Products (Name, Price, Stock, Category)
       OUTPUT INSERTED.*
       VALUES (@name, @price, @stock, @category)\`,
      { name, price, stock, category }
    );
    
    res.status(201).json(product);
  } catch (err) {
    // SQL Server duplicate key error
    if (err.number === 2627) {
      return res.status(409).json({ error: 'Product name already exists' });
    }
    next(err);
  }
});

// ── Stored Procedure call ─────────────────────
router.post('/bulk-update-prices', async (req, res, next) => {
  try {
    const { category, percentIncrease } = req.body;
    const pool = await getPool();
    const request = pool.request();
    
    request.input('Category', sql.NVarChar, category);
    request.input('PercentIncrease', sql.Decimal(5, 2), percentIncrease);
    request.output('AffectedRows', sql.Int);
    
    // EXEC dbo.UpdateCategoryPrices @Category, @PercentIncrease, @AffectedRows OUTPUT
    await request.execute('dbo.UpdateCategoryPrices');
    
    const affected = request.parameters.AffectedRows.value;
    res.json({ message: \`Updated \${affected} products in \${category}\` });
  } catch (err) { next(err); }
});`
      },
      {
        id: "pg-vs-mssql",
        title: "PostgreSQL vs SQL Server — Side by Side",
        type: "concept",
        content: `Both are production-ready databases. Your choice depends on your environment:`,
        comparison: [
          { feature: "Auto-increment ID", axios: "SERIAL / GENERATED", fetch: "IDENTITY(1,1)" },
          { feature: "String type", axios: "VARCHAR / TEXT", fetch: "VARCHAR / NVARCHAR (unicode)" },
          { feature: "Current time", axios: "NOW() / CURRENT_TIMESTAMP", fetch: "GETUTCDATE() / SYSDATETIME()" },
          { feature: "Pagination", axios: "LIMIT 10 OFFSET 20", fetch: "OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY" },
          { feature: "Case-insensitive search", axios: "ILIKE '%term%'", fetch: "LIKE '%term%' (case-insensitive by default)" },
          { feature: "Returning inserted row", axios: "INSERT...RETURNING *", fetch: "INSERT...OUTPUT INSERTED.*" },
          { feature: "JSON support", axios: "Excellent (jsonb type)", fetch: "Good (JSON functions)" },
          { feature: "Driver", axios: "pg", fetch: "mssql" },
          { feature: "Azure cloud", axios: "Azure Database for PostgreSQL", fetch: "Azure SQL Database" },
          { feature: "Cost", axios: "Free & open source", fetch: "Paid (free Express edition limited)" }
        ]
      }
    ],
    challenge: {
      title: "Day 5 Challenge",
      description: "Refactor your Day 4 Products API to work with both PostgreSQL and SQL Server. Create a database abstraction layer (db/index.js) that exports the same query function regardless of which DB_TYPE env var is set. The routes should not change — only the db layer switches.",
      hints: [
        "DB_TYPE=postgres uses pg, DB_TYPE=mssql uses mssql",
        "Both should export: async function query(text, params) {}",
        "Handle the different parameter styles ($1 vs @param) in the abstraction layer"
      ]
    }
  },

  {
    day: 6,
    title: "React Query — Server State Management",
    subtitle: "Data fetching the modern way",
    topic: "react-query",
    color: "#f59e0b",
    icon: "⚛️",
    sections: [
      {
        id: "what-is-rq",
        title: "What is React Query?",
        type: "concept",
        content: `React Query (TanStack Query) is a **server state management library** for React. It handles all the complexity of fetching, caching, syncing, and updating server data.

**React Query handles:**
- Data fetching and caching
- Background refetching
- Loading and error states
- Pagination and infinite scrolling
- Optimistic updates
- Automatic retry on failure
- Deduplication of requests

**Without React Query** you write this in every component:
\`\`\`
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
useEffect(() => { fetchData() }, []);
\`\`\`

**With React Query** you write:
\`\`\`
const { data, isLoading, error } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
\`\`\`

**React Query does NOT:**
- Make HTTP requests (that's Axios's job)
- Replace useState/useReducer for UI state
- Manage form state
- Handle routing`,
        notFor: "React Query is for server state — data that lives on a server and needs to be synced. For UI state (modal open/closed, form values, selected tab), keep using useState."
      },
      {
        id: "rq-installation",
        title: "Installation & Setup",
        type: "installation",
        steps: [
          { cmd: "npm install @tanstack/react-query", desc: "Install React Query v5" },
          { cmd: "npm install @tanstack/react-query-devtools", desc: "Install DevTools (optional but great)" }
        ],
        code: `// src/main.jsx — Wrap your app with QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 10,     // Keep in cache for 10 minutes after unmount
      retry: 2,                    // Retry failed requests twice
      refetchOnWindowFocus: true,  // Refetch when user tabs back
    },
    mutations: {
      retry: 0  // Don't retry mutations (POST/PUT/DELETE)
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);`
      },
      {
        id: "useQuery",
        title: "useQuery — Fetching Data",
        type: "example",
        code: `import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

// ── Basic useQuery ────────────────────────────
function UsersList() {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['users'],           // Cache key — array format
    queryFn: () => api.get('/users').then(r => r.data),
    staleTime: 1000 * 60 * 2,    // Override global: fresh 2 min
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {isFetching && <span>Refreshing...</span>}
      {data.users.map(u => <UserCard key={u.id} user={u} />)}
    </div>
  );
}

// ── Query with dynamic key (refetches when userId changes) ──
function UserProfile({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['users', userId],   // Unique cache per userId
    queryFn: () => api.get(\`/users/\${userId}\`).then(r => r.data),
    enabled: !!userId,             // Don't run if userId is null/undefined
  });
  
  return user ? <ProfileCard user={user} /> : null;
}

// ── Query with params ─────────────────────────
function UserSearch({ search, page }) {
  const { data, isPlaceholderData } = useQuery({
    queryKey: ['users', { search, page }],
    queryFn: () => api.get('/users', { params: { search, page } }).then(r => r.data),
    placeholderData: keepPreviousData, // Keep old data while fetching new page
  });
  
  return (
    <div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
      {data?.users.map(u => <UserRow key={u.id} user={u} />)}
    </div>
  );
}

// ── Query key factory — reusable, consistent keys ──
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
  detail: (id) => [...userKeys.all, 'detail', id],
};

// Usage:
useQuery({ queryKey: userKeys.detail(userId), queryFn: ... })`
      },
      {
        id: "useMutation",
        title: "useMutation — Modifying Data",
        type: "example",
        code: `import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

function CreateUserForm() {
  const queryClient = useQueryClient();
  
  const createUser = useMutation({
    mutationFn: (newUser) => api.post('/users', newUser).then(r => r.data),
    
    // Called immediately (before server responds) — optimistic update
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] }); // Stop any ongoing fetches
      const previous = queryClient.getQueryData(['users']); // Snapshot old data
      
      // Optimistically add the user
      queryClient.setQueryData(['users'], old => ({
        ...old,
        users: [...(old?.users || []), { ...newUser, id: 'temp-' + Date.now() }]
      }));
      
      return { previous }; // Return for rollback
    },
    
    // Called on error — rollback
    onError: (err, newUser, context) => {
      queryClient.setQueryData(['users'], context.previous);
      alert('Failed to create user: ' + err.message);
    },
    
    // Called on success — refetch to get server-generated ID
    onSuccess: (createdUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert(\`User \${createdUser.name} created!\`);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    createUser.mutate({
      name: fd.get('name'),
      email: fd.get('email')
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
      {createUser.isError && <p>Error: {createUser.error.message}</p>}
    </form>
  );
}`
      },
      {
        id: "prefetch",
        title: "Prefetching & Cache Management",
        type: "example",
        code: `import { useQueryClient } from '@tanstack/react-query';

// ── Prefetch on hover ─────────────────────────
function UserLink({ userId, children }) {
  const queryClient = useQueryClient();
  
  const prefetchUser = () => {
    queryClient.prefetchQuery({
      queryKey: ['users', userId],
      queryFn: () => api.get(\`/users/\${userId}\`).then(r => r.data),
      staleTime: 1000 * 60 // Only prefetch if data is older than 1 min
    });
  };
  
  return (
    <a href={\`/users/\${userId}\`} onMouseEnter={prefetchUser}>
      {children}
    </a>
  );
}

// ── Invalidate after mutation ─────────────────
const deleteUser = useMutation({
  mutationFn: (id) => api.delete(\`/users/\${id}\`),
  onSuccess: () => {
    // Refetch all user queries (lists + detail pages)
    queryClient.invalidateQueries({ queryKey: ['users'] });
    
    // Or invalidate only the list, not individual detail pages:
    queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    
    // Or remove a specific user from cache:
    queryClient.removeQueries({ queryKey: ['users', deletedId] });
  }
});

// ── Manually set cache data ───────────────────
// After creating a user, seed the detail cache:
createUser.onSuccess = (newUser) => {
  queryClient.setQueryData(['users', newUser.id], newUser);
  queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
};

// ── Read cache without triggering fetch ───────
const cachedUser = queryClient.getQueryData(['users', userId]);
const allUsersCache = queryClient.getQueryData(['users', 'list']);`
      }
    ],
    challenge: {
      title: "Day 6 Challenge",
      description: "Rewrite your Day 3 UserManager component using React Query. Replace all useState/useEffect data fetching with useQuery. Replace the POST handler with useMutation including an optimistic update. Add a delete button using another useMutation that invalidates the users list on success.",
      hints: [
        "Install @tanstack/react-query and wrap your app in QueryClientProvider",
        "useQuery key: ['users'], queryFn calls your Axios api",
        "useMutation's onSuccess should call queryClient.invalidateQueries",
        "isPending replaces your manual loading state"
      ]
    }
  },

  {
    day: 7,
    title: "React Query Advanced Patterns",
    subtitle: "Pagination, infinite scroll & optimistic UI",
    topic: "react-query",
    color: "#f59e0b",
    icon: "🔄",
    sections: [
      {
        id: "pagination",
        title: "Pagination with React Query",
        type: "example",
        code: `import { useQuery, keepPreviousData } from '@tanstack/react-query';

function PaginatedProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['products', { page, search }],
    queryFn: () => api.get('/products', { params: { page, limit: 10, search } })
                      .then(r => r.data),
    placeholderData: keepPreviousData, // Show old data while fetching
    staleTime: 30_000
  });
  
  // Prefetch next page
  const queryClient = useQueryClient();
  useEffect(() => {
    if (data?.pagination.page < data?.pagination.pages) {
      queryClient.prefetchQuery({
        queryKey: ['products', { page: page + 1, search }],
        queryFn: () => api.get('/products', { params: { page: page + 1, limit: 10, search } })
                          .then(r => r.data)
      });
    }
  }, [page, data, search]);
  
  return (
    <div>
      <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
             placeholder="Search products..." />
      
      <div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {isLoading ? <Spinner /> : (
          data?.products.map(p => <ProductCard key={p.id} product={p} />)
        )}
      </div>
      
      <div>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
        <span>Page {data?.pagination.page} of {data?.pagination.pages}</span>
        <button onClick={() => setPage(p => p + 1)}
                disabled={isPlaceholderData || page >= (data?.pagination.pages || 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}`
      },
      {
        id: "infinite-scroll",
        title: "Infinite Scroll",
        type: "example",
        code: `import { useInfiniteQuery } from '@tanstack/react-query';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

function InfiniteProductsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['products', 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      api.get('/products', { params: { page: pageParam, limit: 20 } }).then(r => r.data),
    
    getNextPageParam: (lastPage) => {
      // Return undefined to stop fetching
      return lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined;
    },
    
    initialPageParam: 1
  });
  
  // Intersection observer for "load more" trigger
  const { ref: loadMoreRef } = useIntersectionObserver({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  });
  
  const allProducts = data?.pages.flatMap(page => page.products) || [];
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      {allProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      
      {/* Invisible element at bottom — triggers load when visible */}
      <div ref={loadMoreRef} style={{ height: 1 }} />
      
      {isFetchingNextPage && <Spinner />}
      {!hasNextPage && <p>All products loaded ✓</p>}
    </div>
  );
}

// hooks/useIntersectionObserver.js
function useIntersectionObserver({ onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => onChange(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onChange]);
  return { ref };
}`
      },
      {
        id: "dependent-queries",
        title: "Dependent & Parallel Queries",
        type: "example",
        code: `// ── Dependent query: fetch orders after user loads ──
function UserWithOrders({ userId }) {
  // Query 1: fetch user
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => api.get(\`/users/\${userId}\`).then(r => r.data),
  });
  
  // Query 2: fetch orders — only runs after user is loaded
  const { data: orders } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => api.get('/orders', { params: { userId } }).then(r => r.data),
    enabled: !!user?.id  // Dependent on user existing
  });
  
  return (
    <div>
      <h2>{user?.name}</h2>
      <h3>Orders ({orders?.length || 0})</h3>
      {orders?.map(o => <OrderRow key={o.id} order={o} />)}
    </div>
  );
}

// ── Parallel queries ──────────────────────────
function Dashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['stats', 'users'], queryFn: () => api.get('/stats/users').then(r => r.data) },
      { queryKey: ['stats', 'revenue'], queryFn: () => api.get('/stats/revenue').then(r => r.data) },
      { queryKey: ['stats', 'orders'], queryFn: () => api.get('/stats/orders').then(r => r.data) },
    ]
  });
  
  const [usersQuery, revenueQuery, ordersQuery] = results;
  const isLoading = results.some(r => r.isLoading);
  
  if (isLoading) return <DashboardSkeleton />;
  
  return (
    <div className="stats-grid">
      <StatCard label="Users" value={usersQuery.data?.total} />
      <StatCard label="Revenue" value={revenueQuery.data?.total} />
      <StatCard label="Orders" value={ordersQuery.data?.total} />
    </div>
  );
}`
      }
    ],
    challenge: {
      title: "Day 7 Challenge",
      description: "Add pagination to your products list from Day 6. Implement: page controls, a search input that resets to page 1, placeholder data so the UI doesn't flash empty on each page change, and prefetching of the next page on hover/load. Bonus: convert it to infinite scroll using useInfiniteQuery.",
      hints: [
        "import { keepPreviousData } from '@tanstack/react-query'",
        "queryKey must include page and search so cache is separate per combination",
        "useInfiniteQuery's getNextPageParam returns undefined to signal end of data",
        "flatMap the pages to get a flat array of items"
      ]
    }
  },

  {
    day: 8,
    title: "Authentication End-to-End",
    subtitle: "JWT auth with Express + React Query",
    topic: "express",
    color: "#10b981",
    icon: "🔐",
    sections: [
      {
        id: "jwt-backend",
        title: "JWT Authentication — Express Side",
        type: "example",
        code: `// npm install jsonwebtoken bcryptjs
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../db/postgres');

// ── Register ──────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if email exists
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE email = $1', [email]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password (never store plain text!)
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const { rows: [user] } = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, hashedPassword]
    );
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
});

// ── Login ─────────────────────────────────────
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const { rows: [user] } = await query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) { next(err); }
});

// ── Auth Middleware ───────────────────────────
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows: [user] } = await query(
      'SELECT id, name, email, role FROM users WHERE id = $1', [decoded.userId]
    );
    
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ── Role-based access ─────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

app.get('/admin/stats', requireAuth, requireRole('admin'), statsHandler);`
      },
      {
        id: "auth-react",
        title: "Auth Context + React Query",
        type: "example",
        code: `// ── Auth Context ─────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
    retry: false,
    enabled: !!localStorage.getItem('token') // Only fetch if token exists
  });
  
  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials).then(r => r.data),
    onSuccess: ({ user, token }) => {
      localStorage.setItem('token', token);
      queryClient.setQueryData(['auth', 'me'], user);
    }
  });
  
  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      localStorage.removeItem('token');
      queryClient.clear(); // Clear ALL cached data on logout
      window.location.href = '/login';
    }
  });
  
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login: loginMutation.mutate,
      logout: logoutMutation.mutate,
      loginError: loginMutation.error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ── Protected Route ───────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/403" />;
  
  return children;
}

// ── In App.jsx ────────────────────────────────
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
</Routes>`
      }
    ],
    challenge: {
      title: "Day 8 Challenge",
      description: "Build a complete auth flow: Express side with /register, /login, /me routes using JWT + bcryptjs. React side with a login form (useMutation), store the token, and protect a /dashboard route that shows the current user from /me. Include logout that clears the token and React Query cache.",
      hints: [
        "npm install jsonwebtoken bcryptjs on the server",
        "The Axios interceptor from Day 3 already attaches the token — that's the bridge",
        "useQuery for /auth/me, enabled: !!localStorage.getItem('token')",
        "queryClient.clear() removes all cached data on logout"
      ]
    }
  },

  {
    day: 9,
    title: "Full-Stack Integration",
    subtitle: "Connect everything together",
    topic: "express",
    color: "#10b981",
    icon: "🔗",
    sections: [
      {
        id: "file-structure",
        title: "Production-Ready Project Structure",
        type: "concept",
        content: `Here's a battle-tested structure for a full-stack app:`,
        code: `// ── Backend (Express) ─────────────────────────
backend/
├── server.js              ← Entry, middleware setup
├── config/
│   └── index.js           ← All env vars in one place  
├── routes/
│   ├── index.js           ← Mount all routers
│   ├── auth.js
│   ├── users.js
│   └── products.js
├── middleware/
│   ├── auth.js            ← requireAuth, requireRole
│   ├── validate.js        ← Request validation
│   └── upload.js          ← Multer file upload
├── db/
│   ├── postgres.js        ← Pool + query helper
│   ├── mssql.js           ← SQL Server connection
│   └── migrations/        ← SQL files for schema
├── services/              ← Business logic (no req/res)
│   ├── userService.js
│   └── emailService.js
└── utils/
    └── asyncHandler.js

// ── Frontend (React + Vite) ───────────────────
frontend/
├── src/
│   ├── main.jsx           ← QueryClient + Router setup
│   ├── App.jsx
│   ├── lib/
│   │   └── api.js         ← Axios instance
│   ├── hooks/             ← React Query hooks
│   │   ├── useUsers.js
│   │   └── useProducts.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   └── Login.jsx
│   ├── components/        ← Reusable components
│   │   ├── UserCard.jsx
│   │   └── DataTable.jsx
│   └── context/
│       └── AuthContext.jsx`
      },
      {
        id: "custom-hooks",
        title: "Custom React Query Hooks",
        type: "example",
        code: `// hooks/useUsers.js — Encapsulate all user queries
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const userKeys = {
  all: ['users'],
  lists: (filters) => ['users', 'list', filters],
  detail: (id) => ['users', 'detail', id],
};

// ── Data fetching hooks ───────────────────────
export function useUsers(filters = {}) {
  return useQuery({
    queryKey: userKeys.lists(filters),
    queryFn: () => api.get('/users', { params: filters }).then(r => r.data),
    staleTime: 60_000,
    select: (data) => ({
      users: data.users,
      total: data.pagination.total,
      pages: data.pagination.pages
    })
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.get(\`/users/\${id}\`).then(r => r.data),
    enabled: !!id,
  });
}

// ── Mutation hooks ────────────────────────────
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/users', data).then(r => r.data),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
    }
  });
}

export function useUpdateUser(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(\`/users/\${id}\`, data).then(r => r.data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.detail(id), updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(\`/users/\${id}\`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    }
  });
}

// ── In your component: ─────────────────────────
// const { data, isLoading } = useUsers({ page: 1, search: '' });
// const createUser = useCreateUser();
// createUser.mutate({ name: 'Ali', email: 'ali@example.com' });`
      },
      {
        id: "upload-full",
        title: "File Upload — Full Stack",
        type: "example",
        code: `// ── Backend: multer + express ────────────────
// npm install multer
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  res.json({
    url: \`/uploads/\${req.file.filename}\`,
    name: req.file.originalname,
    size: req.file.size
  });
});

// ── Frontend: React + React Query ────────────
function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, onProgress }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress(Math.round((e.loaded / e.total) * 100))
      }).then(r => r.data);
    }
  });
}

function AvatarUploader() {
  const [progress, setProgress] = useState(0);
  const upload = useUploadFile();
  
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    upload.mutate({ file, onProgress: setProgress });
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFile} />
      {upload.isPending && <progress value={progress} max={100} />}
      {upload.data && <img src={upload.data.url} alt="Uploaded" />}
    </div>
  );
}`
      }
    ],
    challenge: {
      title: "Day 9 Challenge",
      description: "Build a mini Product Manager app that combines everything: Express API with auth + products routes + PostgreSQL. React frontend with React Query hooks (useProducts, useCreateProduct, useDeleteProduct), pagination, a protected route, and an Axios interceptor that attaches the JWT token. The entire data flow must be real.",
      hints: [
        "Start with the backend — test all routes in the API Tester simulator first",
        "Create the custom hooks file before writing any component",
        "The Axios interceptor and AuthContext from Day 8 can be reused as-is",
        "useProducts(page, search) should have the page and search in its queryKey"
      ]
    }
  },

  {
    day: 10,
    title: "Production & Deployment",
    subtitle: "Ship your API to the world",
    topic: "express",
    color: "#10b981",
    icon: "🚀",
    sections: [
      {
        id: "production-checklist",
        title: "Production Checklist",
        type: "concept",
        content: `Before deploying, audit your Express app against this checklist:`,
        checklist: [
          { item: "All secrets in environment variables (no hardcoded keys)", critical: true },
          { item: "helmet() middleware for security headers", critical: true },
          { item: "Rate limiting on all routes", critical: true },
          { item: "CORS configured to production domain only", critical: true },
          { item: "Error messages don't leak stack traces in production", critical: true },
          { item: "Database connection uses SSL in production", critical: true },
          { item: "Input validation on all POST/PUT/PATCH routes", critical: true },
          { item: "Passwords hashed with bcrypt (cost factor ≥ 12)", critical: true },
          { item: "morgan logging configured", critical: false },
          { item: "compression() middleware enabled", critical: false },
          { item: "Health check endpoint (GET /health)", critical: false },
          { item: "Graceful shutdown handling", critical: false }
        ]
      },
      {
        id: "deployment",
        title: "Deployment Options",
        type: "concept",
        content: "Options for hosting your Express API:",
        code: `// ── Option 1: Railway (easiest) ───────────────
// 1. Push code to GitHub
// 2. Connect Railway to your repo
// 3. Add env vars in Railway dashboard
// 4. Railway auto-deploys on every push
// Docs: railway.app

// ── Option 2: Render ─────────────────────────
// render.yaml — Infrastructure as code
services:
  - type: web
    name: my-api
    runtime: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: my-postgres
          property: connectionString

databases:
  - name: my-postgres
    databaseName: myapp
    plan: free

// ── Option 3: Docker + any VPS ───────────────
// Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]

// docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on: [db]
  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
volumes:
  pgdata:`
      },
      {
        id: "health-monitoring",
        title: "Health Check & Graceful Shutdown",
        type: "example",
        code: `// ── Health check endpoint ─────────────────────
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1'); // Quick DB ping
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

// ── Graceful shutdown ─────────────────────────
const server = app.listen(PORT, () => {
  console.log(\`🚀 Server on port \${PORT}\`);
});

const shutdown = async (signal) => {
  console.log(\`\${signal} received — shutting down gracefully\`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end(); // Close DB connections
    console.log('Database connections closed');
    process.exit(0);
  });
  
  // Force shutdown after 10s if graceful fails
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  shutdown('UNHANDLED_REJECTION');
});`
      }
    ],
    challenge: {
      title: "Day 10 Final Project",
      description: "Deploy your Product Manager from Day 9 to production. Use Railway or Render for the Express API, provision a real PostgreSQL database, configure all environment variables, and deploy your React frontend to Vercel or GitHub Pages. Your app should be accessible via a public URL with auth working end-to-end.",
      hints: [
        "Railway auto-provisions PostgreSQL — copy the DATABASE_URL to your .env",
        "Set NODE_ENV=production so error messages don't expose stack traces",
        "Update your React VITE_API_URL to point to the deployed Railway URL",
        "Vercel deploys React/Vite apps for free — connect your GitHub repo"
      ]
    }
  }
];

export const topics = {
  express: { label: "Express", color: "#10b981", bg: "#052e16" },
  axios: { label: "Axios", color: "#6366f1", bg: "#1e1b4b" },
  "react-query": { label: "React Query", color: "#f59e0b", bg: "#1c1007" },
  database: { label: "Database", color: "#0ea5e9", bg: "#082f49" }
};
