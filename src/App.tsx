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
    <div className="min-h-screen flex flex-col">
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
    </div>
  )
}

function Page({ children }: { children: ReactNode }) {
  return <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">{children}</div>
}

function Header({ dark, onToggleDark, route }: { dark: boolean; onToggleDark: () => void; route: string }) {
  const isHome = !route
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-paper-100/80 dark:bg-ink-950/80 border-b border-paper-300/60 dark:border-ink-800/60">
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
