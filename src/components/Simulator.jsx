import { useState, useRef, useEffect } from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const METHOD_COLORS = { GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', PATCH: '#0ea5e9', DELETE: '#ef4444' };

const PRESET_REQUESTS = [
  { label: 'JSONPlaceholder Users', method: 'GET', url: 'https://jsonplaceholder.typicode.com/users', body: '' },
  { label: 'Get User by ID', method: 'GET', url: 'https://jsonplaceholder.typicode.com/users/1', body: '' },
  { label: 'Create User (POST)', method: 'POST', url: 'https://jsonplaceholder.typicode.com/users', body: '{\n  "name": "Ali Hassan",\n  "email": "ali@example.com",\n  "role": "admin"\n}' },
  { label: 'Get Posts', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts?_limit=5', body: '' },
  { label: 'GitHub API', method: 'GET', url: 'https://api.github.com/users/octocat', body: '' },
];

// ── Offline mock data — mirrors JSONPlaceholder responses exactly ─────────
// Injected into the Web Worker so fetch() calls work without any network.
const MOCK_DB = {
  users: [
    { id: 1, name: 'Leanne Graham',  username: 'Bret',    email: 'Sincere@april.biz',       phone: '1-770-736-8031', website: 'hildegard.org',  company: { name: 'Romaguera-Crona' } },
    { id: 2, name: 'Ervin Howell',   username: 'Antonette', email: 'Shanna@melissa.tv',      phone: '010-692-6593',   website: 'anastasia.net',  company: { name: 'Deckow-Crist' } },
    { id: 3, name: 'Clementine Bauch', username: 'Samantha', email: 'Nathan@yesenia.net',    phone: '1-463-123-4447', website: 'ramiro.info',    company: { name: 'Romaguera-Jacobson' } },
    { id: 4, name: 'Patricia Lebsack', username: 'Karianne', email: 'Julianne.OConner@kory.org', phone: '493-170-9623', website: 'kale.biz',   company: { name: 'Robel-Corkery' } },
    { id: 5, name: 'Chelsey Dietrich', username: 'Kamren',  email: 'Lucio_Hettinger@annie.ca', phone: '(254)954-1289', website: 'demarco.info', company: { name: 'Keebler LLC' } },
    { id: 6, name: 'Mrs. Dennis Schulist', username: 'Leopoldo_Corkery', email: 'Karley_Dach@jasper.info', phone: '1-477-935-8478', website: 'ola.org', company: { name: 'Considine-Lockman' } },
    { id: 7, name: 'Kurtis Weissnat', username: 'Elwyn.Skiles', email: 'Telly.Hoeger@billy.biz', phone: '210.067.6132', website: 'elvis.io',  company: { name: 'Johns Group' } },
    { id: 8, name: 'Nicholas Runolfsdottir V', username: 'Maxime_Nienow', email: 'Sherwood@rosamond.me', phone: '586.493.6943', website: 'jacynthe.com', company: { name: 'Abernathy Group' } },
    { id: 9, name: 'Glenna Reichert', username: 'Delphine', email: 'Chaim_McDermott@dana.io', phone: '(775)976-6794', website: 'conrad.com', company: { name: 'Yost and Sons' } },
    { id: 10, name: 'Clementina DuBuque', username: 'Moriah.Stanton', email: 'Rey.Padberg@karina.biz', phone: '024-648-3804', website: 'ambrose.net', company: { name: 'Hoeger LLC' } },
  ],
  posts: [
    { id: 1, userId: 1, title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit', body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto' },
    { id: 2, userId: 1, title: 'qui est esse', body: 'est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis' },
    { id: 3, userId: 1, title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut', body: 'et iusto sed quo iure voluptatem occaecati omnis eligendi aut ad voluptatem doloribus vel accusantium quis pariatur molestiae porro eius odio et labore et velit' },
    { id: 4, userId: 2, title: 'eum et est occaecati', body: 'ullam et saepe reiciendis voluptatem adipisci sit amet autem assumenda provident rerum culpa quis hic commodi nesciunt rem tenetur doloremque ipsam iure quis sunt voluptatem' },
    { id: 5, userId: 2, title: 'nesciunt quas odio', body: 'repudiandae veniam quaerat sunt sed alias aut fugiat sit autem sed est voluptatem omnis possimus esse voluptatibus quis est aut tenetur dolor neque' },
  ],
  todos: [
    { id: 1,  userId: 1, title: 'delectus aut autem',                                completed: false },
    { id: 2,  userId: 1, title: 'quis ut nam facilis et officia qui',                  completed: false },
    { id: 3,  userId: 1, title: 'fugiat veniam minus',                                 completed: false },
    { id: 4,  userId: 1, title: 'et porro tempora',                                    completed: true  },
    { id: 5,  userId: 1, title: 'laboriosam mollitia et enim quasi adipisci quia provident illum', completed: false },
    { id: 6,  userId: 1, title: 'qui ullam ratione quibusdam voluptatem quia omnis',   completed: false },
    { id: 7,  userId: 1, title: 'illo expedita consequatur quia in',                   completed: false },
    { id: 8,  userId: 1, title: 'quo adipisci enim quam ut ab',                        completed: true  },
    { id: 9,  userId: 1, title: 'molestiae perspiciatis ipsa',                         completed: false },
    { id: 10, userId: 1, title: 'illo est ratione doloremque quia maiores aut',         completed: true  },
  ],
};

// Simulates fetch() against jsonplaceholder URLs — returns the same shape offline
function mockFetch(url) {
  const u = String(url);
  const limitMatch  = u.match(/[?&]_limit=(\d+)/);
  const limit       = limitMatch ? parseInt(limitMatch[1]) : Infinity;
  const completedMatch = u.match(/[?&]completed=(true|false)/);

  let data;
  if (u.includes('/users'))  data = MOCK_DB.users.slice(0, limit);
  else if (u.includes('/posts')) data = MOCK_DB.posts.slice(0, limit);
  else if (u.includes('/todos')) {
    let rows = MOCK_DB.todos;
    if (completedMatch) rows = rows.filter(t => t.completed === (completedMatch[1] === 'true'));
    data = rows.slice(0, limit);
  }
  else data = { error: 'mock: endpoint not found', url: u };

  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

const CODE_PRESETS = [
  {
    label: 'Async/Await Fetch',
    code: `// Fetch data with async/await
// Uses a built-in mock — works fully offline
async function fetchUsers() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    const users = await response.json();
    console.log('Users fetched:', users.length);
    users.slice(0, 3).forEach(u => console.log(u.name, '-', u.email));
    return users;
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fetchUsers();`
  },
  {
    label: 'Array Methods',
    code: `// Modern JavaScript array methods
const products = [
  { id: 1, name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
  { id: 2, name: 'Headphones', price: 199, category: 'Electronics', inStock: false },
  { id: 3, name: 'Desk Chair', price: 450, category: 'Furniture', inStock: true },
  { id: 4, name: 'Monitor', price: 700, category: 'Electronics', inStock: true },
];

// Filter in-stock electronics
const available = products
  .filter(p => p.inStock && p.category === 'Electronics')
  .map(p => ({ ...p, priceWithTax: (p.price * 1.1).toFixed(2) }))
  .sort((a, b) => a.price - b.price);

console.log('Available electronics:');
available.forEach(p => console.log(\`  \${p.name}: $\${p.priceWithTax}\`));

// Calculate total
const total = products.reduce((sum, p) => sum + p.price, 0);
console.log('Total inventory value:', '$' + total);`
  },
  {
    label: 'Promise.all',
    code: `// Parallel requests with Promise.all
// Uses a built-in mock — works fully offline
async function fetchDashboard() {
  console.log('Fetching dashboard data...');
  
  const [users, posts, todos] = await Promise.all([
    fetch('https://jsonplaceholder.typicode.com/users?_limit=3').then(r => r.json()),
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=3').then(r => r.json()),
    fetch('https://jsonplaceholder.typicode.com/todos?completed=true&_limit=3').then(r => r.json()),
  ]);
  
  console.log('Users:', users.map(u => u.name).join(', '));
  console.log('Posts:', posts.map(p => p.title.slice(0, 30) + '...').join(' | '));
  console.log('Completed todos:', todos.length);
}

fetchDashboard();`
  },
  {
    label: 'Express Route Pattern',
    code: `// Express-style route handler (simulated)
// In Node.js this would be:
// router.get('/users', asyncHandler(async (req, res) => { ... }));

// Here we simulate the logic:
const db = {
  users: [
    { id: 1, name: 'Layla Hassan', email: 'layla@example.com', role: 'admin' },
    { id: 2, name: 'Omar Karimi', email: 'omar@example.com', role: 'user' },
    { id: 3, name: 'Sara Ahmed', email: 'sara@example.com', role: 'user' },
  ]
};

function simulateExpressRoute(req) {
  const { page = 1, limit = 2, search = '' } = req.query;
  
  let filtered = db.users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const total = filtered.length;
  const offset = (page - 1) * limit;
  const users = filtered.slice(offset, offset + limit);
  
  return {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}

// Simulate: GET /users?page=1&limit=2&search=a
const result = simulateExpressRoute({ query: { page: 1, limit: 2, search: 'a' } });
console.log('Response:', JSON.stringify(result, null, 2));`
  },
  {
    label: 'React Query Pattern',
    code: `// React Query pattern (simulated — shows the concept)
// In a real React app:
// const { data, isLoading } = useQuery({
//   queryKey: ['users'],
//   queryFn: () => api.get('/users').then(r => r.data)
// });

// Simulating what React Query does internally:
class QueryCache {
  constructor() {
    this.cache = new Map();
    this.staleTime = 5000; // 5 seconds
  }
  
  async fetch(key, queryFn) {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.fetchedAt) < this.staleTime) {
      console.log(\`[Cache HIT] "\${key}" — returning cached data\`);
      return cached.data;
    }
    
    console.log(\`[Cache MISS] "\${key}" — fetching...\`);
    const data = await queryFn();
    this.cache.set(key, { data, fetchedAt: now });
    console.log(\`[Cache SET] "\${key}" with \${JSON.stringify(data).length} bytes\`);
    return data;
  }
}

async function main() {
  const cache = new QueryCache();
  // fetch() here uses the built-in mock — works offline
  const fetchUsers = () =>
    fetch('https://jsonplaceholder.typicode.com/users?_limit=3').then(r => r.json());
  
  const r1 = await cache.fetch('users', fetchUsers);
  console.log('First fetch:', r1.length, 'users');
  
  const r2 = await cache.fetch('users', fetchUsers);
  console.log('Second fetch (cached):', r2.length, 'users');
}

main();`
  }
];

const SQL_PRESETS = [
  {
    label: 'Create Users Table',
    dialect: 'postgresql',
    sql: `-- PostgreSQL
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample data
INSERT INTO users (name, email, role) VALUES
  ('Layla Hassan', 'layla@example.com', 'admin'),
  ('Omar Karimi', 'omar@example.com', 'user'),
  ('Sara Ahmed', 'sara@example.com', 'user'),
  ('Khalid Mansoor', 'khalid@example.com', 'user');

-- Query it
SELECT * FROM users ORDER BY created_at DESC;`
  },
  {
    label: 'Pagination Query',
    dialect: 'postgresql',
    sql: `-- PostgreSQL pagination with search
-- Parameters: search='', page=1, limit=2

SELECT id, name, email, role, created_at
FROM users
WHERE name ILIKE '%a%' OR email ILIKE '%a%'
ORDER BY created_at DESC
LIMIT 2 OFFSET 0;

-- Count total matching rows
SELECT COUNT(*) as total
FROM users
WHERE name ILIKE '%a%' OR email ILIKE '%a%';`
  },
  {
    label: 'SQL Server Syntax',
    dialect: 'mssql',
    sql: `-- SQL Server equivalent
CREATE TABLE Users (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL,
  Email NVARCHAR(255) NOT NULL,
  Role NVARCHAR(50) DEFAULT 'user',
  CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- INSERT with OUTPUT (returns inserted row)
INSERT INTO Users (Name, Email, Role)
OUTPUT INSERTED.*
VALUES ('Layla Hassan', 'layla@example.com', 'admin');

-- SQL Server pagination
SELECT Id, Name, Email, Role, CreatedAt
FROM Users
ORDER BY CreatedAt DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;`
  },
  {
    label: 'JOIN Query',
    dialect: 'postgresql',
    sql: `-- JOIN example: users with their orders
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;`
  }
];

// Simulated in-browser SQL engine using a simple evaluator
function runSimulatedSQL(sql) {
  const tables = {
    users: [
      { id: 1, name: 'Layla Hassan', email: 'layla@example.com', role: 'admin', created_at: '2024-01-15' },
      { id: 2, name: 'Omar Karimi', email: 'omar@example.com', role: 'user', created_at: '2024-01-16' },
      { id: 3, name: 'Sara Ahmed', email: 'sara@example.com', role: 'user', created_at: '2024-01-17' },
      { id: 4, name: 'Khalid Mansoor', email: 'khalid@example.com', role: 'user', created_at: '2024-01-18' },
    ],
    orders: [
      { id: 1, user_id: 1, total: 599, status: 'completed', created_at: '2024-02-01' },
      { id: 2, user_id: 2, total: 199, status: 'pending', created_at: '2024-02-02' },
      { id: 3, user_id: 1, total: 299, status: 'completed', created_at: '2024-02-03' },
    ],
    products: [
      { id: 1, name: 'Laptop Pro', price: 999.99, stock: 10, category: 'Electronics' },
      { id: 2, name: 'Headphones X', price: 199.99, stock: 50, category: 'Electronics' },
      { id: 3, name: 'Ergonomic Chair', price: 449.99, stock: 5, category: 'Furniture' },
    ]
  };

  try {
    const clean = sql.replace(/--[^\n]*/g, '').replace(/\s+/g, ' ').trim();
    const statements = clean.split(';').map(s => s.trim()).filter(Boolean);
    const results = [];

    for (const stmt of statements) {
      const upper = stmt.toUpperCase();
      if (upper.startsWith('SELECT')) {
        // Find table name
        const fromMatch = stmt.match(/FROM\s+(\w+)/i);
        if (!fromMatch) { results.push({ type: 'info', message: '✓ Query parsed (no FROM clause)' }); continue; }
        const tableName = fromMatch[1].toLowerCase();
        const table = tables[tableName];
        if (!table) { results.push({ type: 'error', message: `Table "${tableName}" not found. Available: ${Object.keys(tables).join(', ')}` }); continue; }

        let rows = [...table];

        // WHERE
        const whereMatch = stmt.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|OFFSET|GROUP|$)/i);
        if (whereMatch) {
          const cond = whereMatch[1].trim();
          const ilikeMatch = cond.match(/(\w+)\s+ILIKE\s+'%([^%]*)%'/i);
          const eqMatch = cond.match(/(\w+)\s*=\s*'([^']*)'/i);
          const eqNumMatch = cond.match(/(\w+)\s*=\s*(\d+)/i);
          if (ilikeMatch) {
            const [_, col, term] = ilikeMatch;
            rows = rows.filter(r => String(r[col] || '').toLowerCase().includes(term.toLowerCase()));
          } else if (eqMatch) {
            const [_, col, val] = eqMatch;
            rows = rows.filter(r => String(r[col]) === val);
          } else if (eqNumMatch) {
            const [_, col, val] = eqNumMatch;
            rows = rows.filter(r => r[col] == val);
          }
        }

        // LIMIT
        const limitMatch = stmt.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) rows = rows.slice(0, parseInt(limitMatch[1]));

        // Fetch Next (SQL Server style)
        const fetchMatch = stmt.match(/FETCH NEXT\s+(\d+)\s+ROWS ONLY/i);
        if (fetchMatch) rows = rows.slice(0, parseInt(fetchMatch[1]));

        results.push({ type: 'table', rows, rowCount: rows.length });

      } else if (upper.startsWith('INSERT')) {
        results.push({ type: 'success', message: `✓ INSERT executed — 1 row affected (simulated)\n  Note: Data is not persisted in this simulator` });
      } else if (upper.startsWith('CREATE')) {
        results.push({ type: 'success', message: '✓ CREATE TABLE statement parsed successfully\n  Note: Table creation is simulated — use the existing tables (users, orders, products) for SELECT queries' });
      } else if (upper.startsWith('UPDATE')) {
        results.push({ type: 'success', message: '✓ UPDATE executed — row(s) affected (simulated)' });
      } else if (upper.startsWith('DELETE')) {
        results.push({ type: 'success', message: '✓ DELETE executed — row(s) affected (simulated)' });
      } else if (upper.startsWith('DROP')) {
        results.push({ type: 'info', message: 'DROP statement detected — skipped in simulator' });
      } else {
        results.push({ type: 'info', message: `Statement type not fully simulated: ${stmt.slice(0, 40)}...` });
      }
    }
    return results;
  } catch (err) {
    return [{ type: 'error', message: err.message }];
  }
}

