import { useEffect, useState, useRef } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Company } from '@/services/companiesService'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react'

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
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setSelectedFile(null)
      if (initialData) {
        setPreviewUrl(initialData.logo_url || null)
        form.reset({
          razao_social: initialData.razao_social || '',
          cnpj: initialData.cnpj || '',
          responsavel_nome: initialData.responsavel_nome || '',
          responsavel_cargo: initialData.responsavel_cargo || '',
          logo_url: initialData.logo_url || '',
        })
      } else {
        setPreviewUrl(null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Formato inválido',
          description:
            'Por favor, selecione uma imagem válida (PNG, JPG, WEBP).',
          variant: 'destructive',
        })
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      form.setValue('logo_url', '')
      form.clearErrors('logo_url')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      let finalLogoUrl = values.logo_url

      if (selectedFile) {
        setUploading(true)
        const fileExt = selectedFile.name.split('.').pop()
        // Generate a random name to bypass browser cache on updates
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, selectedFile, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        const { data } = supabase.storage.from('logos').getPublicUrl(filePath)

        finalLogoUrl = data.publicUrl
      }

      await onSubmit({ ...values, logo_url: finalLogoUrl })
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer upload',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !uploading && onOpenChange(val)}>
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
            {/* Logo Field */}
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo da Empresa</FormLabel>
                  <div className="flex flex-col gap-4 p-4 border rounded-md bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border bg-background shrink-0">
                        <AvatarImage
                          src={previewUrl || field.value}
                          alt="Preview"
                          className="object-contain"
                        />
                        <AvatarFallback>
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2 flex-1">
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full"
                          >
                            {uploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            {uploading ? 'Enviando...' : 'Selecionar Imagem'}
                          </Button>
                          {(previewUrl || field.value) && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-destructive px-3"
                              disabled={uploading}
                              onClick={() => {
                                setSelectedFile(null)
                                setPreviewUrl(null)
                                field.onChange('')
                                if (fileInputRef.current)
                                  fileInputRef.current.value = ''
                              }}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Ou insira uma URL diretamente:
                      </div>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          disabled={uploading || !!selectedFile}
                          onChange={(e) => {
                            field.onChange(e)
                            setPreviewUrl(e.target.value)
                          }}
                        />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="razao_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da empresa"
                      {...field}
                      disabled={uploading}
                    />
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
                    <Input
                      placeholder="00.000.000/0000-00"
                      {...field}
                      disabled={uploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsavel_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome completo"
                        {...field}
                        disabled={uploading}
                      />
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
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Diretor"
                        {...field}
                        disabled={uploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
