import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/great-vibes/latin-400.css'
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'
import '@fontsource/jost/latin-400.css'
import '@fontsource/jost/latin-500.css'

import './styles/base.css'
import './styles/envelope.css'
import './styles/sections.css'

import { wedding } from './config/wedding'
import App from './App'

// Theme colours and fonts come from the wedding config.
const root = document.documentElement
const toKebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
for (const [key, value] of Object.entries(wedding.theme)) root.style.setProperty(`--${toKebab(key)}`, value)
for (const [key, value] of Object.entries(wedding.fonts)) root.style.setProperty(`--font-${key}`, value)
document.title = wedding.site.title

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
