import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
  type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'ghost' | 'danger'
  className?: string
  type?: 'button' | 'submit'
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-400/40 focus-visible:ring-offset-1 focus-visible:ring-offset-paper-100 dark:focus-visible:ring-offset-ink-950'
  const styles = {
    primary:
      'bg-ink-900 text-paper-50 hover:bg-ink-800 dark:bg-paper-50 dark:text-ink-900 dark:hover:bg-paper-200 shadow-sm hover:shadow-md active:shadow-sm',
    ghost:
      'border border-paper-300 dark:border-ink-700 text-ink-700 dark:text-paper-100 hover:bg-paper-200 dark:hover:bg-ink-800 hover:border-brass-400/30',
    danger:
      'border border-red-600/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30',
  }[variant]
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.button>
  )
}

export function DropZone({
  accept,
  multiple,
  onFiles,
  title = 'Drop files here',
  hint = 'or click to browse',
}: {
  accept?: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  title?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  return (
    <motion.button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length) onFiles(files)
      }}
      whileTap={{ scale: 0.99 }}
      animate={over ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`group relative w-full overflow-hidden rounded-2xl border-2 border-dashed p-8 sm:p-12 flex flex-col items-center justify-center gap-3 text-center transition-colors ${
        over
          ? 'border-brass-400 bg-brass-400/10 shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-brass-400)_15%,transparent)]'
          : 'border-paper-300 dark:border-ink-700 hover:border-brass-400/50 dark:hover:border-brass-400/35 hover:bg-paper-50/60 dark:hover:bg-ink-800/40'
      }`}
    >
      {/* subtle grid */}
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-ink-900) 1px, transparent 0)', backgroundSize: '18px 18px' }} />

      <motion.div
        animate={over ? { y: -2, scale: 1.04 } : { y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ring-1 transition-colors ${
          over ? 'bg-brass-400 text-white ring-brass-400/30' : 'bg-paper-200 dark:bg-ink-800 text-brass-500 ring-black/5 dark:ring-white/5 group-hover:bg-brass-400/10'
        }`}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
      </motion.div>
      <div className="relative">
        <p className="font-medium text-ink-800 dark:text-paper-100">{title}</p>
        <p className="text-sm text-ink-400 dark:text-ink-300 mt-1">{hint}</p>
        {over && (
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-medium text-brass-600 dark:text-brass-400 mt-1">release to add</motion.p>
        )}
      </div>
      <span className="relative inline-flex items-center gap-1.5 text-[11px] text-ink-400 dark:text-ink-300 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50/70 dark:bg-ink-800/50 px-3 py-1">
        PDF only · 100% local
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
      />
    </motion.button>
  )
}

export function FileChip({
  name,
  size,
  onRemove,
}: {
  name: string
  size: number
  onRemove: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-xl border border-paper-300/70 dark:border-ink-700 bg-paper-50 dark:bg-ink-800/60 backdrop-blur px-4 py-3 shadow-sm"
    >
      <span className="w-9 h-9 rounded-lg bg-brass-400/15 text-brass-600 dark:text-brass-400 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900 dark:text-paper-100 truncate">{name}</p>
        <p className="text-xs text-ink-400 dark:text-ink-300">{formatBytes(size)}</p>
      </div>
      <motion.button
        onClick={onRemove}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        aria-label={`Remove ${name}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <span className="relative w-10 h-10">
        <span className="absolute inset-0 rounded-full border-[3px] border-paper-200 dark:border-ink-700" />
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-brass-500"
        />
      </span>
      {label && <p className="text-sm text-ink-400 dark:text-ink-300">{label}</p>}
    </div>
  )
}

export function ToolHeading({ icon, name, desc }: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      <a href="#/" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-brass-600 dark:text-ink-300 dark:hover:text-brass-400 transition-colors mb-4 group">
        <span className="w-6 h-6 rounded-full border border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 flex items-center justify-center group-hover:border-brass-400/40 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </span>
        All tools
      </a>
      <div className="flex items-start gap-4">
        <motion.div
          initial={{ scale: 0.9, rotate: -4 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.08 }}
          className="w-12 h-12 rounded-2xl bg-ink-900 dark:bg-paper-50 text-paper-50 dark:text-ink-900 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
        >
          {icon}
        </motion.div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-paper-100">{name}</h1>
          <p className="text-sm text-ink-400 dark:text-ink-300 mt-1 leading-relaxed max-w-xl">{desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-paper-300/70 dark:border-ink-700 bg-paper-50/80 dark:bg-ink-800/60 backdrop-blur p-6 shadow-soft ${className}`}
    >
      {children}
    </motion.div>
  )
}
