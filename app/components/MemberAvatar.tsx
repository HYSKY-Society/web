'use client'

import { useState } from 'react'

function initials(name: string | null): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function MemberAvatar({
  name,
  url,
  size = 48,
  className = '',
}: {
  name: string | null
  url: string | null
  size?: number
  className?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const colors = ['bg-[#5d00f5]', 'bg-[#13dce8]', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500']
  const colorIndex = (name ?? '?').charCodeAt(0) % colors.length
  const showImage = Boolean(url && url !== failedUrl)

  if (showImage) {
    return (
      <img
        src={url!}
        alt=""
        width={size}
        height={size}
        onError={() => setFailedUrl(url)}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      aria-label={`${name ?? 'Member'} profile initials`}
      className={`${colors[colorIndex]} flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  )
}
