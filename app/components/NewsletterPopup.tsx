'use client'
import { useState } from 'react'

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border text-[#13dce8] text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:bg-[#13dce8]/8"
        style={{ borderColor: '#13dce8' }}
      >
        Subscribe to Our Newsletter
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(4,3,10,.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ height: '620px', border: '1px solid rgba(255,255,255,.12)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all text-lg"
            >
              ✕
            </button>
            <div style={{ position: 'relative', overflow: 'hidden', height: '100%', width: '100%' }}>
              <iframe
                title="Signup form powered by Zeffy"
                style={{ position: 'absolute', border: 0, top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' }}
                src="https://www.zeffy.com/en-US/embed/newsletter-form/sign-up-for-our-newsletter-291"
                allowTransparency={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
