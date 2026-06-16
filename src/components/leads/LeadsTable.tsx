import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { Lead } from '@/context/LeadsContext'

interface LeadsTableProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onViewHistory: (lead: Lead) => void
}

export function LeadsTable({
  leads,
  onEdit,
  onDelete,
  onViewHistory,
}: LeadsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Novo Lead':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200">
            Novo Lead
          </Badge>
        )
      case 'Qualificação':
        return (
          <Badge className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200">
            Qualificação
          </Badge>
        )
      case 'Proposta Enviada':
        return (
          <Badge className="bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-200">
            Proposta Enviada
          </Badge>
        )
      case 'Negociação':
        return (
          <Badge className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 border-purple-200">
            Negociação
          </Badge>
        )
      case 'Fechado Ganho':
        return (
          <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">
            Fechado Ganho
          </Badge>
        )
      case 'Fechado Perdido':
        return <Badge variant="secondary">Fechado Perdido</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum lead encontrado.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium text-foreground">
                  {lead.company}
                </TableCell>
                <TableCell>{lead.contactName}</TableCell>
                <TableCell>{lead.segment || '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.email || '-'}
                </TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onViewHistory(lead)}
                      title="Ver histórico de interações"
                    >
                      <span className="sr-only">Ver histórico</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(lead)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(lead.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
