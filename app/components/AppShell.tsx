'use client'

import { useState, useEffect } from 'react'
import AppTopBar from './AppTopBar'
import AppSidebar from './AppSidebar'

export type SidebarData = {
  tier:                 string
  displayName:          string | null
  email:                string
  enrolledCourseSlugs:  string[]
  enrolledEventSlugs:   string[]
  isAdmin:              boolean
}

export default function AppShell({ sidebarData, children, noPadding }: { sidebarData: SidebarData; children: React.ReactNode; noPadding?: boolean }) {
  const [sidebarOpen,  setSidebarOpen]  = useState(false)  // mobile overlay
  const [collapsed,    setCollapsed]    = useState(false)   // desktop collapse

  // Restore desktop collapsed state from localStorage after mount
  useEffect(() => {
    setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
  }, [])

  const handleMenuClick = () => {
    if (window.innerWidth >= 1024) {
      // Desktop: toggle collapse + persist
      setCollapsed(c => {
        const next = !c
        localStorage.setItem('sidebar-collapsed', String(next))
        return next
      })
    } else {
      // Mobile: toggle overlay
      setSidebarOpen(o => !o)
    }
  }

  return (
    <div className="min-h-screen bg-[#04080F]">
      <AppTopBar onMenuClick={handleMenuClick} />

      <AppSidebar
        data={sidebarData}
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={`pt-[60px] min-h-[calc(100vh-60px)] transition-[margin-left] duration-300 ease-in-out ${
        collapsed ? 'lg:ml-0' : 'lg:ml-[260px]'
      }`}>
        {noPadding ? children : (
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
