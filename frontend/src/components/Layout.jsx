import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import AiPanel from './AiPanel'
import LocationPrompt from './LocationPrompt'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [aiCollapsed, setAiCollapsed] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const aiCollapsedRef = useRef(aiCollapsed)

  useEffect(() => {
    aiCollapsedRef.current = aiCollapsed
  }, [aiCollapsed])

  useEffect(() => {
    const checkWidth = () => {
      const small = window.innerWidth < 1280
      setIsSmallScreen(small)
      if (small && !aiCollapsedRef.current) setAiCollapsed(true)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  const handleAiToggle = () => {
    setAiCollapsed(!aiCollapsed)
  }

  const aiOverlay = !aiCollapsed && isSmallScreen

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0c]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`${!aiCollapsed && !isSmallScreen ? 'max-w-[calc(1400px-340px)] xl:max-w-[calc(1400px-380px)]' : 'max-w-[1400px]'} mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6 transition-all duration-300`}>
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* AI Panel */}
      <AiPanel collapsed={aiCollapsed} onToggle={handleAiToggle} overlay={aiOverlay} />

      {/* Location Prompt - shows once after login */}
      <LocationPrompt />
    </div>
  )
}
