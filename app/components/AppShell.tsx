'use client'

import { useState, useEffect } from 'react'
import AppTopBar from './AppTopBar'
import AppSidebar from './AppSidebar'
import { ChatProvider } from './ChatProvider'
import ChatBar from './ChatBar'
import UpgradeChatButton from './UpgradeChatButton'
import VipAccessRefresh from './VipAccessRefresh'
import { hasVipCommunityAccess } from '@/lib/tiers'

export type SidebarData = {
  myId:                 string
  tier:                 string
  displayName:          string | null
  avatarUrl:            string | null
  email:                string
  enrolledCourseSlugs:  string[]
  enrolledEventSlugs:   string[]
  isAdmin:              boolean
}

export default function AppShell({ sidebarData, children, noPadding }: { sidebarData: SidebarData; children: React.ReactNode; noPadding?: boolean }) {
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [collapsed,    setCollapsed]    = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true')
  }, [])

  const handleMenuClick = () => {
    if (window.innerWidth >= 1024) {
      setCollapsed(c => {
        const next = !c
        localStorage.setItem('sidebar-collapsed', String(next))
        return next
      })
    } else {
      setSidebarOpen(o => !o)
    }
  }

  const canUseVipCommunity = hasVipCommunityAccess(sidebarData.tier)

  return (
    <ChatProvider myId={sidebarData.myId}>
      <VipAccessRefresh initialCanUseVipCommunity={canUseVipCommunity} />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <AppTopBar onMenuClick={handleMenuClick} myId={sidebarData.myId} canOpenDirectMessages={canUseVipCommunity} />

        <AppSidebar
          data={sidebarData}
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className={`pt-[60px] min-h-[calc(100vh-60px)] transition-[margin-left] duration-300 ease-in-out ${
          collapsed ? 'lg:ml-[60px]' : 'lg:ml-[260px]'
        }`}>
          {noPadding ? children : (
            <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl pb-20">
              {children}
            </div>
          )}
        </main>

        {canUseVipCommunity ? <ChatBar /> : <UpgradeChatButton />}
      </div>
    </ChatProvider>
  )
}
