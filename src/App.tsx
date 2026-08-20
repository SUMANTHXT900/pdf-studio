import { useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
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

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brass-500 via-brass-400 to-forest-500 origin-left z-[60] pointer-events-none"
    />
  )
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
      <ScrollProgress />
      <Header dark={dark} onToggleDark={() => setDark(!dark)} route={route} />
      <AnimatePresence mode="wait">
        <motion.main
          key={route}
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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
  return <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">{children}</div>
}

function Header({ dark, onToggleDark, route }: { dark: boolean; onToggleDark: () => void; route: string }) {
  const isHome = !route
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header
      className={
        'sticky top-0 z-40 border-b transition-all duration-300 ' +
        (scrolled
          ? 'glass bg-paper-100/85 dark:bg-ink-950/85 border-paper-300/70 dark:border-ink-800/70 shadow-soft backdrop-blur-xl'
          : 'glass bg-paper-100/70 dark:bg-ink-950/70 border-paper-300/50 dark:border-ink-800/50 backdrop-blur-xl')
      }
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <a href="#/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 6, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-9 h-9 rounded-xl bg-ink-900 dark:bg-paper-100 flex items-center justify-center shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="2" width="4" height="16" rx="1" className="fill-brass-400" />
              <rect x="8" y="2" width="4" height="16" rx="1" className="fill-brass-300" />
              <rect x="13.5" y="2" width="4" height="16" rx="1" className="fill-brass-500" />
            </svg>
          </motion.div>
          <div className="hidden sm:block">
            <span className="font-display text-[17px] font-semibold leading-none tracking-tight">Folio</span>
            <span className="block text-[11px] text-ink-400 dark:text-ink-300 leading-none mt-0.5 tracking-wide">private PDF tools</span>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {!isHome && (
            <motion.a
              href="#/"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 dark:text-ink-300 dark:hover:text-paper-100 transition-colors px-3 py-1.5 rounded-full border border-transparent hover:border-paper-300 dark:hover:border-ink-700 hover:bg-paper-50 dark:hover:bg-ink-800"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All tools
            </motion.a>
          )}
          <motion.button
            onClick={onToggleDark}
            aria-label="Toggle theme"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94, rotate: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="w-9 h-9 rounded-full border border-paper-300 dark:border-ink-700 bg-paper-50/60 dark:bg-ink-800/60 backdrop-blur flex items-center justify-center hover:bg-paper-200 dark:hover:bg-ink-700 hover:border-brass-400/40 transition-colors shadow-sm"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? 'sun' : 'moon'}
                initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {dark ? <SunIcon /> : <MoonIcon />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-paper-200/70 dark:border-ink-800/70 py-6 mt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-400 dark:text-ink-300">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-forest-500/10 dark:bg-forest-500/15 border border-forest-500/15 flex items-center justify-center text-forest-600 dark:text-forest-400">
            <LockIcon />
          </span>
          <span>100% in-browser — files never leave your device.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#/about" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">About</a>
          <a href="https://www.linkedin.com/in/sai-sumanth-giduthuri-0a9956329/" target="_blank" rel="noopener noreferrer" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">LinkedIn</a>
          <a href="https://github.com/SUMANTHXT900" target="_blank" rel="noopener noreferrer" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">GitHub</a>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 px-2.5 py-1 font-mono text-[11px] text-ink-400 dark:text-ink-300">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" /> v{__FOLIO_VERSION__}
          </span>
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
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 px-2 py-1">
        {TOOL_LIST.map((t) => {
          const isActive = active === t.id
          return (
            <a
              key={t.id}
              href={`#/${t.id}`}
              className="relative flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium"
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-active"
                  className="absolute inset-0 rounded-2xl bg-brass-400/12 border border-brass-400/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={
                  'relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ' +
                  (isActive ? 'bg-brass-400 text-white shadow-sm' : 'text-ink-400 dark:text-ink-300')
                }
              >
                {ICONS_MOBILE[t.id]}
              </span>
              <span className={isActive ? 'relative text-brass-600 dark:text-brass-400 font-semibold' : 'relative text-ink-400 dark:text-ink-300'}>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h12M3 18h6" /></svg>
  ),
  split: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /></svg>
  ),
  rearrange: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l6-5-6 5zm0 0 6 5M21 16l-6 5 6-5zm0 0-6-5" /></svg>
  ),
  rotate: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.75 1 6.4 2.6L21 8" /><path d="M21 3v5h-5" /></svg>
  ),
  compress: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M8 3l6 6m0 0V3H8m0 0v6h6" /></svg>
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
