'use client'

import { useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#04080F]">
      <AppTopBar onMenuClick={() => setSidebarOpen(o => !o)} />

      <AppSidebar
        data={sidebarData}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-[260px] pt-[60px] min-h-[calc(100vh-60px)]">
        {noPadding ? children : (
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
