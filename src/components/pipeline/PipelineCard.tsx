import React from 'react'
import { Lead } from '@/context/LeadsContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineCardProps {
  lead: Lead
}

export function PipelineCard({ lead }: PipelineCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('leadId', lead.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const totalValue =
    lead.proposals?.reduce((acc, curr) => acc + (curr.valor || 0), 0) || 0

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border-none shadow-sm group',
        'animate-fade-in',
      )}
    >
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
        <Badge
          variant="outline"
          className="text-[10px] px-1 py-0 h-5 mb-2 truncate max-w-[100px]"
        >
          {lead.segment || 'Geral'}
        </Badge>
        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h4
          className="font-semibold text-sm mb-1 line-clamp-1"
          title={lead.company}
        >
          {lead.company}
        </h4>
        <p
          className="text-xs text-muted-foreground mb-3 line-clamp-1"
          title={lead.contactName}
        >
          {lead.contactName}
        </p>

        <div className="flex justify-between items-center mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${lead.id}`}
            />
            <AvatarFallback>
              {lead.contactName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {totalValue > 0 && (
            <span className="text-xs font-mono font-medium text-green-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalValue)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
