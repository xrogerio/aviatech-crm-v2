import { useState } from 'react'
import { useLeads, Lead } from '@/context/LeadsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  LeadFormDialog,
  LeadFormValues,
} from '@/components/leads/LeadFormDialog'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { LeadInteractionsSheet } from '@/components/leads/LeadInteractionsSheet'

export default function Leads() {
  const { leads, addLead, updateLead, deleteLead } = useLeads()
  const { toast } = useToast()

  // Filters State
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterSegment, setFilterSegment] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Dialog & Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  // Interaction History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [viewingLead, setViewingLead] = useState<Lead | null>(null)

  const handleCreate = () => {
    setEditingLead(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setIsDialogOpen(true)
  }

  const handleViewHistory = (lead: Lead) => {
    setViewingLead(lead)
    setIsHistoryOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteLead(id)
    toast({
      title: 'Lead excluído',
      description: 'O lead foi removido com sucesso.',
    })
  }

  const handleFormSubmit = async (values: LeadFormValues) => {
    if (editingLead) {
      const success = await updateLead(editingLead.id, values)
      if (success) {
        toast({
          title: 'Lead atualizado!',
          description: 'As informações foram salvas com sucesso.',
        })
        setIsDialogOpen(false)
        setEditingLead(null)
      }
    } else {
      const success = await addLead(values)
      if (success) {
        toast({
          title: 'Lead cadastrado!',
          description: `${values.company} foi adicionado com sucesso.`,
        })
        setIsDialogOpen(false)
      }
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus =
      filterStatus === 'todos' || lead.status === filterStatus
    const matchesSegment =
      filterSegment === 'todos' || lead.segment === filterSegment
    const matchesSearch =
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSegment && matchesSearch
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestão de Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus potenciais clientes e oportunidades.
          </p>
        </div>

        <Button
          className="rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={handleCreate}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Lead
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card/50 p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="Novo Lead">Novo Lead</SelectItem>
              <SelectItem value="Qualificação">Qualificação</SelectItem>
              <SelectItem value="Proposta Enviada">Proposta Enviada</SelectItem>
              <SelectItem value="Negociação">Negociação</SelectItem>
              <SelectItem value="Fechado Ganho">Fechado Ganho</SelectItem>
              <SelectItem value="Fechado Perdido">Fechado Perdido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSegment} onValueChange={setFilterSegment}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Segmentos</SelectItem>
              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
              <SelectItem value="Varejo">Varejo</SelectItem>
              <SelectItem value="Indústria">Indústria</SelectItem>
              <SelectItem value="Saúde">Saúde</SelectItem>
              <SelectItem value="Educação">Educação</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <LeadsTable
        leads={filteredLeads}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewHistory={handleViewHistory}
      />

      <LeadFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingLead}
      />

      <LeadInteractionsSheet
        lead={viewingLead}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </div>
  )
}
