import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter,
  Leaf,
  Package,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const seedRequests = [
  {
    id: "REQ-2025-001",
    type: "Milho",
    variety: "Híbrido Premium",
    quantity: "500 kg",
    requester: "Cooperativa Agrícola Centro-Oeste",
    destination: "Gravatá, PE",
    date: "07/01/2025",
    status: "Aprovado",
  },
  {
    id: "REQ-2025-002",
    type: "Feijão",
    variety: "Carioca Orgânico",
    quantity: "300 kg",
    requester: "Associação de Agricultores Familiares",
    destination: "Caruaru, PE",
    date: "06/01/2025",
    status: "Pendente",
  },
  {
    id: "REQ-2025-003",
    type: "Soja",
    variety: "Transgênica RR",
    quantity: "800 kg",
    requester: "Fazenda Boa Vista",
    destination: "Petrolina, PE",
    date: "05/01/2025",
    status: "Em Análise",
  },
  {
    id: "REQ-2025-004",
    type: "Milho",
    variety: "Crioulo",
    quantity: "200 kg",
    requester: "Comunidade Rural Serra Azul",
    destination: "Garanhuns, PE",
    date: "04/01/2025",
    status: "Aprovado",
  },
  {
    id: "REQ-2025-005",
    type: "Feijão",
    variety: "Preto Premium",
    quantity: "450 kg",
    requester: "Cooperativa Nordeste Verde",
    destination: "Arcoverde, PE",
    date: "03/01/2025",
    status: "Entregue",
  },
];

const statusConfig: Record<string, string> = {
  "Aprovado": "status-success",
  "Pendente": "status-warning",
  "Em Análise": "status-info",
  "Entregue": "status-success",
  "Rejeitado": "status-error",
};

const SolicitarSementes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de sementes foi registrada com sucesso.",
    });
    setIsDialogOpen(false);
  };

  const filteredRequests = seedRequests.filter((req) => {
    const matchesSearch = req.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "todos" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout 
      title="Solicitar sementes" 
      subtitle="Gerencie solicitações de distribuição de sementes"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100">
            <Leaf className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">127</p>
            <p className="text-sm text-muted-foreground">Solicitações este mês</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100">
            <Package className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">45.200 kg</p>
            <p className="text-sm text-muted-foreground">Total solicitado</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100">
            <MapPin className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">23</p>
            <p className="text-sm text-muted-foreground">Municípios atendidos</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100">
            <CheckCircle className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">94%</p>
            <p className="text-sm text-muted-foreground">Taxa de aprovação</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-card rounded-2xl p-4 mb-6 shadow-soft border border-border/50 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por ID, tipo ou solicitante..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="Aprovado">Aprovado</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Em Análise">Em Análise</SelectItem>
            <SelectItem value="Entregue">Entregue</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-2">
              <Plus size={18} />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Leaf className="text-primary" size={20} />
                Nova Solicitação de Sementes
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Tipo de Semente
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milho">Milho</SelectItem>
                      <SelectItem value="feijao">Feijão</SelectItem>
                      <SelectItem value="soja">Soja</SelectItem>
                      <SelectItem value="arroz">Arroz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Variedade
                  </label>
                  <Input placeholder="Ex: Híbrido Premium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Quantidade (kg)
                  </label>
                  <Input type="number" placeholder="500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Data Necessária
                  </label>
                  <Input type="date" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Solicitante / Organização
                </label>
                <Input placeholder="Nome da cooperativa ou agricultor" />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Destino (Município, UF)
                </label>
                <Input placeholder="Ex: Gravatá, PE" />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Justificativa
                </label>
                <Textarea 
                  placeholder="Descreva o motivo da solicitação e como as sementes serão utilizadas..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Enviar Solicitação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Requests Table */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Tipo / Variedade</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Quantidade</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Solicitante</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Destino</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2 text-sm font-medium text-card-foreground">{request.id}</td>
                  <td className="py-3 px-2">
                    <div className="text-sm font-medium text-card-foreground">{request.type}</div>
                    <div className="text-xs text-muted-foreground">{request.variety}</div>
                  </td>
                  <td className="py-3 px-2 text-sm text-card-foreground">{request.quantity}</td>
                  <td className="py-3 px-2 text-sm text-card-foreground max-w-xs truncate">{request.requester}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin size={14} />
                      {request.destination}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {request.date}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={cn("status-badge", statusConfig[request.status])}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye size={16} className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit size={16} className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Leaf size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhuma solicitação encontrada</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Mostrando {filteredRequests.length} de {seedRequests.length} solicitações
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>← Anterior</Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">Próximo →</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SolicitarSementes;
