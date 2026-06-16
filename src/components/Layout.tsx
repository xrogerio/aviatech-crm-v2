import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { AppHeader } from '@/components/AppHeader'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-6 overflow-x-hidden w-full max-w-[100vw]">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
