import { MessageSquare, CheckSquare } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lead } from '@/context/LeadsContext'
import { LeadTasksSection } from './LeadTasksSection'
import { LeadInteractionsSection } from './LeadInteractionsSection'

interface LeadInteractionsSheetProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadInteractionsSheet({
  lead,
  open,
  onOpenChange,
}: LeadInteractionsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-xl flex flex-col h-full overflow-hidden"
        side="right"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>Gestão de Lead: {lead?.company}</SheetTitle>
          <SheetDescription>
            Acompanhe o histórico e tarefas de {lead?.contactName}.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          defaultValue="interactions"
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="interactions" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Interações
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="h-4 w-4" /> Tarefas
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="interactions"
            className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <LeadInteractionsSection lead={lead} />
          </TabsContent>

          <TabsContent
            value="tasks"
            className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden"
          >
            <LeadTasksSection lead={lead} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
