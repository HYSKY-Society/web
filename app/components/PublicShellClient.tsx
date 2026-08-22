'use client'

import { useState } from 'react'
import AppTopBar from './AppTopBar'
import PublicSidebar from './PublicSidebar'

export default function PublicShellClient({
  children, isLoggedIn,
}: { children: React.ReactNode; isLoggedIn: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      <AppTopBar onMenuClick={() => setSidebarOpen(open => !open)} isLoggedIn={isLoggedIn} sidebarOpen={sidebarOpen} />
      <PublicSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isLoggedIn={isLoggedIn} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="pt-[60px]">
        {children}
      </div>
    </div>
  )
}

