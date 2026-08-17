import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

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
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none'
  const styles = {
    primary:
      'bg-ink-900 text-paper-50 hover:bg-ink-800 dark:bg-paper-50 dark:text-ink-900 dark:hover:bg-paper-200 shadow-sm',
    ghost:
      'border border-paper-300 dark:border-ink-700 text-ink-700 dark:text-paper-100 hover:bg-paper-200 dark:hover:bg-ink-800',
    danger:
      'border border-red-600/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30',
  }[variant]
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
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
      className={`w-full rounded-2xl border-2 border-dashed transition-colors p-8 sm:p-12 flex flex-col items-center justify-center gap-3 text-center ${
        over
          ? 'border-brass-400 bg-brass-400/10'
          : 'border-paper-300 dark:border-ink-700 hover:border-brass-400/60 dark:hover:border-brass-400/40'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-paper-200 dark:bg-ink-800 flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-brass-500">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
      </div>
      <div>
        <p className="font-medium text-ink-800 dark:text-paper-100">{title}</p>
        <p className="text-sm text-ink-400 dark:text-ink-300 mt-1">{hint}</p>
      </div>
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 px-4 py-3"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-brass-500 shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900 dark:text-paper-100 truncate">{name}</p>
        <p className="text-xs text-ink-400 dark:text-ink-300">{formatBytes(size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        aria-label={`Remove ${name}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="w-10 h-10 rounded-full border-[3px] border-paper-300 dark:border-ink-700 border-t-brass-500 animate-spin" />
      {label && <p className="text-sm text-ink-400 dark:text-ink-300">{label}</p>}
    </div>
  )
}

export function ToolHeading({ icon, name, desc }: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <div className="mb-8">
      <a href="#/" className="inline-flex items-center gap-1 text-sm text-ink-400 hover:text-brass-500 dark:text-ink-300 dark:hover:text-brass-400 transition-colors mb-4">← All tools</a>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-ink-900 dark:bg-paper-50 text-paper-50 dark:text-ink-900 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-paper-100">{name}</h1>
          <p className="text-sm text-ink-400 dark:text-ink-300 mt-1">{desc}</p>
        </div>
      </div>
    </div>
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
    <div className={`rounded-2xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800/60 p-6 ${className}`}>
      {children}
    </div>
  )
}