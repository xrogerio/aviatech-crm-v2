import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, FolderOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Project, projectsService } from '@/services/projectsService'
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { ProjectHistorySheet } from '@/components/projects/ProjectHistorySheet'

export default function Projects() {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectsService.getProjects()
      setProjects(data)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar projetos', variant: 'destructive' })
    }
  }, [toast])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleCreate = () => {
    setEditingProject(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  const handleViewHistory = (project: Project) => {
    setViewingProject(project)
    setIsHistoryOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este projeto?')) return
    try {
      await projectsService.deleteProject(id)
      toast({ title: 'Projeto excluído com sucesso' })
      loadProjects()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const handleSubmit = async (data: Partial<Project>) => {
    try {
      if (editingProject) {
        await projectsService.updateProject(editingProject.id, data)
        toast({ title: 'Projeto atualizado com sucesso' })
      } else {
        await projectsService.createProject(data)
        toast({ title: 'Projeto criado com sucesso' })
      }
      setIsDialogOpen(false)
      loadProjects()
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao salvar projeto', variant: 'destructive' })
    }
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.leads?.empresa &&
        p.leads.empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.classification &&
        p.classification.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            Projetos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie projetos associados aos seus leads.
          </p>
        </div>

        <Button
          className="rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={handleCreate}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Projeto
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card/50 p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, lead ou classificação..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ProjectsTable
        projects={filteredProjects}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewHistory={handleViewHistory}
      />

      <ProjectFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingProject}
      />

      <ProjectHistorySheet
        project={viewingProject}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </div>
  )
}
