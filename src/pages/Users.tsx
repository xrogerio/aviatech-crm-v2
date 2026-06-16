import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { UserProfile, usersService } from '@/services/usersService'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  User as UserIcon,
  Trash2,
} from 'lucide-react'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function Users() {
  const { role, user: currentUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null)

  // Protect the route
  useEffect(() => {
    if (role && role !== 'admin') {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      })
      navigate('/')
    }
  }, [role, navigate, toast])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await usersService.getUsers()
      setUsers(data)
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro ao carregar usuários',
        description:
          'Não foi possível buscar a lista de usuários. Verifique suas permissões.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers()
    }
  }, [role])

  const handleCreate = () => {
    setEditingUser(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const confirmDelete = (user: UserProfile) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    try {
      await usersService.deleteUser(userToDelete.id)
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido com sucesso.',
      })
      fetchUsers()
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro ao excluir',
        description:
          error.message || 'Ocorreu um erro ao tentar excluir o usuário.',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await usersService.updateUserRole(editingUser.id, values.role)
        toast({
          title: 'Usuário atualizado',
          description: 'Permissões alteradas com sucesso.',
        })
      } else {
        await usersService.createUser({
          email: values.email,
          password: values.password,
          role: values.role,
          name: values.name,
        })
        toast({
          title: 'Usuário criado',
          description: 'O novo usuário foi registrado com sucesso.',
        })
      }
      fetchUsers()
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 hover:bg-red-600">Admin</Badge>
      case 'gerente':
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">Gerente</Badge>
        )
      default:
        return <Badge className="bg-blue-500 hover:bg-blue-600">Vendedor</Badge>
    }
  }

  // Helper to get deterministic gender for avatar
  const getGender = (id: string) => {
    const charCode = id.charCodeAt(id.length - 1)
    return charCode % 2 === 0 ? 'male' : 'female'
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (role !== 'admin') return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie o acesso e permissões da equipe.
          </p>
        </div>
        <Button onClick={handleCreate} className="rounded-full shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
          <CardDescription>
            Lista de usuários ativos no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?gender=${getGender(user.id)}&seed=${user.id}`}
                          />
                          <AvatarFallback className="bg-primary/10">
                            {user.name ? (
                              user.name.substring(0, 2).toUpperCase()
                            ) : (
                              <UserIcon className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.name || 'Sem nome'}
                          </span>
                          {user.id === currentUser?.id && (
                            <span className="text-[10px] text-muted-foreground">
                              (Você)
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Permissões
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmDelete(user)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Usuário
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              usuário
              <b> {userToDelete?.name || userToDelete?.email}</b> e removerá
              seus dados do servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
