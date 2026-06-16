import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CheckSquare,
  FileText,
  Settings,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

export function AppSidebar() {
  const location = useLocation()
  const { role, organizationName, loading } = useAuth()

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/',
      roles: ['admin', 'gerente', 'vendedor'],
    },
    {
      icon: Users,
      label: 'Leads',
      path: '/leads',
      roles: ['admin', 'gerente', 'vendedor'],
    },
    {
      icon: KanbanSquare,
      label: 'Pipeline',
      path: '/pipeline',
      roles: ['admin', 'gerente', 'vendedor'],
    },
    {
      icon: CheckSquare,
      label: 'Tarefas',
      path: '/tasks',
      roles: ['admin', 'gerente', 'vendedor'],
    },
    {
      icon: Clock,
      label: 'Prazos',
      path: '/deadlines',
      roles: ['admin', 'gerente', 'vendedor'],
    },
    {
      icon: FileText,
      label: 'Propostas',
      path: '/proposals',
      roles: ['admin', 'gerente', 'vendedor'],
    },
  ]

  // Add Users Management link only for Admins
  if (role === 'admin') {
    menuItems.push({
      icon: ShieldCheck,
      label: 'Usuários',
      path: '/users',
      roles: ['admin'],
    })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 font-bold text-xl px-2 w-full overflow-hidden">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xs">A</span>
          </div>
          <span className="group-data-[collapsible=icon]:hidden transition-all duration-200">
            ADAPTΔCRM
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(
                  (item) => !item.roles || (role && item.roles.includes(role)),
                )
                .map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                      tooltip={item.label}
                      className="h-10 my-1"
                    >
                      <Link to={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {location.pathname === item.path && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        {/* Organization and Role Info */}
        <div className="flex flex-col gap-2 mb-2 group-data-[collapsible=icon]:hidden">
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-3 w-[60%]" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {organizationName && (
                <div className="text-sm truncate" title={organizationName}>
                  <span className="text-muted-foreground mr-1">Empresa:</span>
                  <span className="font-medium text-sidebar-foreground">
                    {organizationName}
                  </span>
                </div>
              )}
              {role && (
                <div className="text-sm truncate" title={role}>
                  <span className="text-muted-foreground mr-1">
                    Nível de Acesso:
                  </span>
                  <span className="font-medium text-sidebar-foreground capitalize">
                    {role}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Separator only if info is displayed */}
        {!loading && (organizationName || role) && (
          <div className="h-px bg-sidebar-border/50 my-1 group-data-[collapsible=icon]:hidden" />
        )}

        <div className="flex flex-col gap-2 group-data-[collapsible=icon]:items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            asChild
          >
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                Configurações
              </span>
            </Link>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
