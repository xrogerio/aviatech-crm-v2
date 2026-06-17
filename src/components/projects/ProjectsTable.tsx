import { Project } from '@/services/projectsService'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash, CalendarClock } from 'lucide-react'

interface ProjectsTableProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  onViewTimeline: (project: Project) => void
}

export function ProjectsTable({
  projects,
  onEdit,
  onDelete,
  onViewTimeline,
}: ProjectsTableProps) {
  return (
    <div className="rounded-xl border bg-card/50 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Projeto</TableHead>
            <TableHead>Classificação</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.classification || '-'}</TableCell>
              <TableCell>{project.leads?.empresa || '-'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewTimeline(project)}>
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Ver Tarefas (Timeline)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(project)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onClick={() => onDelete(project.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {projects.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhum projeto encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
