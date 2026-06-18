import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Plus, FileDown, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { proposalsService, Proposal } from '@/services/proposalsService'
import { ProposalFormDialog } from '@/components/proposals/ProposalFormDialog'

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const { toast } = useToast()

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const data = await proposalsService.getProposals()
      setProposals(data)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar propostas',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const handleCreate = () => {
    setEditingProposal(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal)
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingProposal) {
        await proposalsService.updateProposal(editingProposal.id, values)
        toast({
          title: 'Proposta atualizada',
          description: 'As alterações foram salvas com sucesso.',
        })
      } else {
        await proposalsService.createProposal(values)
        toast({
          title: 'Proposta criada',
          description: 'A nova proposta foi registrada com sucesso.',
        })
      }
      fetchProposals()
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const generatePDF = (proposal: Proposal) => {
    // Basic HTML template for the print window
    const printContent = `
      <html>
        <head>
          <title>Proposta Comercial - ${proposal.titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #000; }
            .meta { text-align: right; font-size: 14px; color: #666; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .project-info { text-align: right; }
            .title { font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #1a1a1a; }
            .description { margin-bottom: 30px; line-height: 1.6; }
            table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; border-bottom: 2px solid #ddd; padding: 10px; background: #f9f9f9; }
            td { border-bottom: 1px solid #ddd; padding: 10px; }
            .total-row { font-weight: bold; font-size: 18px; }
            .total-label { text-align: right; }
            .footer { margin-top: 60px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .status-Rascunho { background: #eee; color: #555; }
            .status-Enviada { background: #e3f2fd; color: #1565c0; }
            .status-Aprovada { background: #e8f5e9; color: #2e7d32; }
            .status-Rejeitada { background: #ffebee; color: #c62828; }
            .signatures { display: flex; justify-content: space-between; margin-top: 80px; page-break-inside: avoid; }
            .signature-block { width: 45%; text-align: center; display: flex; flex-direction: column; }
            .signature-block .role { font-size: 14px; color: #333; font-weight: bold; margin-bottom: 4px; }
            .signature-block .cnpj { font-size: 12px; color: #666; }
            .signature-block .line { border-top: 1px solid #000; margin-bottom: 10px; width: 100%; margin-top: 40px; }
            .signature-block .name { font-weight: bold; font-size: 16px; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ADAPTΔCRM</div>
            <div class="meta">
              <div>Data: ${new Date().toLocaleDateString('pt-BR')}</div>
              <div>Validade: ${proposal.validade ? new Date(proposal.validade).toLocaleDateString('pt-BR') : 'N/A'}</div>
              <div class="badge status-${proposal.status}">${proposal.status}</div>
            </div>
          </div>

          <div class="info-section">
            <div class="client-info">
              <strong>Cliente:</strong><br>
              ${proposal.leads?.empresa || 'Empresa não informada'}<br>
              ${proposal.leads?.contato ? `Att: ${proposal.leads.contato}<br>` : ''}
              ${proposal.leads?.email ? `${proposal.leads.email}` : ''}
            </div>
            <div class="project-info">
              <strong>Projeto:</strong><br>
              ${proposal.projects?.name || 'Não Informado'}
            </div>
          </div>

          <div class="title">${proposal.titulo}</div>
          
          <div class="description">
            ${proposal.descricao ? proposal.descricao.replace(/\n/g, '<br>') : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%">Descrição</th>
                <th style="width: 15%">Qtd</th>
                <th style="width: 15%">Valor Unit.</th>
                <th style="width: 20%; text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                proposal.itens
                  ?.map(
                    (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}</td>
                  <td style="text-align: right">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitPrice)}</td>
                </tr>
              `,
                  )
                  .join('') ||
                '<tr><td colspan="4">Nenhum item listado</td></tr>'
              }
              <tr>
                <td colspan="3" class="total-label total-row">Valor Total:</td>
                <td class="total-row" style="text-align: right">
                  ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.valor || 0)}
                </td>
              </tr>
            </tbody>
          </table>

          ${
            proposal.observacoes
              ? `
            <div class="description">
              <strong>Observações:</strong><br>
              ${proposal.observacoes.replace(/\n/g, '<br>')}
            </div>
          `
              : ''
          }

          <div class="signatures">
            <div class="signature-block">
              <div class="role">${proposal.signatory?.cargo || 'Representante'} - ${proposal.company?.razao_social || 'Sua Empresa'}</div>
              <div class="cnpj">CNPJ: ${proposal.company?.cnpj || 'Não informado'}</div>
              <div class="line"></div>
              <div class="name">${proposal.signatory?.name || ''}</div>
            </div>
            <div class="signature-block">
              <div class="role">${proposal.leads?.contato || 'Cliente'}${proposal.leads?.cargo ? ` - ${proposal.leads.cargo}` : ''}</div>
              <div class="cnpj">&nbsp;</div>
              <div class="line"></div>
              <div class="name">&nbsp;</div>
            </div>
          </div>

          <div class="footer">
            <p>Este documento foi gerado automaticamente pelo sistema ADAPTΔCRM.</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      toast({
        title: 'PDF Gerado',
        description: 'A janela de impressão foi aberta.',
      })
    } else {
      toast({
        title: 'Erro',
        description: 'Pop-up bloqueado. Permita pop-ups para gerar o PDF.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Aprovada</Badge>
        )
      case 'Rejeitada':
        return <Badge variant="destructive">Rejeitada</Badge>
      case 'Enviada':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Enviada</Badge>
      default:
        return <Badge variant="secondary">Rascunho</Badge>
    }
  }

  const filteredProposals = proposals.filter(
    (p) =>
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.leads?.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projects?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Propostas Comerciais
          </h1>
          <p className="text-muted-foreground">
            Gerencie orçamentos, crie propostas e exporte para PDF.
          </p>
        </div>
        <Button className="rounded-full shadow-lg" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova Proposta
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou cliente..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Histórico de Propostas</CardTitle>
          <CardDescription>
            Lista de todas as propostas geradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              Carregando propostas...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center h-24 text-muted-foreground"
                    >
                      Nenhuma proposta encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProposals.map((prop) => (
                    <TableRow key={prop.id}>
                      <TableCell className="font-medium">
                        {prop.titulo}
                      </TableCell>
                      <TableCell>{prop.projects?.name || '-'}</TableCell>
                      <TableCell>
                        {prop.leads?.empresa || 'Sem Cliente'}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(prop.valor)}
                      </TableCell>
                      <TableCell>
                        {prop.validade
                          ? new Date(prop.validade).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(prop.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Gerar PDF"
                            onClick={() => generatePDF(prop)}
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar Detalhes"
                            onClick={() => handleEdit(prop)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProposalFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingProposal}
      />
    </div>
  )
}
