import React, { useState } from 'react'
import { Lead } from '@/context/LeadsContext'
import { Badge } from '@/components/ui/badge'
import { PipelineCard } from './PipelineCard'
import { cn } from '@/lib/utils'

interface PipelineColumnProps {
  id: string
  title: string
  color: string
  leads: Lead[]
  onDropLead: (leadId: string, status: string) => void
}

export function PipelineColumn({
  id,
  title,
  color,
  leads,
  onDropLead,
}: PipelineColumnProps) {
  const [isOver, setIsOver] = useState(false)

  const totalValue = leads.reduce((acc, lead) => {
    const leadTotal =
      lead.proposals?.reduce((sum, prop) => sum + (prop.valor || 0), 0) || 0
    return acc + leadTotal
  }, 0)

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOver(false)
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      onDropLead(leadId, id)
    }
  }

  return (
    <div
      className={cn(
        'flex-1 flex flex-col min-w-[280px] h-full transition-colors rounded-xl',
        isOver ? 'bg-muted/50 ring-2 ring-primary/20' : '',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          'p-3 rounded-t-xl border-t border-x flex flex-col gap-2 bg-white/50 backdrop-blur-sm',
          color,
        )}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm uppercase tracking-wide">
            {title}
          </h3>
          <Badge variant="secondary" className="bg-white/80">
            {leads.length}
          </Badge>
        </div>
        <div className="text-xs font-mono text-muted-foreground font-medium">
          Total: {formattedTotal}
        </div>
      </div>

      <div className="flex-1 bg-muted/30 border-x border-b rounded-b-xl p-3 space-y-3 overflow-y-auto min-h-[150px]">
        {leads.map((lead) => (
          <PipelineCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div className="h-24 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
            Arraste leads aqui
          </div>
        )}
      </div>
    </div>
  )
}
