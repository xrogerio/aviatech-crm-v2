import { useState, useEffect } from 'react'
import { usersService, UserProfile } from '@/services/usersService'
import { companiesService, Company } from '@/services/companiesService'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export function UserCompanyAssignment() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([usersService.getUsers(), companiesService.getCompanies()])
      .then(([u, c]) => {
        setUsers(u)
        setCompanies(c)
      })
      .catch((e) =>
        toast({
          title: 'Erro',
          description: e.message,
          variant: 'destructive',
        }),
      )
  }, [toast])

  const handleAssign = async (userId: string, companyId: string) => {
    try {
      await usersService.updateUserCompany(
        userId,
        companyId === 'none' ? null : companyId,
      )
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, company_id: companyId === 'none' ? null : companyId }
            : u,
        ),
      )
      toast({ title: 'Associação atualizada com sucesso' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Associação de Usuários a Empresas</CardTitle>
        <CardDescription>
          Defina a qual empresa cada usuário pertence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Empresa Associada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.name || 'Sem nome'}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select
                    value={u.company_id || 'none'}
                    onValueChange={(val) => handleAssign(u.id, val)}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.razao_social}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
