import { motion } from 'framer-motion'
import { TOOL_LIST } from './App'

const ICONS: Record<string, React.ReactNode> = {
  merge: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h12M3 18h6" />
    </svg>
  ),
  split: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
    </svg>
  ),
  rearrange: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l6-5-6 5zm0 0 6 5M21 16l-6 5 6-5zm0 0-6-5" />
    </svg>
  ),
  rotate: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.75 1 6.4 2.6L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  ),
  compress: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M8 3l6 6m0 0V3H8m0 0v6h6" transform="translate(0 0)" />
    </svg>
  ),
}

export default function Home() {
  return (
    <div className="py-8 sm:py-12">
      <section className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 px-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-paper-300 dark:border-ink-700 bg-paper-50/70 dark:bg-ink-800/60 px-3.5 py-1.5 text-xs font-medium text-brass-600 dark:text-brass-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
            Every tool, zero uploads
          </span>

          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-ink-900 dark:text-paper-100 leading-[1.05]">
            PDF tools that
            <br />
            <span className="bg-gradient-to-r from-brass-500 via-brass-400 to-forest-500 bg-clip-text text-transparent">
              stay on your device
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-ink-400 dark:text-ink-300 leading-relaxed max-w-xl mx-auto">
            Merge, split, rearrange, rotate and compress PDFs — all processed locally in your browser.
            Your documents never touch a server.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-forest-500 dark:text-forest-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Works offline · Files never leave your device · Free forever
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {TOOL_LIST.map((tool, i) => {
          const Comp = ICONS[tool.id]
          // 5 tools: on lg (3 cols) center the final pair; on mobile/tablet it's a clean 2-col flow
          const centerStart = i === TOOL_LIST.length - 2 ? ' lg:col-start-2' : ''
          return (
            <motion.a
              key={tool.id}
              href={`#/${tool.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={
                'group rounded-2xl border border-paper-300 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 p-4 sm:p-6 shadow-soft hover:border-brass-400 hover:shadow-lg hover:shadow-brass-400/10 transition-all' +
                centerStart
              }
            >
              <div className="flex items-center justify-between mb-6 sm:mb-10">
                <div className="w-11 h-11 rounded-xl bg-paper-200 dark:bg-ink-700 flex items-center justify-center text-ink-700 dark:text-paper-100 group-hover:bg-brass-400/15 group-hover:text-brass-500 transition-colors">
                  {Comp}
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-300 dark:text-ink-600 group-hover:text-brass-500 group-hover:translate-x-0.5 transition-all">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-semibold text-ink-900 dark:text-paper-100">{tool.name}</h3>
              <p className="text-xs sm:text-sm text-ink-400 dark:text-ink-300 mt-1 leading-snug">{tool.tagline}</p>
            </motion.a>
          )
        })}
      </section>
    </div>
  )
}
