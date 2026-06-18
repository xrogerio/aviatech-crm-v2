import { useAuth } from '@/context/AuthContext'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { CompanyManagement } from '@/components/settings/CompanyManagement'
import { UserCompanyAssignment } from '@/components/settings/UserCompanyAssignment'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Settings() {
  const { role } = useAuth()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      {role === 'admin' ? (
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="admin">Configuração da Empresa</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-4">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="admin" className="space-y-6">
            <CompanyManagement />
            <UserCompanyAssignment />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <ProfileSettings />
        </div>
      )}
    </div>
  )
}
