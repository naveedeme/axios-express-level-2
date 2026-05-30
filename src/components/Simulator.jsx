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

const CODE_PRESETS = [
  {
    label: 'Async/Await Fetch',
    code: `// Fetch data with async/await
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

// Simulate: GET /users?page=1&limit=2&search=
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
  const [codeOutput, setCodeOutput] = useState('');
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
    setCodeOutput('');
    const logs = [];
    const origLog = console.log;
    const origError = console.error;
    const origWarn = console.warn;

    console.log = (...args) => logs.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
    console.error = (...args) => logs.push({ type: 'error', text: args.map(a => String(a)).join(' ') });
    console.warn = (...args) => logs.push({ type: 'warn', text: args.map(a => String(a)).join(' ') });

    try {
      const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
      const fn = new AsyncFunction(code);
      await fn();
    } catch (err) {
      logs.push({ type: 'error', text: `Runtime Error: ${err.message}` });
    } finally {
      console.log = origLog;
      console.error = origError;
      console.warn = origWarn;
      setCodeOutput(logs);
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
                  <button key={i} className="preset-btn" onClick={() => { setCode(p.code); setCodeOutput(''); }}>
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
                    <button className="clear-btn" onClick={() => setCodeOutput('')}>Clear</button>
                  </div>
                  <div className="code-output">
                    {!codeOutput && <span className="output-placeholder">Run code to see output...</span>}
                    {codeOutput && codeOutput.map((line, i) => (
                      <div key={i} className={`output-line ${line.type}`}>
                        <span className="output-type">
                          {line.type === 'error' ? '✗' : line.type === 'warn' ? '⚠' : '›'}
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
