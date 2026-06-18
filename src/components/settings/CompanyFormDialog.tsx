import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Company } from '@/services/companiesService'

const schema = z.object({
  razao_social: z.string().min(1, 'Razão Social é obrigatória'),
  cnpj: z.string().optional(),
  responsavel_nome: z.string().optional(),
  responsavel_cargo: z.string().optional(),
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

interface CompanyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: Company | null
  onSubmit: (data: any) => Promise<void>
}

export function CompanyFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: CompanyFormDialogProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      razao_social: '',
      cnpj: '',
      responsavel_nome: '',
      responsavel_cargo: '',
      logo_url: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          razao_social: initialData.razao_social || '',
          cnpj: initialData.cnpj || '',
          responsavel_nome: initialData.responsavel_nome || '',
          responsavel_cargo: initialData.responsavel_cargo || '',
          logo_url: initialData.logo_url || '',
        })
      } else {
        form.reset({
          razao_social: '',
          cnpj: '',
          responsavel_nome: '',
          responsavel_cargo: '',
          logo_url: '',
        })
      }
    }
  }, [open, initialData, form])

  const handleSubmit = async (values: any) => {
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="razao_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsavel_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsavel_cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo do Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Diretor Comercial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Logo</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
