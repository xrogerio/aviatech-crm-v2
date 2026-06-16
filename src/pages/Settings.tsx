import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, Loader2 } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Profile
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Password
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.name) setName(data.name)
            if ((data as any).avatar_url) setAvatarUrl((data as any).avatar_url)
          }
        })
    }
  }, [user])

  const handleUploadAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploadingAvatar(true)
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const newAvatarUrl = publicUrlData.publicUrl
      setAvatarUrl(newAvatarUrl)

      // Update users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: newAvatarUrl } as any)
        .eq('id', user!.id)

      if (updateError) throw updateError

      toast({
        title: 'Foto atualizada',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar foto',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      setSavingProfile(true)

      const updates: { data?: { name: string }; email?: string } = {}
      if (name) updates.data = { name }
      if (email && email !== user.email) updates.email = email

      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updates)
        if (authError) throw authError
      }

      if (name) {
        const { error: dbError } = await supabase
          .from('users')
          .update({ name })
          .eq('id', user.id)

        if (dbError) throw dbError
      }

      toast({
        title: 'Perfil atualizado',
        description: updates.email
          ? 'Informações salvas. Um e-mail de confirmação pode ter sido enviado para o novo endereço.'
          : 'Suas informações foram salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!password) {
      toast({
        title: 'Erro',
        description: 'A nova senha não pode estar vazia.',
        variant: 'destructive',
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSavingPassword(true)
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi alterada com sucesso.',
      })
      setPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Perfil do Usuário</CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais e foto de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 max-w-xl">
            {/* Avatar Section */}
            <div className="flex flex-col space-y-3">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border border-border">
                  <AvatarImage
                    src={
                      avatarUrl ||
                      `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${user?.id}`
                    }
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {name
                      ? name.substring(0, 2).toUpperCase()
                      : user?.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadAvatar}
                      disabled={uploadingAvatar}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('avatar-upload')?.click()
                      }
                      disabled={uploadingAvatar}
                      className="gap-2"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploadingAvatar ? 'Enviando...' : 'Alterar foto'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recomendado: Imagem quadrada (JPG, PNG). Máx: 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Ao alterar seu e-mail, pode ser necessário confirmar o novo
                  endereço.
                </p>
              </div>
              <Button onClick={handleUpdateProfile} disabled={savingProfile}>
                {savingProfile ? 'Salvando...' : 'Salvar informações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Altere sua senha de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
              />
            </div>
            <Button onClick={handleUpdatePassword} disabled={savingPassword}>
              {savingPassword ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
