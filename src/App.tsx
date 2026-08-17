import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './Home'
import MergeTool from './tools/MergeTool'
import SplitTool from './tools/SplitTool'
import RearrangeTool from './tools/RearrangeTool'
import RotateTool from './tools/RotateTool'
import CompressTool from './tools/CompressTool'
import About from './About'

export type ToolId =
  | 'merge'
  | 'split'
  | 'rearrange'
  | 'rotate'
  | 'compress'

const TOOLS: Record<ToolId, () => ReactNode> = {
  merge: MergeTool,
  split: SplitTool,
  rearrange: RearrangeTool,
  rotate: RotateTool,
  compress: CompressTool,
}

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash.replace(/^#\/?/, '').replace(/\/$/, '')
}

export default function App() {
  const route = useHashRoute()
  const id = route as ToolId
  const Tool = TOOLS[id] || null
  const isAbout = route === 'about'
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('folio-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    localStorage.setItem('folio-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen flex flex-col pb-24 sm:pb-0">
      <Header dark={dark} onToggleDark={() => setDark(!dark)} route={route} />
      <AnimatePresence mode="wait">
        <motion.main
          key={route}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1"
        >
          <Page>
            {Tool ? <Tool /> : isAbout ? <About /> : <Home />}
          </Page>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <MobileNav route={route} />
    </div>
  )
}

function Page({ children }: { children: ReactNode }) {
  return <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">{children}</div>
}

function Header({ dark, onToggleDark, route }: { dark: boolean; onToggleDark: () => void; route: string }) {
  const isHome = !route
  return (
    <header className="sticky top-0 z-40 glass bg-paper-100/75 dark:bg-ink-950/75 border-b border-paper-300/60 dark:border-ink-800/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <a href="#/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-ink-900 dark:bg-paper-100 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="2" width="4" height="16" rx="1" className="fill-brass-400" />
              <rect x="8" y="2" width="4" height="16" rx="1" className="fill-brass-300" />
              <rect x="13.5" y="2" width="4" height="16" rx="1" className="fill-brass-500" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-lg font-semibold leading-none tracking-tight">Folio</span>
            <span className="block text-[11px] text-ink-400 dark:text-ink-300 leading-none mt-0.5">private PDF tools</span>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {!isHome && (
            <a
              href="#/"
              className="text-sm text-ink-400 hover:text-ink-900 dark:text-ink-300 dark:hover:text-paper-100 transition-colors px-2"
            >
              All tools
            </a>
          )}
          <button
            onClick={onToggleDark}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full border border-paper-300 dark:border-ink-700 flex items-center justify-center hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-paper-200 dark:border-ink-800 py-6 mt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-400 dark:text-ink-300">
        <div className="flex items-center gap-1.5">
          <LockIcon />
          <span>100% in-browser — files never leave your device.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#/about" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">About</a>
          <a href="https://www.linkedin.com/in/sai-sumanth-giduthuri-0a9956329/" target="_blank" rel="noopener noreferrer" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">LinkedIn</a>
          <a href="https://github.com/SUMANTHXT900" target="_blank" rel="noopener noreferrer" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">GitHub</a>
          <span className="font-mono text-[11px] text-ink-300 dark:text-ink-500">v{__FOLIO_VERSION__}</span>
        </div>
      </div>
    </footer>
  )
}

export const TOOL_LIST: { id: ToolId; name: string; tagline: string }[] = [
  { id: 'merge', name: 'Merge', tagline: 'Combine PDFs into one' },
  { id: 'split', name: 'Split', tagline: 'Extract pages or break apart' },
  { id: 'rearrange', name: 'Rearrange', tagline: 'Reorder pages' },
  { id: 'rotate', name: 'Rotate', tagline: 'Fix page orientation' },
  { id: 'compress', name: 'Compress', tagline: 'Shrink file size' },
]

function MobileNav({ route }: { route: string }) {
  const active = route as ToolId
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 glass bg-paper-100/90 dark:bg-ink-950/90 border-t border-paper-300/60 dark:border-ink-800/60 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {TOOL_LIST.map((t) => {
          const isActive = active === t.id
          return (
            <a
              key={t.id}
              href={`#/${t.id}`}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors"
            >
              <span
                className={
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-colors ' +
                  (isActive
                    ? 'bg-brass-400/15 text-brass-500'
                    : 'text-ink-400 dark:text-ink-300')
                }
              >
                {ICONS_MOBILE[t.id]}
              </span>
              <span className={isActive ? 'text-brass-600 dark:text-brass-400' : 'text-ink-400 dark:text-ink-300'}>
                {t.name}
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

const ICONS_MOBILE: Record<ToolId, React.ReactNode> = {
  merge: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h12M3 18h6" /></svg>
  ),
  split: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /></svg>
  ),
  rearrange: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l6-5-6 5zm0 0 6 5M21 16l-6 5 6-5zm0 0-6-5" /></svg>
  ),
  rotate: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.75 1 6.4 2.6L21 8" /><path d="M21 3v5h-5" /></svg>
  ),
  compress: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M8 3l6 6m0 0V3H8m0 0v6h6" /></svg>
  ),
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
