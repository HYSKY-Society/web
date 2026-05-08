'use client'
import { useState } from 'react'

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
}

export function ZeffyModal({ isOpen, onClose, title, options }: ZeffyModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,3,10,.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ height: '680px', border: '1px solid rgba(255,255,255,.12)', background: '#09090f' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <span className="text-white font-semibold text-sm">{title}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Tabs (only when multiple options) */}
        {options.length > 1 && (
          <div className="flex gap-1.5 px-4 py-3 shrink-0">
            {options.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setSelectedIdx(i)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                  selectedIdx === i
                    ? 'bg-[#5d00f5] text-white'
                    : 'bg-white/6 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Zeffy iframe */}
        <div className="flex-1 relative min-h-0">
          <iframe
            key={selectedIdx}
            title={options[selectedIdx].label}
            src={options[selectedIdx].embedUrl}
            style={{ position: 'absolute', border: 0, top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
            allowTransparency={true}
          />
        </div>
      </div>
    </div>
  )
}
