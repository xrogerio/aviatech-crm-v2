import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  BarChart3,
  Users,
  KanbanSquare,
  FileText,
  CheckSquare,
  ShieldCheck,
  Layout,
  ArrowRight,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  MoreHorizontal,
  Check,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">ADAPTΔCRM</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/login">
              <Button>Acessar Plataforma</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-6 text-center space-y-8 max-w-4xl">
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
            >
              Gestão de Vendas B2B Simplificada
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Transforme leads em <br />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                oportunidades reais
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar leads, pipeline e propostas
              com a eficiência que sua equipe comercial precisa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/login">
                <Button size="lg" className="h-12 px-8 text-lg rounded-full">
                  Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-lg rounded-full"
                >
                  Ver Demonstração
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">
                7 Pilares da Produtividade
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Conheça as funcionalidades que fazem do ADAPTΔCRM a escolha
                certa para sua empresa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Dashboard */}
              <Card className="glass-card hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>Sales Dashboard</CardTitle>
                  <CardDescription>
                    KPIs em tempo real e visualização gráfica.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        Receita Total
                      </span>
                      <span className="text-xs font-bold text-green-600">
                        +12%
                      </span>
                    </div>
                    <div className="text-2xl font-bold">R$ 450.000</div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-3/4 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 2: Lead Management */}
              <Card className="glass-card hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle>Gestão de Leads</CardTitle>
                  <CardDescription>
                    Cadastro detalhado e segmentação.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 bg-background rounded-md border shadow-sm"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${i}`}
                          />
                          <AvatarFallback>LD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            Tech Solutions {i}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tecnologia
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5"
                        >
                          Novo
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feature 3: Pipeline Kanban */}
              <Card className="glass-card hover:shadow-lg transition-all duration-300 border-primary/10 md:row-span-2">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                    <KanbanSquare className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle>Pipeline de Vendas</CardTitle>
                  <CardDescription>
                    Visão Kanban drag-and-drop do funil.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 p-2 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Negociação
                      </span>
                      <Badge variant="outline" className="text-[10px] h-4">
                        2
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-background p-3 rounded border shadow-sm cursor-grab active:cursor-grabbing">
                        <div className="text-sm font-medium">Grupo Alpha</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          R$ 120.000
                        </div>
                      </div>
                      <div className="bg-background p-3 rounded border shadow-sm opacity-80">
                        <div className="text-sm font-medium">Beta Corp</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          R$ 85.000
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Proposta
                      </span>
                      <Badge variant="outline" className="text-[10px] h-4">
                        1
                      </Badge>
                    </div>
                    <div className="bg-background p-3 rounded border shadow-sm">
                      <div className="text-sm font-medium">Gamma Inc</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        R$ 45.000
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 4: Commercial Proposals */}
              <Card className="glass-card hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle>Propostas Comerciais</CardTitle>
                  <CardDescription>
                    Geração de PDF e rastreamento de status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-l-4 border-l-green-500 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-1.5 rounded">
                        <DollarSign className="h-4 w-4 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Proposta #284</p>
                        <p className="text-xs text-muted-foreground">
                          Venc: 15/10/2026
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white hover:bg-green-600">
                      Aprovada
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 5: Task Management */}
              <Card className="glass-card hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                    <CheckSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle>Gestão de Tarefas</CardTitle>
                  <CardDescription>
                    Organização de atividades e prazos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-primary bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm line-through text-muted-foreground">
                        Reunião de kickoff
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-muted-foreground/30" />
                      <span className="text-sm">Enviar contrato final</span>
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] text-red-500 border-red-200"
                      >
                        Hoje
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-muted-foreground/30" />
                      <span className="text-sm">Follow-up cliente</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 6: Access Control */}
              <Card className="glass-card hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-2">
                    <ShieldCheck className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle>Controle de Acesso</CardTitle>
                  <CardDescription>
                    Perfis para Admin, Gerente e Vendedor.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700"
                    >
                      Admin
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-purple-200 bg-purple-50 text-purple-700"
                    >
                      Gerente
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-700"
                    >
                      Vendedor
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Segurança de dados e isolamento de informações por função e
                    organização.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 7: UI/UX */}
              <Card className="glass-card hover:shadow-lg transition-all duration-300 border-primary/10 md:col-span-2 lg:col-span-3">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                        <Layout className="h-5 w-5 text-gray-700" />
                      </div>
                      <CardTitle>Experiência UI/UX Premium</CardTitle>
                      <CardDescription>
                        Interface limpa, moderna e responsiva em Light Mode.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Design System consistente com Shadcn/ui
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Totalmente responsivo (Mobile-first)
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Micro-interações fluidas e feedback visual
                        </li>
                      </ul>
                    </CardContent>
                  </div>
                  <div className="flex-1 p-6 flex items-center justify-center bg-muted/20 w-full h-full min-h-[200px] border-l border-dashed">
                    <div className="w-3/4 bg-background rounded-lg shadow-xl border p-4 space-y-3 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-red-400" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                      </div>
                      <div className="h-2 w-1/3 bg-muted rounded" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-16 bg-blue-50 rounded border border-blue-100" />
                        <div className="h-16 bg-indigo-50 rounded border border-indigo-100" />
                      </div>
                      <div className="h-2 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-6">
              Pronto para evoluir suas vendas?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Junte-se a empresas que já transformaram seus processos comerciais
              com o ADAPTΔCRM.
            </p>
            <Link to="/login">
              <Button
                size="lg"
                className="rounded-full px-10 h-12 text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Acessar Dashboard
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <TrendingUp className="h-5 w-5" />
            <span className="font-bold">ADAPTΔCRM</span>
          </div>
          <div className="text-sm text-muted-foreground text-center md:text-right">
            <p>&copy; 2026 ADAPTΔCRM. Todos os direitos reservados.</p>
            <p className="mt-1">
              Feito com <span className="text-red-500">♥</span> para equipes de
              vendas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
