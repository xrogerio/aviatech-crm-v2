import { useAuth } from '@/context/AuthContext'
import { CompanyManagement } from '@/components/settings/CompanyManagement'
import { UserCompanyAssignment } from '@/components/settings/UserCompanyAssignment'
import { GeneralSettings } from '@/components/settings/GeneralSettings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Settings() {
  const { role } = useAuth()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
          {(role === 'admin' || role === 'gerente') && (
            <TabsTrigger value="admin">Administração</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>
        {(role === 'admin' || role === 'gerente') && (
          <TabsContent value="admin" className="space-y-6">
            <CompanyManagement />
            <UserCompanyAssignment />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
