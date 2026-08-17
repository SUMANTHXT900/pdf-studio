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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-paper-100 mb-2">What is Folio?</h2>
          <p className="text-sm leading-relaxed text-ink-400 dark:text-ink-300">
            Folio is a collection of PDF utilities that run <strong>entirely in your browser</strong>.
            Merge, split, rearrange, rotate and compress PDFs without uploading a single byte to a server.
            Everything is processed locally on your device — your documents never leave it.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-paper-100 mb-3">Version</h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-brass-400/15 text-brass-600 dark:text-brass-300 px-3 py-1 font-mono text-sm">
              v{__FOLIO_VERSION__}
            </span>
            <span className="text-sm text-ink-400 dark:text-ink-300">
              {__FOLIO_VERSION__ === '1.1.0' ? 'Latest — removed non-working converters, added page viewer & split picker.' : 'Current release.'}
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-paper-100 mb-3">Developer</h2>
          <p className="text-sm text-ink-400 dark:text-ink-300 mb-4">
            Built by Sai Sumanth Giduthuri — an ECE student who wanted private, no-upload PDF tools.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.linkedin.com/in/sai-sumanth-giduthuri-0a9956329/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-paper-300 dark:border-ink-700 px-3 py-2 text-sm hover:border-brass-400 hover:text-brass-600 dark:hover:text-brass-300 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/SUMANTHXT900"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-paper-300 dark:border-ink-700 px-3 py-2 text-sm hover:border-brass-400 hover:text-brass-600 dark:hover:text-brass-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </Card>

        <p className="text-xs text-ink-300 dark:text-ink-500 text-center">
          Folio is free and offline-first. No accounts, no tracking, no uploads.
        </p>
      </motion.div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800/60 p-6">
      {children}
    </div>
  )
}
