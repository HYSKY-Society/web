'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface ZeffyOption {
  label: string
  icon: string
  embedUrl: string
}

interface ZeffyModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  options: ZeffyOption[]
  heroImage?: string
  heroAccent?: string
  compact?: boolean
}

export function ZeffyModal({
  isOpen,
  onClose,
  title,
  options,
  heroImage,
  heroAccent = '#5d00f5',
  compact = false,
}: ZeffyModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(4,3,10,.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`section-dark relative flex w-full max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] ${compact ? 'sm:max-w-[460px]' : heroImage ? 'sm:max-w-none md:max-w-5xl md:flex-row' : 'sm:max-w-lg'}`}
        style={{
          height: compact
            ? 'min(660px, calc(100dvh - 2rem))'
            : 'min(760px, calc(100dvh - 1rem))',
          border: '1px solid rgba(255,255,255,.12)',
          background: '#09090f',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {heroImage && (
          <aside className="relative hidden md:flex md:w-[42%] shrink-0 overflow-hidden">
            <Image
              src={heroImage}
              alt=""
              fill
              sizes="(max-width: 1024px) 42vw, 420px"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, rgba(4,3,10,.08) 20%, rgba(4,3,10,.95) 100%), linear-gradient(135deg, ${heroAccent}22, transparent)`,
              }}
            />
            <div className="relative z-10 mt-auto p-8 text-left">
              <div
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-white mb-4"
                style={{ backgroundColor: heroAccent }}
              >
                HySky Course
              </div>
              <h2 className="text-white text-3xl font-bold leading-tight mb-3">{title}</h2>
              <p className="text-white/65 text-sm leading-relaxed">
                Complete your secure registration. Access is added automatically to the HySky account using this checkout email.
              </p>
            </div>
          </aside>
        )}

        <section className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <div className="min-w-0 text-left">
              <div className="text-white font-semibold text-sm truncate">
                {heroImage ? 'Complete enrollment' : title}
              </div>
              {heroImage && (
                <div className="text-white/45 text-xs truncate mt-0.5">{title}</div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close checkout"
              className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/20 px-3 transition-all hover:border-white/40 hover:bg-white/10"
              style={{ color: '#ffffff' }}
            >
              <span className="text-xs font-semibold">Close</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {options.length > 1 && (
            <div className="flex gap-1.5 px-4 py-3 shrink-0">
              {options.map((opt, i) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedIdx(i)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                    selectedIdx === i
                      ? 'bg-[#5d00f5]'
                      : 'bg-white/6 hover:bg-white/10'
                  }`}
                  style={{ color: '#ffffff', opacity: selectedIdx === i ? 1 : 0.7 }}
                >
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 relative min-h-0">
            <iframe
              key={selectedIdx}
              title={options[selectedIdx].label}
              src={options[selectedIdx].embedUrl}
              style={{ position: 'absolute', border: 0, top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
              allowTransparency={true}
            />
          </div>
        </section>
      </div>
    </div>,
    document.body,
  )
}

