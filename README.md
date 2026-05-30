# BackendCraft — 10-Day Backend Course

A comprehensive, interactive 10-day learning app for Express, Axios, React Query, PostgreSQL and SQL Server — built with React + Vite, installable as a PWA.

## 🗓️ Curriculum

| Day | Topic | Focus |
|-----|-------|-------|
| 1 | Express | Node.js server, routing, middleware |
| 2 | Express | CORS, error handling, env config, rate limiting |
| 3 | Axios | HTTP client, interceptors, error handling, file uploads |
| 4 | PostgreSQL | pg driver, CRUD, transactions, pagination |
| 5 | SQL Server | mssql driver, stored procedures, PG vs MSSQL comparison |
| 6 | React Query | useQuery, useMutation, optimistic updates, cache |
| 7 | React Query | Pagination, infinite scroll, dependent queries |
| 8 | Auth | JWT, bcrypt, Express auth middleware, React auth context |
| 9 | Integration | Full-stack patterns, custom hooks, file uploads |
| 10 | Production | Deployment, Docker, health checks, graceful shutdown |

## ✨ Features

- 📖 **Concept explanations** — what each tool is, what it's NOT for
- ⚙️ **Installation guides** — step-by-step with copyable commands
- 💻 **Live code examples** — copyable, with syntax highlighting
- 🌐 **API Tester** — Postman-like, test any HTTP endpoint
- 🖥️ **Code Runner** — run JavaScript in the browser, see console output
- 🗄️ **SQL Runner** — write SQL against simulated tables (users, orders, products)
- ⚛️ **React Query Visualizer** — see query states, caching, and invalidation live
- ✓ **Progress tracking** — mark sections and days complete (saved in localStorage)
- 📱 **PWA** — installable from browser, works offline after first load

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Deploy to GitHub Pages

### Automatic (recommended) — works with ANY repo name

1. Push this repo to GitHub (name it anything you like)
2. Go to **Settings → Pages → Source** → set to **GitHub Actions**
3. Push any commit to `main` — the workflow fires automatically
4. Your app is live at: `https://<your-username>.github.io/<your-repo-name>/`

The workflow extracts the repo name from `$GITHUB_REPOSITORY` and passes it as
`VITE_BASE_PATH` at build time. Vite and the PWA plugin pick it up automatically —
no hardcoded paths anywhere in the source code.

### Manual build

```bash
# Local dev (runs at http://localhost:5173/ with no sub-path)
npm run dev

# Production build for a sub-path (e.g. if repo is called "my-course")
VITE_BASE_PATH=/my-course/ npm run build

# Production build for a root domain (Vercel, Netlify, etc.)
npm run build
```

## 📱 Install as PWA

After deploying, visit the URL in Chrome/Edge/Safari:
- **Desktop**: Click the install icon in the address bar
- **Mobile**: Tap "Add to Home Screen" in the browser menu
- Works offline after first load (all assets cached by Workbox)

## 🗂️ Project Structure

```
backend-craft-course/
├── .github/workflows/
│   └── deploy.yml          ← GitHub Actions deploy workflow
├── public/
│   ├── icon.svg
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx     ← Day navigation
│   │   ├── DayView.jsx     ← Renders sections for each day
│   │   ├── CodeBlock.jsx   ← Syntax highlighted code
│   │   ├── InstallGuide.jsx← Installation steps component
│   │   └── Simulator.jsx   ← All 4 simulator tabs
│   ├── data/
│   │   └── curriculum.js   ← All 10 days of content
│   ├── styles/
│   │   └── app.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js          ← Vite + PWA config
└── package.json
```

## 🧩 Adding More Content

The entire curriculum lives in `src/data/curriculum.js`. Each day follows this structure:

```js
{
  day: 11,
  title: "My New Day",
  subtitle: "Short description",
  topic: "express",           // express | axios | react-query | database
  color: "#10b981",
  icon: "🔥",
  sections: [
    {
      id: "unique-id",
      title: "Section Title",
      type: "concept",        // concept | installation | example
      content: "Markdown-ish text with **bold** and `code`",
      code: `// JavaScript code here`,
      notFor: "What this tool is NOT for",
    }
  ],
  challenge: {
    title: "Day 11 Challenge",
    description: "What to build",
    hints: ["Hint 1", "Hint 2"]
  }
}
```

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 5
- **PWA**: vite-plugin-pwa + Workbox
- **Routing**: React Router v6
- **Fonts**: Syne (display) + Inter (body) + JetBrains Mono (code)
- **Deployment**: GitHub Actions → GitHub Pages
- **No UI library** — all CSS custom-built
