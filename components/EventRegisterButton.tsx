'use client'
import { useState } from 'react'
import { ZeffyModal, type ZeffyOption } from './ZeffyModal'

interface EventRegisterButtonProps {
  label?: string
  options: ZeffyOption[]
  title: string
  className?: string
}

export function EventRegisterButton({ label = 'Register Now →', options, title, className }: EventRegisterButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      <ZeffyModal isOpen={open} onClose={() => setOpen(false)} title={title} options={options} />
    </>
  )
}
