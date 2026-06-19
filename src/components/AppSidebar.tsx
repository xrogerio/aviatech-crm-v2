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
  Folder,
  KanbanSquare,
  CheckSquare,
  FileText,
  Settings,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase/client'

export function AppSidebar() {
  const location = useLocation()
  const {
    role,
    organizationName: contextOrgName,
    organizationLogo: contextOrgLogo,
    loading,
    user,
  } = useAuth()

  const [orgName, setOrgName] = useState(contextOrgName)
  const [orgLogo, setOrgLogo] = useState(contextOrgLogo)

  useEffect(() => {
    if (contextOrgName) setOrgName(contextOrgName)
    if (contextOrgLogo) setOrgLogo(contextOrgLogo)
  }, [contextOrgName, contextOrgLogo])

  useEffect(() => {
    if (!user?.id) return

    let companyId: string | null = null
    let subscription: any

    const loadCompany = async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id) {
        companyId = userData.company_id

        const { data: companyData } = await supabase
          .from('companies')
          .select('razao_social, logo_url')
          .eq('id', companyId)
          .single()

        if (companyData) {
          setOrgName(companyData.razao_social)
          setOrgLogo(companyData.logo_url)
        }

        subscription = supabase
          .channel('sidebar_company_updates')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'companies',
              filter: `id=eq.${companyId}`,
            },
            (payload) => {
              if (payload.new) {
                setOrgName(payload.new.razao_social)
                setOrgLogo(payload.new.logo_url)
              }
            },
          )
          .subscribe()
      }
    }

    loadCompany()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [user?.id])

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
      icon: Folder,
      label: 'Projetos',
      path: '/projetos',
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
      path: '/tarefas',
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
      path: '/propostas',
      roles: ['admin', 'gerente', 'vendedor'],
    },
  ]

  // Add Users Management link only for Admins
  if (role === 'admin') {
    menuItems.push({
      icon: ShieldCheck,
      label: 'Usuários',
      path: '/usuarios',
      roles: ['admin'],
    })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 font-bold text-xl px-2 w-full overflow-hidden">
          {loading && !orgName && !orgLogo ? (
            <Skeleton className="h-8 w-full mx-2" />
          ) : (
            <>
              {orgLogo && (
                <div className="h-8 w-8 shrink-0 flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={orgLogo}
                    alt={orgName || 'Logo'}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              {orgName && (
                <span className="group-data-[collapsible=icon]:hidden transition-all duration-200 truncate">
                  {orgName}
                </span>
              )}
            </>
          )}
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
          {loading && !orgName ? (
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-3 w-[60%]" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {orgName && (
                <div className="text-sm truncate" title={orgName}>
                  <span className="text-muted-foreground mr-1">Empresa:</span>
                  <span className="font-medium text-sidebar-foreground">
                    {orgName}
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
        {(!loading || orgName) && (orgName || role) && (
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
