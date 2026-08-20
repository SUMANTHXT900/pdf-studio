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
      <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M8 3l6 6m0 0V3H8m0 0v6h6" />
    </svg>
  ),
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}
const card = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as any } },
}

export default function Home() {
  return (
    <div className="py-6 sm:py-10 overflow-hidden">
      {/* hero */}
      <section className="relative text-center max-w-2xl mx-auto mb-10 sm:mb-14 px-1">
        {/* soft glow behind hero */}
        <div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[38rem] h-[18rem] -z-10 opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(40rem 14rem at 50% 0%, color-mix(in srgb, var(--color-brass-400) 14%, transparent), transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-paper-300/70 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-brass-600 dark:text-brass-400 mb-5 shadow-sm"
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-forest-500 opacity-40 animate-ping" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-forest-500" />
            </span>
            Every tool, zero uploads
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-normal text-ink-400 dark:text-ink-300 ml-1 pl-2 border-l border-paper-300/60 dark:border-ink-700">offline · private</span>
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[2.3rem] sm:text-6xl font-semibold tracking-tight text-ink-900 dark:text-paper-100 leading-[0.95]"
          >
            <span className="block">PDF tools that</span>
            <span className="bg-gradient-to-r from-brass-500 via-brass-400 to-forest-500 bg-clip-text text-transparent inline-block pb-1">
              stay on your device
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-4 text-[15px] sm:text-lg text-ink-400 dark:text-ink-300 leading-relaxed max-w-xl mx-auto"
          >
            Merge, split, rearrange, rotate and compress PDFs — all processed locally in your browser.
            Your documents never touch a server.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-forest-500/10 dark:bg-forest-500/15 text-forest-600 dark:text-forest-400 border border-forest-500/15 px-3 py-1.5 text-xs font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Works offline
            </span>
            <span className="inline-flex items-center rounded-full bg-paper-50 dark:bg-ink-800 border border-paper-300/60 dark:border-ink-700 px-3 py-1.5 text-xs text-ink-500 dark:text-ink-300">
              Files never leave your device
            </span>
            <span className="inline-flex items-center rounded-full bg-paper-50 dark:bg-ink-800 border border-paper-300/60 dark:border-ink-700 px-3 py-1.5 text-xs text-ink-500 dark:text-ink-300">
              Free forever
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* tool grid */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        {TOOL_LIST.map((tool, i) => {
          const Comp = ICONS[tool.id]
          const centerStart = i === TOOL_LIST.length - 2 ? ' lg:col-start-2' : ''
          const lastFull = i === TOOL_LIST.length - 1 ? ' col-span-2 lg:col-span-1' : ''
          return (
            <motion.a
              key={tool.id}
              href={`#/${tool.id}`}
              variants={card}
              whileHover={{ y: -4, transition: { duration: 0.22, ease: 'easeOut' } }}
              whileTap={{ scale: 0.98 }}
              className={
                'group relative overflow-hidden rounded-2xl border border-paper-300/70 dark:border-ink-700 bg-paper-50/90 dark:bg-ink-800/60 p-4 sm:p-6 shadow-soft hover:border-brass-400/50 hover:shadow-lg hover:shadow-brass-400/10 transition-colors' +
                centerStart + lastFull
              }
            >
              {/* shine sweep */}
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(105deg, transparent 30%, color-mix(in srgb, var(--color-brass-400) 12%, transparent) 48%, transparent 62%)', transform: 'translateX(-18%)' }} />

              <div className="relative flex items-center justify-between mb-6 sm:mb-10">
                <div className="w-11 h-11 rounded-xl bg-paper-200 dark:bg-ink-700 flex items-center justify-center text-ink-700 dark:text-paper-100 group-hover:bg-brass-400/15 group-hover:text-brass-500 transition-colors duration-300">
                  <motion.span whileHover={{ rotate: 6 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
                    {Comp}
                  </motion.span>
                </div>
                <span className="w-8 h-8 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50/60 dark:bg-ink-900/40 flex items-center justify-center text-ink-300 dark:text-ink-500 group-hover:text-brass-500 group-hover:border-brass-400/40 group-hover:bg-brass-400/10 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-300">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <h3 className="relative font-display text-base sm:text-lg font-semibold text-ink-900 dark:text-paper-100 tracking-tight">{tool.name}</h3>
              <p className="relative text-xs sm:text-sm text-ink-400 dark:text-ink-300 mt-1 leading-snug">{tool.tagline}</p>

              {/* bottom accent */}
              <span className="pointer-events-none absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-brass-400/0 to-transparent group-hover:via-brass-400/40 transition-all duration-500" />
            </motion.a>
          )
        })}
      </motion.section>

      {/* trust strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 text-[11px] text-ink-400 dark:text-ink-300"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50/70 dark:bg-ink-800/40 px-3 py-1.5">🔒 100% in-browser</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50/70 dark:bg-ink-800/40 px-3 py-1.5">⚡ No upload</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50/70 dark:bg-ink-800/40 px-3 py-1.5">✦ Edited locally</span>
      </motion.div>
    </div>
  )
}
