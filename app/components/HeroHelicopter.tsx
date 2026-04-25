'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function HeroHelicopter() {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return
      const y = window.scrollY
      wrapperRef.current.style.transform = `translateY(${y * 0.28}px)`
      wrapperRef.current.style.opacity = String(Math.max(0, 0.52 - y * 0.0008))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="absolute right-[-4%] top-0 w-[58%] h-full pointer-events-none z-[5] flex items-center"
      style={{
        mixBlendMode: 'screen',
        opacity: 0.52,
        maskImage: 'radial-gradient(ellipse 80% 72% at 58% 50%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 72% at 58% 50%, black 20%, transparent 70%)',
        willChange: 'transform, opacity',
      }}
    >
      <Image
        src="/hero-helicopter.png"
        alt=""
        width={1100}
        height={825}
        className="w-full h-auto object-contain helicopter-float"
        priority
      />
    </div>
  )
}
