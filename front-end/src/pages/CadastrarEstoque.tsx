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
  Package,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Warehouse,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const stockItems = [
  {
    id: "STK-001",
    name: "Milho Híbrido Premium",
    category: "Milho",
    quantity: 15000,
    unit: "kg",
    warehouse: "Armazém Central - Recife",
    lastUpdate: "07/01/2025",
    status: "Normal",
    minStock: 5000,
  },
  {
    id: "STK-002",
    name: "Feijão Carioca Orgânico",
    category: "Feijão",
    quantity: 3200,
    unit: "kg",
    warehouse: "Armazém Norte - Caruaru",
    lastUpdate: "06/01/2025",
    status: "Baixo",
    minStock: 4000,
  },
  {
    id: "STK-003",
    name: "Soja Transgênica RR",
    category: "Soja",
    quantity: 22000,
    unit: "kg",
    warehouse: "Armazém Central - Recife",
    lastUpdate: "05/01/2025",
    status: "Normal",
    minStock: 8000,
  },
  {
    id: "STK-004",
    name: "Milho Crioulo",
    category: "Milho",
    quantity: 8500,
    unit: "kg",
    warehouse: "Armazém Sul - Garanhuns",
    lastUpdate: "04/01/2025",
    status: "Normal",
    minStock: 3000,
  },
  {
    id: "STK-005",
    name: "Feijão Preto Premium",
    category: "Feijão",
    quantity: 1200,
    unit: "kg",
    warehouse: "Armazém Norte - Caruaru",
    lastUpdate: "03/01/2025",
    status: "Crítico",
    minStock: 2500,
  },
];

const statusConfig: Record<string, { class: string; icon: typeof TrendingUp }> = {
  "Normal": { class: "status-success", icon: TrendingUp },
  "Baixo": { class: "status-warning", icon: AlertTriangle },
  "Crítico": { class: "status-error", icon: AlertTriangle },
};

const CadastrarEstoque = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("todos");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Item cadastrado",
      description: "O item foi adicionado ao estoque com sucesso.",
    });
    setIsDialogOpen(false);
  };

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "todos" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalStock = stockItems.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockItems = stockItems.filter((item) => item.status !== "Normal").length;

  return (
    <DashboardLayout 
      title="Cadastrar Estoque" 
      subtitle="Gerencie o inventário de sementes nos armazéns"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100">
            <Package className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{stockItems.length}</p>
            <p className="text-sm text-muted-foreground">Itens cadastrados</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100">
            <Warehouse className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{(totalStock / 1000).toFixed(1)}t</p>
            <p className="text-sm text-muted-foreground">Estoque total</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100">
            <AlertTriangle className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{lowStockItems}</p>
            <p className="text-sm text-muted-foreground">Estoque baixo/crítico</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100">
            <MapPin className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">3</p>
            <p className="text-sm text-muted-foreground">Armazéns ativos</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-card rounded-2xl p-4 mb-6 shadow-soft border border-border/50 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nome, ID ou armazém..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as categorias</SelectItem>
            <SelectItem value="Milho">Milho</SelectItem>
            <SelectItem value="Feijão">Feijão</SelectItem>
            <SelectItem value="Soja">Soja</SelectItem>
            <SelectItem value="Arroz">Arroz</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-2">
              <Plus size={18} />
              Cadastrar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="text-primary" size={20} />
                Cadastrar Novo Item no Estoque
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Nome do Item
                </label>
                <Input placeholder="Ex: Milho Híbrido Premium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Categoria
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
                    Unidade
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="ton">Tonelada (t)</SelectItem>
                      <SelectItem value="saco">Saco (50kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Quantidade Inicial
                  </label>
                  <Input type="number" placeholder="15000" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Estoque Mínimo
                  </label>
                  <Input type="number" placeholder="5000" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Armazém
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o armazém" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Armazém Central - Recife</SelectItem>
                    <SelectItem value="norte">Armazém Norte - Caruaru</SelectItem>
                    <SelectItem value="sul">Armazém Sul - Garanhuns</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">
                  Observações
                </label>
                <Textarea 
                  placeholder="Informações adicionais sobre o lote..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Cadastrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Table */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Nome / Categoria</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Quantidade</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Armazém</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Última Atualização</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const statusInfo = statusConfig[item.status];
                const stockPercentage = (item.quantity / item.minStock) * 100;
                
                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 text-sm font-medium text-card-foreground">{item.id}</td>
                    <td className="py-3 px-2">
                      <div className="text-sm font-medium text-card-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-sm font-medium text-card-foreground">
                        {item.quantity.toLocaleString()} {item.unit}
                      </div>
                      <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            stockPercentage >= 100 ? "bg-emerald-500" :
                            stockPercentage >= 50 ? "bg-amber-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Min: {item.minStock.toLocaleString()} {item.unit}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Warehouse size={14} />
                        {item.warehouse}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        {item.lastUpdate}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={cn("status-badge", statusInfo.class)}>
                        {item.status}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhum item encontrado</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Mostrando {filteredItems.length} de {stockItems.length} itens
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

export default CadastrarEstoque;
