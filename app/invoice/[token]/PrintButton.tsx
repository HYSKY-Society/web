'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ backgroundColor: '#3f11fa' }}
      className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Save as PDF / Print
    </button>
  )
}