const RQ_STATES = [
  { id: 'idle', label: 'Idle', desc: 'No query has been run yet', color: '#6b7280' },
  { id: 'loading', label: 'Loading', desc: 'Fetching data for the first time', color: '#6366f1' },
  { id: 'success', label: 'Success', desc: 'Data returned and cached', color: '#10b981' },
  { id: 'stale', label: 'Stale', desc: 'Data in cache but older than staleTime', color: '#f59e0b' },
  { id: 'fetching', label: 'Refetching', desc: 'Background refetch (data still shown)', color: '#0ea5e9' },
  { id: 'error', label: 'Error', desc: 'Request failed — retry logic active', color: '#ef4444' },
  { id: 'paused', label: 'Paused', desc: 'Offline — waiting for network', color: '#8b5cf6' },
];

export default function Simulator({ onClose, initialTab, currentDay }) {
  const [tab, setTab] = useState(initialTab || 'api');
  const [apiMethod, setApiMethod] = useState('GET');
  const [apiUrl, setApiUrl] = useState('https://jsonplaceholder.typicode.com/users');
  const [apiHeaders, setApiHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [apiBody, setApiBody] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [code, setCode] = useState(CODE_PRESETS[0].code);
  const [codeOutput, setCodeOutput] = useState([]);
  const [codeRunning, setCodeRunning] = useState(false);

  const [sql, setSql] = useState(SQL_PRESETS[0].sql);
  const [sqlResults, setSqlResults] = useState(null);

  const [rqState, setRqState] = useState('idle');
  const [rqStaleTime, setRqStaleTime] = useState(5000);
  const [rqCacheTime, setRqCacheTime] = useState(300000);
  const [rqRetry, setRqRetry] = useState(3);
  const [rqLog, setRqLog] = useState([]);
  const [rqData, setRqData] = useState(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [rqLog]);

  const runApiRequest = async () => {
    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);
    const start = Date.now();
    try {
      let headers = {};
      try { headers = JSON.parse(apiHeaders); } catch {}
      const opts = { method: apiMethod, headers };
      if (['POST', 'PUT', 'PATCH'].includes(apiMethod) && apiBody) {
        opts.body = apiBody;
      }
      const res = await fetch(apiUrl, opts);
      const elapsed = Date.now() - start;
      let body;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) body = await res.json();
      else body = await res.text();

      setApiResponse({
        status: res.status,
        statusText: res.statusText,
        elapsed,
        headers: Object.fromEntries(res.headers.entries()),
        body
      });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setApiLoading(false);
    }
  };

  const runCode = async () => {
    setCodeRunning(true);
    setCodeOutput([{ type: 'info', text: '▶ Running...' }]);

    // ── Transform: auto-await bare top-level function calls ──────────────
    // Problem: user writes `fetchUsers()` (returns a Promise) but our runner
    // wraps code in an async function and awaits IT — not the inner call.
    // Fix: prefix any top-level bare call with `await` so async code resolves.
    // `await` on a non-Promise is a no-op, so sync calls are unaffected.
    function transformCode(src) {
      let depth = 0;
      return src.split('\n').map(line => {
        const trimmed = line.trim();
        // Count net brace change on this line to track block depth
        const open  = (trimmed.match(/{/g) || []).length;
        const close = (trimmed.match(/}/g) || []).length;
        const wasTop = depth === 0;
        depth += open - close;

        // A top-level call: starts with an identifier(chain) + '('
        // and is NOT already a declaration, keyword, comment, or arrow fn
        const isBarCall = wasTop
          && /^[a-zA-Z_$][a-zA-Z0-9_$.]*\s*\(/.test(trimmed)
          && !/^(await|return|const|let|var|\/\/|\/\*|function|async\s+function|class|if|else|for|while|switch|throw|import|export|new\s)/.test(trimmed)
          && !trimmed.includes('=>');

        // Async IIFE opener at top level: (async () => { ... })()
        // Matches both single-line and multi-line — only the opening line needs the prefix
        const isIIFEOpener = wasTop && /^\(async\b/.test(trimmed);

        return (isBarCall || isIIFEOpener) ? line.replace(trimmed, 'await ' + trimmed) : line;
      }).join('\n');
    }

    // ── Run inside a blob-URL Web Worker for isolation ───────────────────
    // This lets us terminate hanging code (infinite loops, stuck awaits).
    // The worker serialises console output and posts it back as messages.
    const TIMEOUT_MS = 10_000;

    const logs = [];

    // Serialise mock data so it can be embedded as a literal in the worker blob
    const mockDbJson = JSON.stringify(MOCK_DB);
    const mockFetchSrc = mockFetch.toString(); // pass the function definition as text

    const workerSrc = `
      // ── Offline mock fetch ─────────────────────────────────────────────
      // Overrides the native fetch() inside this worker so code-runner presets
      // that call jsonplaceholder URLs work fully offline.
      const __MOCK_DB = ${mockDbJson};
      ${mockFetchSrc}
      self.fetch = mockFetch;

      // ── Console capture ────────────────────────────────────────────────
      const __push = (type) => (...args) => {
        const text = args.map(a => {
          if (a === null) return 'null';
          if (a === undefined) return 'undefined';
          if (typeof a === 'object') {
            try { return JSON.stringify(a, null, 2); } catch { return String(a); }
          }
          return String(a);
        }).join(' ');
        self.postMessage({ type: 'log', entry: { type, text } });
      };
      self.console = {
        log:   __push('log'),
        error: __push('error'),
        warn:  __push('warn'),
        info:  __push('log'),
        dir:   __push('log'),
        table: __push('log'),
      };

      self.onmessage = async (e) => {
        try {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const fn = new AsyncFunction(e.data);
          await fn();
          self.postMessage({ type: 'done' });
        } catch (err) {
          self.postMessage({ type: 'error', text: 'Runtime Error: ' + err.message });
          self.postMessage({ type: 'done' });
        }
      };
    `;

    let worker;
    let timer;

    try {
      const blob = new Blob([workerSrc], { type: 'application/javascript' });
      const url  = URL.createObjectURL(blob);
      worker = new Worker(url);
      URL.revokeObjectURL(url);

      await new Promise((resolve) => {
        // Timeout guard — kills hanging workers (infinite loops etc.)
        timer = setTimeout(() => {
          logs.push({ type: 'error', text: `⏱ Execution timed out after ${TIMEOUT_MS / 1000}s.\nTip: avoid infinite loops. Use a counter-guarded while loop instead.` });
          resolve();
        }, TIMEOUT_MS);

        worker.onmessage = (e) => {
          const { type, entry, text } = e.data;
          if (type === 'log')   { logs.push(entry); }
          if (type === 'error') { logs.push({ type: 'error', text }); }
          if (type === 'done')  { resolve(); }
        };

        worker.onerror = (e) => {
          logs.push({ type: 'error', text: 'Worker error: ' + (e.message || 'unknown') });
          resolve();
        };

        // Send transformed code to worker
        worker.postMessage(transformCode(code));
      });

    } catch (err) {
      // Fallback: some environments block blob Workers (e.g. strict CSP).
      // Fall back to AsyncFunction in the main thread with console patching.
      logs.push({ type: 'warn', text: '⚠ Running in main thread (Web Worker unavailable)' });
      const origLog   = console.log;
      const origError = console.error;
      const origWarn  = console.warn;
      const origFetch = window.fetch;
      const push = (type) => (...args) => logs.push({
        type,
        text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')
      });
      console.log   = push('log');
      console.error = push('error');
      console.warn  = push('warn');
      window.fetch  = mockFetch; // offline mock in fallback path too
      try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        await Promise.race([
          new AsyncFunction(transformCode(code))(),
          new Promise((_, rej) => setTimeout(() => rej(new Error(`Timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS))
        ]);
      } catch (e) {
        logs.push({ type: 'error', text: 'Runtime Error: ' + e.message });
      } finally {
        console.log   = origLog;
        console.error = origError;
        console.warn  = origWarn;
        window.fetch  = origFetch;
      }
    } finally {
      clearTimeout(timer);
      if (worker) worker.terminate();
      // Filter the "Running..." placeholder and set real output
      setCodeOutput(logs.length ? logs : [{ type: 'log', text: '(no output)' }]);
      setCodeRunning(false);
    }
  };

  const runSQL = () => {
    const results = runSimulatedSQL(sql);
    setSqlResults(results);
  };

  const addRqLog = (msg, type = 'info') => {
    setRqLog(prev => [...prev.slice(-50), { time: new Date().toLocaleTimeString(), msg, type }]);
  };

  const simulateRqAction = async (action) => {
    if (action === 'fetch') {
      setRqState('loading');
      addRqLog('useQuery triggered — fetching data...', 'fetch');
      await new Promise(r => setTimeout(r, 1200));
      setRqState('success');
      const data = [{ id: 1, name: 'Layla Hassan' }, { id: 2, name: 'Omar Karimi' }];
      setRqData(data);
      addRqLog(`✓ Success — ${data.length} records cached (staleTime: ${rqStaleTime}ms)`, 'success');
      setTimeout(() => {
        if (rqStaleTime < 60000) {
          setRqState('stale');
          addRqLog(`Data is now stale after ${rqStaleTime}ms`, 'warn');
        }
      }, rqStaleTime);
    } else if (action === 'refetch') {
      setRqState('fetching');
      addRqLog('Background refetch triggered (old data still shown)...', 'fetch');
      await new Promise(r => setTimeout(r, 800));
      setRqState('success');
      addRqLog('✓ Refetch complete — cache updated', 'success');
    } else if (action === 'error') {
      setRqState('loading');
      addRqLog('useQuery triggered — fetching...', 'fetch');
      await new Promise(r => setTimeout(r, 600));
      setRqState('error');
      setRqData(null);
      addRqLog(`✗ Request failed — will retry (${rqRetry} retries configured)`, 'error');
      for (let i = 1; i <= Math.min(rqRetry, 2); i++) {
        await new Promise(r => setTimeout(r, 800));
        addRqLog(`Retry attempt ${i}/${rqRetry}...`, 'warn');
      }
      addRqLog('All retries exhausted — query in error state', 'error');
    } else if (action === 'invalidate') {
      addRqLog('queryClient.invalidateQueries({ queryKey: [\'users\'] }) called', 'action');
      setRqState('fetching');
      await new Promise(r => setTimeout(r, 900));
      setRqState('success');
      addRqLog('✓ Invalidation complete — fresh data fetched', 'success');
    } else if (action === 'reset') {
      setRqState('idle');
      setRqData(null);
      setRqLog([]);
    }
  };

  const currentStateInfo = RQ_STATES.find(s => s.id === rqState);

  return (
    <div className="simulator-overlay">
      <div className="simulator-panel">
        <div className="sim-header">
          <div className="sim-tabs">
            {[
              { id: 'api', label: '🌐 API Tester' },
              { id: 'code', label: '💻 Code Runner' },
              { id: 'sql', label: '🗄️ SQL Runner' },
              { id: 'rq', label: '⚛️ React Query' },
            ].map(t => (
              <button key={t.id} className={`sim-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <button className="sim-close" onClick={onClose}>✕</button>
        </div>

        <div className="sim-body">
          {/* ── API TESTER ── */}
          {tab === 'api' && (
            <div className="sim-section">
              <div className="api-presets">
                {PRESET_REQUESTS.map((p, i) => (
                  <button key={i} className="preset-btn" onClick={() => { setApiMethod(p.method); setApiUrl(p.url); setApiBody(p.body); }}>
                    <span className="preset-method" style={{ color: METHOD_COLORS[p.method] }}>{p.method}</span>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="api-request-bar">
                <select className="method-select" value={apiMethod} onChange={e => setApiMethod(e.target.value)}
                  style={{ color: METHOD_COLORS[apiMethod] }}>
                  {METHODS.map(m => <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>{m}</option>)}
                </select>
                <input className="url-input" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://..." />
                <button className="send-btn" onClick={runApiRequest} disabled={apiLoading}>
                  {apiLoading ? '⏳ Sending...' : '▶ Send'}
                </button>
              </div>
              <div className="api-options">
                <div className="api-option-col">
                  <label className="option-label">Headers (JSON)</label>
                  <textarea className="sim-textarea sm" value={apiHeaders} onChange={e => setApiHeaders(e.target.value)} rows={4} />
                </div>
                {['POST', 'PUT', 'PATCH'].includes(apiMethod) && (
                  <div className="api-option-col">
                    <label className="option-label">Body (JSON)</label>
                    <textarea className="sim-textarea sm" value={apiBody} onChange={e => setApiBody(e.target.value)} placeholder='{ "key": "value" }' rows={4} />
                  </div>
                )}
              </div>
              {apiError && (
                <div className="api-error">
                  <span>⚠️ Network Error:</span> {apiError}
                </div>
              )}
              {apiResponse && (
                <div className="api-response">
                  <div className="response-meta">
                    <span className={`status-badge ${apiResponse.status < 300 ? 'ok' : 'err'}`}>
                      {apiResponse.status} {apiResponse.statusText}
                    </span>
                    <span className="response-time">{apiResponse.elapsed}ms</span>
                    <span className="response-size">{JSON.stringify(apiResponse.body).length} bytes</span>
                  </div>
                  <pre className="response-body">{JSON.stringify(apiResponse.body, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* ── CODE RUNNER ── */}
          {tab === 'code' && (
            <div className="sim-section">
              <div className="api-presets">
                {CODE_PRESETS.map((p, i) => (
                  <button key={i} className="preset-btn" onClick={() => { setCode(p.code); setCodeOutput([]); }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="code-run-layout">
                <div className="code-editor-wrap">
                  <div className="editor-header">
                    <span>JavaScript</span>
                    <button className="send-btn" onClick={runCode} disabled={codeRunning}>
                      {codeRunning ? '⏳ Running...' : '▶ Run'}
                    </button>
                  </div>
                  <textarea
                    className="code-editor-textarea"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    spellCheck={false}
                    rows={20}
                  />
                </div>
                <div className="code-output-wrap">
                  <div className="editor-header">
                    <span>Output (console)</span>
                    <button className="clear-btn" onClick={() => setCodeOutput([])}>Clear</button>
                  </div>
                  <div className="code-output">
                    {(!codeOutput || codeOutput.length === 0) && (
                      <span className="output-placeholder">Run code to see output…</span>
                    )}
                    {codeOutput && codeOutput.map((line, i) => (
                      <div key={i} className={`output-line ${line.type}`}>
                        <span className="output-type">
                          {line.type === 'error' ? '✗' : line.type === 'warn' ? '⚠' : line.type === 'info' ? 'ℹ' : '›'}
                        </span>
                        <pre>{line.text}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SQL RUNNER ── */}
          {tab === 'sql' && (
            <div className="sim-section">
              <div className="api-presets">
                {SQL_PRESETS.map((p, i) => (
                  <button key={i} className="preset-btn" onClick={() => { setSql(p.sql); setSqlResults(null); }}>
                    <span className="preset-method" style={{ color: p.dialect === 'postgresql' ? '#0ea5e9' : '#e74c3c' }}>
                      {p.dialect === 'postgresql' ? 'PG' : 'MSSQL'}
                    </span>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="sql-info-bar">
                <span>📋 Available tables: <code>users</code>, <code>orders</code>, <code>products</code></span>
              </div>
              <div className="code-run-layout">
                <div className="code-editor-wrap">
                  <div className="editor-header">
                    <span>SQL Query</span>
                    <button className="send-btn" onClick={runSQL}>▶ Run</button>
                  </div>
                  <textarea className="code-editor-textarea sql" value={sql} onChange={e => setSql(e.target.value)} spellCheck={false} rows={18} />
                </div>
                <div className="code-output-wrap">
                  <div className="editor-header"><span>Results</span></div>
                  <div className="sql-results">
                    {!sqlResults && <span className="output-placeholder">Run a SQL query to see results...</span>}
                    {sqlResults && sqlResults.map((result, i) => (
                      <div key={i} className="sql-result-item">
                        {result.type === 'table' && (
                          <>
                            <div className="sql-result-meta">{result.rowCount} row{result.rowCount !== 1 ? 's' : ''} returned</div>
                            {result.rows.length > 0 && (
                              <div className="sql-table-wrap">
                                <table className="sql-result-table">
                                  <thead>
                                    <tr>{Object.keys(result.rows[0]).map(k => <th key={k}>{k}</th>)}</tr>
                                  </thead>
                                  <tbody>
                                    {result.rows.map((row, ri) => (
                                      <tr key={ri}>
                                        {Object.values(row).map((val, vi) => (
                                          <td key={vi}>{String(val)}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </>
                        )}
                        {result.type === 'success' && <div className="sql-msg success">✓ {result.message}</div>}
                        {result.type === 'error' && <div className="sql-msg error">✗ {result.message}</div>}
                        {result.type === 'info' && <div className="sql-msg info">ℹ {result.message}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── REACT QUERY VISUALIZER ── */}
          {tab === 'rq' && (
            <div className="sim-section rq-section">
              <div className="rq-layout">
                <div className="rq-left">
                  <div className="rq-state-display" style={{ borderColor: currentStateInfo?.color }}>
                    <div className="rq-state-dot" style={{ background: currentStateInfo?.color }} />
                    <div>
                      <div className="rq-state-label" style={{ color: currentStateInfo?.color }}>{currentStateInfo?.label}</div>
                      <div className="rq-state-desc">{currentStateInfo?.desc}</div>
                    </div>
                  </div>

                  {rqData && (
                    <div className="rq-data-box">
                      <p className="rq-data-label">Cached Data</p>
                      <pre className="rq-data">{JSON.stringify(rqData, null, 2)}</pre>
                    </div>
                  )}

                  <div className="rq-config">
                    <p className="rq-config-label">Configuration</p>
                    <label>staleTime: {rqStaleTime >= 60000 ? 'Infinity' : rqStaleTime + 'ms'}
                      <input type="range" min="1000" max="60000" step="1000" value={rqStaleTime} onChange={e => setRqStaleTime(Number(e.target.value))} />
                    </label>
                    <label>retry: {rqRetry}
                      <input type="range" min="0" max="5" step="1" value={rqRetry} onChange={e => setRqRetry(Number(e.target.value))} />
                    </label>
                  </div>

                  <div className="rq-actions">
                    <button className="rq-action-btn fetch" onClick={() => simulateRqAction('fetch')}>▶ useQuery (fetch)</button>
                    <button className="rq-action-btn refetch" onClick={() => simulateRqAction('refetch')}>↺ Refetch</button>
                    <button className="rq-action-btn invalidate" onClick={() => simulateRqAction('invalidate')}>🗑 Invalidate</button>
                    <button className="rq-action-btn error" onClick={() => simulateRqAction('error')}>✗ Simulate Error</button>
                    <button className="rq-action-btn reset" onClick={() => simulateRqAction('reset')}>Reset</button>
                  </div>

                  <div className="rq-states-map">
                    <p className="rq-config-label">Query Lifecycle</p>
                    {RQ_STATES.map(s => (
                      <div key={s.id} className={`rq-state-row ${rqState === s.id ? 'current' : ''}`} style={{ '--sc': s.color }}>
                        <span className="rq-state-dot sm" style={{ background: s.color }} />
                        <span className="rq-state-name">{s.label}</span>
                        <span className="rq-state-info">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rq-right">
                  <div className="rq-log-header">
                    <span>Event Log</span>
                    <button className="clear-btn" onClick={() => setRqLog([])}>Clear</button>
                  </div>
                  <div className="rq-log" ref={logRef}>
                    {rqLog.length === 0 && <span className="output-placeholder">Trigger an action to see the log...</span>}
                    {rqLog.map((entry, i) => (
                      <div key={i} className={`rq-log-entry ${entry.type}`}>
                        <span className="rq-log-time">{entry.time}</span>
                        <span className="rq-log-msg">{entry.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
