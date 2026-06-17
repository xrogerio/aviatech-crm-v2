import { useState, useEffect, useCallback } from 'react'
import {
  Project,
  ProjectStatus,
  projectsService,
} from '@/services/projectsService'
import { PipelineColumn } from '@/components/pipeline/PipelineColumn'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const PIPELINE_STAGES: ProjectStatus[] = [
  'Novo Projeto',
  'Qualificação',
  'Proposta Enviada',
  'Negociação',
  'Fechado',
  'Negado',
]

export default function Pipeline() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectsService.getProjects()
      setProjects(data)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar pipeline', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleUpdateProjectStatus = async (
    id: string,
    status: ProjectStatus,
  ) => {
    try {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      )
      await projectsService.updateProject(id, { status })
    } catch (err) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
      loadProjects()
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col space-y-4 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Pipeline de Projetos
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe a evolução dos seus projetos através das etapas.
        </p>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage}
            title={stage}
            status={stage}
            projects={projects.filter((p) => p.status === stage)}
            onUpdateStatus={handleUpdateProjectStatus}
          />
        ))}
      </div>
    </div>
  )
}
