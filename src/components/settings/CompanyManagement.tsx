import { useState, useEffect } from 'react'
import { companiesService, Company } from '@/services/companiesService'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { CompanyFormDialog } from './CompanyFormDialog'
import { useToast } from '@/hooks/use-toast'

export function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const { toast } = useToast()

  const loadCompanies = async () => {
    try {
      const data = await companiesService.getCompanies()
      setCompanies(data)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return
    try {
      await companiesService.deleteCompany(id)
      await loadCompanies()
      toast({ title: 'Empresa excluída com sucesso' })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleSave = async (data: Partial<Company>) => {
    try {
      if (editingCompany) {
        await companiesService.updateCompany(editingCompany.id, data)
        toast({ title: 'Empresa atualizada com sucesso' })
      } else {
        await companiesService.createCompany(data)
        toast({ title: 'Empresa criada com sucesso' })
      }
      setDialogOpen(false)
      loadCompanies()
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Empresas</CardTitle>
          <CardDescription>
            Gerencie as empresas cadastradas no sistema.
          </CardDescription>
        </div>
        <Button
          onClick={() => {
            setEditingCompany(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Empresa
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.razao_social}</TableCell>
                <TableCell>{c.cnpj || '-'}</TableCell>
                <TableCell>{c.responsavel_nome || '-'}</TableCell>
                <TableCell className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCompany(c)
                      setDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CompanyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingCompany}
        onSubmit={handleSave}
      />
    </Card>
  )
}
