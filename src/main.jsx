import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Local font bundles — latin subset only, no network request, works fully offline
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/syne/latin-400.css'
import '@fontsource/syne/latin-500.css'
import '@fontsource/syne/latin-600.css'
import '@fontsource/syne/latin-700.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
