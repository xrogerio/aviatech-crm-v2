import { useLeads, Lead } from '@/context/LeadsContext'
import { Badge } from '@/components/ui/badge'
import { PipelineColumn } from '@/components/pipeline/PipelineColumn'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const STAGES = [
  {
    id: 'Novo Lead',
    title: 'Novo Lead',
    color: 'bg-blue-500/10 border-blue-200',
  },
  {
    id: 'Qualificação',
    title: 'Qualificação',
    color: 'bg-yellow-500/10 border-yellow-200',
  },
  {
    id: 'Proposta Enviada',
    title: 'Proposta Enviada',
    color: 'bg-orange-500/10 border-orange-200',
  },
  {
    id: 'Negociação',
    title: 'Negociação',
    color: 'bg-purple-500/10 border-purple-200',
  },
  {
    id: 'Fechado Ganho',
    title: 'Fechado Ganho',
    color: 'bg-green-500/10 border-green-200',
  },
  {
    id: 'Fechado Perdido',
    title: 'Fechado Perdido',
    color: 'bg-gray-500/10 border-gray-200',
  },
]

export default function Pipeline() {
  const { leads, updateLead } = useLeads()

  const handleDropLead = (leadId: string, newStatus: string) => {
    updateLead(leadId, { status: newStatus as Lead['status'] })
  }

  const getLeadsForStage = (stageId: string) => {
    return leads.filter((l) => l.status === stageId)
  }

  const totalPipelineValue = leads.reduce((acc, lead) => {
    if (lead.status === 'Fechado Perdido') return acc
    const leadTotal =
      lead.proposals?.reduce((sum, prop) => sum + (prop.valor || 0), 0) || 0
    return acc + leadTotal
  }, 0)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pipeline de Vendas
        </h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm py-1 px-3 bg-background">
            Pipeline Ativo:{' '}
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            }).format(totalPipelineValue)}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full rounded-md border bg-background/40 backdrop-blur-sm">
        <div className="flex h-full min-w-[1600px] p-4 gap-4">
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              id={stage.id}
              title={stage.title}
              color={stage.color}
              leads={getLeadsForStage(stage.id)}
              onDropLead={handleDropLead}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
