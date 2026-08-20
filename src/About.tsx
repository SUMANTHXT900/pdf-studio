import { motion } from 'framer-motion'

import { ToolHeading } from './components/ui'

declare const __FOLIO_VERSION__: string

type Entry = {
  version: string
  date: string
  title: string
  status: 'shipped' | 'latest' | 'planned'
  changes: string[]
}

const ENTRIES: Entry[] = [
  {
    version: 'v1.0.0',
    date: '2026 · 01',
    title: 'Foundation',
    status: 'shipped',
    changes: [
      'First public release — five local PDF tools: Merge, Split, Rearrange, Rotate & Compress.',
      '100% in-browser with pdf-lib + pdfjs-dist — no uploads, no servers.',
      'Editorial design system (paper / ink / brass / forest, Fraunces + Inter) and responsive shell.',
      'Offline-ready PWA scaffold and glass header.',
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026 · 08',
    title: 'Refine & focus',
    status: 'shipped',
    changes: [
      'Removed non-working converters — Folio does one thing well: PDFs that never leave your device.',
      'Added page viewer (pdf.js canvas) and a precise Split picker with range + thumbnail selection.',
      'Rearrange & Split UX polish: drag-to-reorder, clearer drop zones, safer file handling.',
      'Motion pass — spring entrances, blur-in page transitions, scroll progress and hover lift.',
    ],
  },
  {
    // dynamic — always reflects package.json version via Vite define (currently v1.1.0 + polish on dev)
    version: `v${typeof __FOLIO_VERSION__ !== 'undefined' ? __FOLIO_VERSION__ : '1.1.0'} · dev`,
    date: 'now · latest',
    title: 'Polish — motion, shine & perf',
    status: 'latest',
    changes: [
      'Shine & brass accents: radial glow, shimmer on cards, brass dots and spring badges.',
      'Performance: manualChunks (pdf / doc), 8 MB PWA precache, spring-tuned animations.',
      'PWA autoUpdate, safe-area mobile nav, glass + backdrop-blur throughout.',
      'Accessibility & dark-mode refinements across every tool.',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'planned',
    title: 'Sign & annotate',
    status: 'planned',
    changes: [
      'Draw/type e-signatures and place them on any page.',
      'Form-fill overlay and text annotation.',
      'Watermark & page-number stamps.',
    ],
  },
  {
    version: 'v2.0.0',
    date: 'next',
    title: 'Batch & OCR',
    status: 'planned',
    changes: [
      'Batch queue — run Merge/Split/Rotate across dozens of files.',
      'Local OCR for scanned PDFs (on-device, still private).',
      'Folder watch + keyboard-first command palette.',
    ],
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
}
const cardIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function About() {
  return (
    <div className="py-6 max-w-2xl mx-auto">
      <ToolHeading
        icon={
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
            <rect x="2.5" y="2" width="4" height="16" rx="1" className="fill-brass-400" />
            <rect x="8" y="2" width="4" height="16" rx="1" className="fill-brass-300" />
            <rect x="13.5" y="2" width="4" height="16" rx="1" className="fill-brass-500" />
          </svg>
        }
        name="About Folio"
        desc="Private, in-browser PDF tools"
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="space-y-5"
      >
        {/* What is Folio */}
        <motion.div
          variants={cardIn}
          className="group relative overflow-hidden rounded-2xl border border-paper-300/70 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 backdrop-blur p-6 shadow-soft hover:shadow-md hover:border-brass-400/20 transition-all"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
            style={{ background: 'radial-gradient(circle, var(--color-brass-400), transparent 70%)' }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900 dark:text-paper-100">
              What is Folio?
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-forest-500/15 bg-forest-500/10 px-2.5 py-1 text-[11px] font-medium text-forest-600 dark:text-forest-400">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-500" /> private by design
            </span>
          </div>
          <p className="relative mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            Folio is a collection of PDF utilities that run{' '}
            <strong className="font-semibold text-ink-800 dark:text-paper-100">entirely in your browser</strong>. Merge,
            split, rearrange, rotate and compress PDFs without uploading a single byte to a server. Everything is
            processed locally — your documents never leave your device.
          </p>
          <div className="relative mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/40 px-3 py-1 text-ink-500 dark:text-ink-300">
              ⚡ Offline-first
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/40 px-3 py-1 text-ink-500 dark:text-ink-300">
              ✦ No tracking
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brass-400/20 bg-brass-400/10 px-3 py-1 text-brass-600 dark:text-brass-300">
              ◆ No accounts
            </span>
          </div>
        </motion.div>

        {/* Version tree */}
        <motion.div
          variants={cardIn}
          className="rounded-2xl border border-paper-300/70 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 backdrop-blur shadow-soft overflow-hidden"
        >
          <div className="px-6 pt-6 pb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-paper-100">
                Version tree
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-400 dark:text-ink-300">
                A living changelog — where Folio has been and where it&apos;s headed.
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-paper-50 text-paper-50 dark:text-ink-900 px-3.5 py-1.5 font-mono text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brass-400 animate-pulse" />
              v{typeof __FOLIO_VERSION__ !== 'undefined' ? __FOLIO_VERSION__ : '1.1.0'} · latest
            </span>
          </div>

          {/* timeline */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* vertical spine */}
            <div className="absolute left-[29px] sm:left-[37px] top-2 bottom-6 w-px bg-gradient-to-b from-brass-400/40 via-paper-300/80 dark:via-ink-700 to-transparent" />
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              style={{ originY: 0 }}
              className="absolute left-[29px] sm:left-[37px] top-2 bottom-6 w-px bg-gradient-to-b from-brass-400 via-brass-400/60 to-transparent opacity-60"
            />

            <div className="space-y-4">
              {ENTRIES.map((e, i) => {
                const isLatest = e.status === 'latest'
                const isPlanned = e.status === 'planned'
                return (
                  <motion.div
                    key={`${e.version}-${i}`}
                    variants={cardIn}
                    className="relative flex gap-3 sm:gap-4 group/item"
                  >
                    {/* dot column */}
                    <div className="relative flex flex-col items-center shrink-0 w-7 sm:w-8 pt-3.5">
                      <div
                        className={
                          'relative w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ' +
                          (isLatest
                            ? 'bg-brass-400 border-brass-300 shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-brass-400)_18%,transparent)] group-hover/item:shadow-[0_0_0_8px_color-mix(in_srgb,var(--color-brass-400)_22%,transparent)]'
                            : isPlanned
                              ? 'bg-paper-50 dark:bg-ink-800 border-paper-300 dark:border-ink-700 group-hover/item:border-brass-400/40'
                              : 'bg-paper-50 dark:bg-ink-900 border-brass-400/50 group-hover/item:border-brass-400 group-hover/item:bg-brass-400/10')
                        }
                      >
                        {isLatest && (
                          <>
                            <span className="absolute inset-0 rounded-full bg-brass-400/30 animate-ping" aria-hidden />
                            <span className="relative w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                          </>
                        )}
                        {!isLatest && (
                          <span
                            className={
                              'w-1.5 h-1.5 rounded-full ' +
                              (isPlanned ? 'bg-ink-300 dark:bg-ink-500' : 'bg-brass-500')
                            }
                          />
                        )}
                      </div>
                    </div>

                    {/* card */}
                    <div
                      className={
                        'flex-1 min-w-0 rounded-2xl border p-4 sm:p-[18px] transition-all duration-300 ' +
                        (isLatest
                          ? 'bg-white/90 dark:bg-ink-900/60 border-brass-400/30 shadow-soft group-hover/item:shadow-md group-hover/item:border-brass-400/40'
                          : isPlanned
                            ? 'bg-paper-50/60 dark:bg-ink-900/30 border-dashed border-paper-300/80 dark:border-ink-700/80 group-hover/item:border-paper-300 dark:group-hover/item:border-ink-600 group-hover/item:bg-paper-50 dark:group-hover/item:bg-ink-800/40'
                            : 'bg-white/70 dark:bg-ink-900/40 border-paper-300/60 dark:border-ink-700/60 group-hover/item:bg-white dark:group-hover/item:bg-ink-800/60 group-hover/item:border-paper-300 dark:group-hover/item:border-ink-600 group-hover/item:shadow-sm')
                      }
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            'inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide border ' +
                            (isLatest
                              ? 'bg-ink-900 dark:bg-paper-50 text-white dark:text-ink-900 border-ink-900 dark:border-paper-50'
                              : isPlanned
                                ? 'bg-paper-100 dark:bg-ink-800 text-ink-400 dark:text-ink-300 border-paper-200 dark:border-ink-700'
                                : 'bg-paper-100 dark:bg-ink-800 text-ink-700 dark:text-paper-100 border-paper-200 dark:border-ink-700')
                          }
                        >
                          {e.version}
                        </span>
                        <span
                          className={
                            'inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium tracking-wide uppercase border ' +
                            (isLatest
                              ? 'bg-brass-400/15 text-brass-600 dark:text-brass-300 border-brass-400/25'
                              : isPlanned
                                ? 'bg-paper-100 dark:bg-ink-800 text-ink-400 dark:text-ink-300 border-paper-200 dark:border-ink-700'
                                : 'bg-forest-500/10 text-forest-600 dark:text-forest-400 border-forest-500/15')
                          }
                        >
                          {isLatest ? '● latest' : isPlanned ? '○ planned' : '✓ shipped'}
                        </span>
                        <span className="ml-auto text-[11px] font-mono text-ink-400 dark:text-ink-300 tabular-nums">
                          {e.date}
                        </span>
                      </div>

                      <h3 className="mt-2.5 font-display text-[15px] font-semibold leading-none tracking-tight text-ink-900 dark:text-paper-100">
                        {e.title}
                      </h3>

                      <ul className="mt-2.5 space-y-1.5">
                        {e.changes.map((c) => (
                          <li
                            key={c}
                            className="flex gap-2 text-[13px] leading-[1.5] text-ink-500 dark:text-ink-300"
                          >
                            <span
                              className={
                                'mt-[7px] w-1 h-1 rounded-full shrink-0 ' +
                                (isLatest ? 'bg-brass-400' : isPlanned ? 'bg-ink-300 dark:bg-ink-600' : 'bg-ink-400 dark:bg-ink-300')
                              }
                              aria-hidden
                            />
                            <span className="min-w-0">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <p className="mt-5 text-center text-[11px] text-ink-400 dark:text-ink-300">
              Have an idea? <a href="https://github.com/SUMANTHXT900" target="_blank" rel="noopener noreferrer" className="underline decoration-brass-400/40 underline-offset-2 hover:text-brass-600 dark:hover:text-brass-300">Open an issue</a> — the tree grows with you.
            </p>
          </div>
        </motion.div>

        {/* Developer */}
        <motion.div
          variants={cardIn}
          className="group relative overflow-hidden rounded-2xl border border-paper-300/70 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 backdrop-blur p-6 shadow-soft hover:shadow-md hover:border-brass-400/20 transition-all"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-10 blur-2xl"
            style={{ background: 'radial-gradient(circle, var(--color-forest-500), transparent 70%)' }}
          />
          <h2 className="relative font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-paper-100">
            Developer
          </h2>
          <p className="relative mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
            Built by <span className="font-medium text-ink-800 dark:text-paper-100">Sai Sumanth Giduthuri</span> — an ECE
            student who wanted private, no-upload PDF tools that feel premium. Folio stays local by design: no accounts,
            no tracking, no surprises.
          </p>
          <div className="relative mt-4 flex flex-wrap gap-3">
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="https://www.linkedin.com/in/sai-sumanth-giduthuri-0a9956329/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-white/70 dark:bg-ink-900/40 px-4 py-2.5 text-sm font-medium hover:border-brass-400/40 hover:bg-brass-400/5 hover:text-brass-600 dark:hover:text-brass-300 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.48-2.24-1.68-2.24-0.92 0-1.46 0.62-1.7 1.22-0.09 0.21-0.11 0.51-0.11 0.81v5.78H9.84s0.05-9.38 0-10.35h3.56v1.47c0.47-0.73 1.32-1.77 3.22-1.77 2.35 0 4.11 1.54 4.11 4.84v5.81zM5.34 7.43a2.06 2.06 0 1 1 0-4.11 2.06 2.06 0 0 1 0 4.11zM7.12 20.45H3.56V10.1h3.56v10.35z" />
              </svg>
              LinkedIn
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="https://github.com/SUMANTHXT900"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-paper-300 dark:border-ink-700 bg-white/70 dark:bg-ink-900/40 px-4 py-2.5 text-sm font-medium hover:border-brass-400/40 hover:bg-brass-400/5 hover:text-brass-600 dark:hover:text-brass-300 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-3.16 19.49c0.5 0.09 0.68-0.22 0.68-0.48v-1.7c-2.77 0.6-3.36-1.34-3.36-1.34-0.45-1.15-1.11-1.46-1.11-1.46-0.91-0.62 0.07-0.61 0.07-0.61 1 0.07 1.53 1.03 1.53 1.03 0.89 1.53 2.34 1.09 2.91 0.83 0.09-0.65 0.35-1.09 0.63-1.34-2.22-0.25-4.55-1.11-4.55-4.94 0-1.09 0.39-1.98 1.03-2.68-0.1-0.25-0.45-1.27 0.1-2.65 0 0 0.84-0.27 2.75 1.02A9.3 9.3 0 0 1 12 6.84a9.3 9.3 0 0 1 2.5 0.33c1.91-1.29 2.75-1.02 2.75-1.02 0.55 1.38 0.2 2.4 0.1 2.65 0.64 0.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93 0.36 0.31 0.68 0.92 0.68 1.85v2.74c0 0.27 0.18 0.58 0.69 0.48A10 10 0 0 0 12 2z" />
              </svg>
              GitHub
            </motion.a>
          </div>
        </motion.div>

        <motion.p
          variants={cardIn}
          className="text-xs text-ink-300 dark:text-ink-500 text-center pt-1"
        >
          Folio is free and offline-first. No accounts, no tracking, no uploads.
        </motion.p>
      </motion.div>
    </div>
  )
}
