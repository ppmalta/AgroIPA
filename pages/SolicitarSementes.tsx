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
import { Skeleton } from "@/components/ui/skeleton";
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
  CheckCircle,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import AddressInput from "@/components/AddressInput";
import { 
  useSeedRequests, 
  useSeedTypes, 
  useCreateSeedRequest,
  useDeleteSeedRequest,
  mapStatusToDisplay 
} from "@/hooks/useSeedRequests";
import { format } from "date-fns";

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
  
  // Form state
  const [seedTypeId, setSeedTypeId] = useState<string>("");
  const [variety, setVariety] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [neededByDate, setNeededByDate] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterOrganization, setRequesterOrganization] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationCoordinates, setDestinationCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [justification, setJustification] = useState("");

  // API hooks
  const { data: seedRequests, isLoading, isError, refetch } = useSeedRequests();
  const { data: seedTypes } = useSeedTypes();
  const createMutation = useCreateSeedRequest();
  const deleteMutation = useDeleteSeedRequest();

  const resetForm = () => {
    setSeedTypeId("");
    setVariety("");
    setQuantityKg("");
    setNeededByDate("");
    setRequesterName("");
    setRequesterOrganization("");
    setDestinationAddress("");
    setDestinationCoordinates(null);
    setJustification("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seedTypeId || !variety || !quantityKg || !neededByDate || !requesterName || !destinationAddress) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        seed_type_id: parseInt(seedTypeId),
        variety,
        quantity_kg: parseFloat(quantityKg),
        requester_name: requesterName,
        requester_organization: requesterOrganization || undefined,
        destination_address: destinationAddress,
        destination_latitude: destinationCoordinates?.lat,
        destination_longitude: destinationCoordinates?.lng,
        needed_by_date: neededByDate,
        justification: justification || undefined,
      });
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta solicitação?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // Filter requests
  const filteredRequests = (seedRequests || []).filter((req) => {
    const displayStatus = mapStatusToDisplay(req.status);
    const matchesSearch = 
      req.seed_type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.request_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "todos" || displayStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const totalRequests = seedRequests?.length || 0;
  const totalQuantity = seedRequests?.reduce((sum, r) => sum + r.quantity_kg, 0) || 0;
  const uniqueDestinations = new Set(seedRequests?.map(r => r.destination_address.split(',')[0])).size;
  const approvalRate = totalRequests > 0 
    ? Math.round((seedRequests?.filter(r => r.status === 'approved' || r.status === 'delivered').length || 0) / totalRequests * 100)
    : 0;

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
            <p className="text-2xl font-bold text-card-foreground">{totalRequests}</p>
            <p className="text-sm text-muted-foreground">Solicitações total</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100">
            <Package className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">
              {totalQuantity.toLocaleString('pt-BR')} kg
            </p>
            <p className="text-sm text-muted-foreground">Total solicitado</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100">
            <MapPin className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{uniqueDestinations}</p>
            <p className="text-sm text-muted-foreground">Destinos únicos</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100">
            <CheckCircle className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{approvalRate}%</p>
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

        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>

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
                    Tipo de Semente *
                  </label>
                  <Select value={seedTypeId} onValueChange={setSeedTypeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {seedTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                      {!seedTypes?.length && (
                        <>
                          <SelectItem value="1">Milho</SelectItem>
                          <SelectItem value="2">Feijão</SelectItem>
                          <SelectItem value="3">Soja</SelectItem>
                          <SelectItem value="4">Arroz</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Variedade *
                  </label>
                  <Input 
                    placeholder="Ex: Híbrido Premium" 
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Quantidade (kg) *
                  </label>
                  <Input 
                    type="number" 
                    placeholder="500" 
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Data Necessária *
                  </label>
                  <Input 
                    type="date" 
                    value={neededByDate}
                    onChange={(e) => setNeededByDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Solicitante *
                </label>
                <Input 
                  placeholder="Nome do solicitante" 
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Organização
                </label>
                <Input 
                  placeholder="Nome da cooperativa ou associação (opcional)" 
                  value={requesterOrganization}
                  onChange={(e) => setRequesterOrganization(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Destino (Município, UF) *
                </label>
                <AddressInput
                  value={destinationAddress}
                  onChange={setDestinationAddress}
                  onCoordinatesChange={setDestinationCoordinates}
                  placeholder="Ex: Gravatá, PE"
                />
                {destinationCoordinates && (
                  <p className="text-xs text-muted-foreground mt-1">
                    As coordenadas serão usadas para otimizar a rota de entrega.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Justificativa
                </label>
                <Textarea 
                  placeholder="Descreva o motivo da solicitação e como as sementes serão utilizadas..."
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enviar Solicitação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Requests Table */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
        {isError ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Erro ao carregar solicitações</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <>
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
                  {filteredRequests.map((request) => {
                    const displayStatus = mapStatusToDisplay(request.status);
                    return (
                      <tr key={request.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 text-sm font-medium text-card-foreground">
                          {request.request_number}
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm font-medium text-card-foreground">{request.seed_type.name}</div>
                          <div className="text-xs text-muted-foreground">{request.variety}</div>
                        </td>
                        <td className="py-3 px-2 text-sm text-card-foreground">
                          {request.quantity_kg.toLocaleString('pt-BR')} kg
                        </td>
                        <td className="py-3 px-2 text-sm text-card-foreground max-w-xs truncate">
                          {request.requester_name}
                          {request.requester_organization && (
                            <div className="text-xs text-muted-foreground">{request.requester_organization}</div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin size={14} />
                            {request.destination_address}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar size={14} />
                            {format(new Date(request.created_at), 'dd/MM/yyyy')}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={cn("status-badge", statusConfig[displayStatus])}>
                            {displayStatus}
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
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(request.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                Mostrando {filteredRequests.length} de {seedRequests?.length || 0} solicitações
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>← Anterior</Button>
                <Button variant="default" size="sm">1</Button>
                <Button variant="outline" size="sm">Próximo →</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SolicitarSementes;
