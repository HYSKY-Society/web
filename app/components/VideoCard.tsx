'use client'

import { useState } from 'react'
import { extractYouTubeId } from '@/lib/youtube'

export default function VideoCard({ youtubeUrl, title }: { youtubeUrl: string; title: string }) {
  const [loaded, setLoaded] = useState(false)
  const id = extractYouTubeId(youtubeUrl)
  if (!id) return null

  if (loaded) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setLoaded(true)}
      className="relative w-full group"
      style={{ paddingBottom: '56.25%' }}
      aria-label={`Play ${title}`}
    >
      <img
        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/15 transition-colors">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
          style={{ background: '#FF0000' }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" style={{ marginLeft: '3px' }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  )
}
