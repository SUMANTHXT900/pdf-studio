import { motion } from 'framer-motion'
import { ToolHeading } from './components/ui'

export default function About() {
  return (
    <div className="py-6 max-w-2xl mx-auto">
      <ToolHeading
        icon={
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <rect x="2.5" y="2" width="4" height="16" rx="1" className="fill-brass-400" />
            <rect x="8" y="2" width="4" height="16" rx="1" className="fill-brass-300" />
            <rect x="13.5" y="2" width="4" height="16" rx="1" className="fill-brass-500" />
          </svg>
        }
        name="About Folio"
        desc="Private, in-browser PDF tools"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-5"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden rounded-2xl border border-paper-300/70 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 backdrop-blur p-6 shadow-soft hover:shadow-md transition-shadow"
        >
          <span aria-hidden className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
            style={{ background: 'radial-gradient(circle, var(--color-brass-400), transparent 70%)' }} />
          <h2 className="relative font-display text-xl font-semibold text-ink-900 dark:text-paper-100 mb-2">What is Folio?</h2>
          <p className="relative text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            Folio is a collection of PDF utilities that run <strong className="text-ink-800 dark:text-paper-100 font-semibold">entirely in your browser</strong>.
            Merge, split, rearrange, rotate and compress PDFs without uploading a single byte to a server.
            Everything is processed locally on your device — your documents never leave it.
          </p>
          <div className="relative mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-500/15 bg-forest-500/10 text-forest-600 dark:text-forest-400 px-3 py-1">🔒 Private by design</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/40 px-3 py-1 text-ink-500 dark:text-ink-300">⚡ Offline-first</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/40 px-3 py-1 text-ink-500 dark:text-ink-300">✦ No tracking</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-paper-300/70 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 backdrop-blur p-6 shadow-soft"
        >
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-paper-100 mb-3">Version</h2>
          <div className="flex flex-wrap items-center gap-3">
            <motion.span
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.18 }}
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-paper-50 text-paper-50 dark:text-ink-900 px-3.5 py-1.5 font-mono text-sm shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-brass-400 animate-pulse" />
              v{__FOLIO_VERSION__}
            </motion.span>
            <span className="text-sm text-ink-400 dark:text-ink-300">
              {__FOLIO_VERSION__ === '1.1.0' ? 'Latest — polished UI, motion & offline PWA.' : 'Current release.'}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-paper-300/70 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 backdrop-blur p-6 shadow-soft"
        >
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-paper-100 mb-2">Developer</h2>
          <p className="text-sm text-ink-500 dark:text-ink-300 mb-4 leading-relaxed">
            Built by <span className="font-medium text-ink-800 dark:text-paper-100">Sai Sumanth Giduthuri</span> — an ECE student who wanted private, no-upload PDF tools that feel premium.
          </p>
          <div className="flex flex-wrap gap-3">
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="https://www.linkedin.com/in/sai-sumanth-giduthuri-0a9956329/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/40 px-4 py-2.5 text-sm font-medium hover:border-brass-400/40 hover:bg-brass-400/5 hover:text-brass-600 dark:hover:text-brass-300 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.48-2.24-1.68-2.24-0.92 0-1.46 0.62-1.7 1.22-0.09 0.21-0.11 0.51-0.11 0.81v5.78H9.84s0.05-9.38 0-10.35h3.56v1.47c0.47-0.73 1.32-1.77 3.22-1.77 2.35 0 4.11 1.54 4.11 4.84v5.81zM5.34 7.43a2.06 2.06 0 1 1 0-4.11 2.06 2.06 0 0 1 0 4.11zM7.12 20.45H3.56V10.1h3.56v10.35z" /></svg>
              LinkedIn
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="https://github.com/SUMANTHXT900"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/40 px-4 py-2.5 text-sm font-medium hover:border-brass-400/40 hover:bg-brass-400/5 hover:text-brass-600 dark:hover:text-brass-300 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c0.5 0.09 0.68-0.22 0.68-0.48v-1.7c-2.77 0.6-3.36-1.34-3.36-1.34-0.45-1.15-1.11-1.46-1.11-1.46-0.91-0.62 0.07-0.61 0.07-0.61 1 0.07 1.53 1.03 1.53 1.03 0.89 1.53 2.34 1.09 2.91 0.83 0.09-0.65 0.35-1.09 0.63-1.34-2.22-0.25-4.55-1.11-4.55-4.94 0-1.09 0.39-1.98 1.03-2.68-0.1-0.25-0.45-1.27 0.1-2.65 0 0 0.84-0.27 2.75 1.02A9.3 9.3 0 0 1 12 6.84a9.3 9.3 0 0 1 2.5 0.33c1.91-1.29 2.75-1.02 2.75-1.02 0.55 1.38 0.2 2.4 0.1 2.65 0.64 0.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93 0.36 0.31 0.68 0.92 0.68 1.85v2.74c0 0.27 0.18 0.58 0.69 0.48A10 10 0 0 0 12 2z" /></svg>
              GitHub
            </motion.a>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-ink-300 dark:text-ink-500 text-center pt-2"
        >
          Folio is free and offline-first. No accounts, no tracking, no uploads.
        </motion.p>
      </motion.div>
    </div>
  )
}
