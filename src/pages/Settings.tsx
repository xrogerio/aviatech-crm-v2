import { useAuth } from '@/context/AuthContext'
import { CompanyManagement } from '@/components/settings/CompanyManagement'
import { UserCompanyAssignment } from '@/components/settings/UserCompanyAssignment'

export default function Settings() {
  const { role } = useAuth()

  if (role !== 'admin' && role !== 'gerente') {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        </div>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar as configurações administrativas.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>
      <div className="space-y-6">
        <CompanyManagement />
        <UserCompanyAssignment />
      </div>
    </div>
  )
}
