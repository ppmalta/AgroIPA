import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { 
  Package, 
  CheckCircle, 
  Truck, 
  BarChart3,
  Download,
  Printer,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const Dashboard = () => {
  return (
    <DashboardLayout 
      title="Visão geral" 
      subtitle="Monitoramento em tempo real do sistema"
    >
      {/* Filters Bar */}
      <div className="bg-card rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4 shadow-soft border border-border/50">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>🔧 Filtros:</span>
        </div>
        
        <Select defaultValue="todos">
          <SelectTrigger className="w-40 bg-accent text-accent-foreground border-0 rounded-full">
            <SelectValue placeholder="Todos os grãos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os grãos</SelectItem>
            <SelectItem value="milho">Milho</SelectItem>
            <SelectItem value="feijao">Feijão</SelectItem>
            <SelectItem value="soja">Soja</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="atualmente">
          <SelectTrigger className="w-36 bg-accent text-accent-foreground border-0 rounded-full">
            <SelectValue placeholder="Atualmente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="atualmente">Atualmente</SelectItem>
            <SelectItem value="7dias">Últimos 7 dias</SelectItem>
            <SelectItem value="30dias">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="todos-armazens">
          <SelectTrigger className="w-44 bg-accent text-accent-foreground border-0 rounded-full">
            <SelectValue placeholder="Todos os armazéns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos-armazens">Todos os armazéns</SelectItem>
            <SelectItem value="norte">Centro Norte</SelectItem>
            <SelectItem value="sul">Centro Sul</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Atualização automática</span>
          <Switch defaultChecked />
          <span className="text-xs font-medium text-primary">LIGADA</span>
        </div>

        <Button variant="ghost" size="icon">
          <Download size={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <Printer size={18} />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          icon={<Package size={20} />}
          title="Estoque total"
          value="127.500"
          subtitle="unidades"
          trend={{ value: 8.2, label: "em relação ao último período." }}
          variant="success"
        />
        <KPICard
          icon={<CheckCircle size={20} />}
          title="Taxa de cumprimento"
          value="94,8%"
          trend={{ value: 2.1, label: "em relação ao último período." }}
          variant="success"
        />
        <KPICard
          icon={<Truck size={20} />}
          title="Remessas Ativas"
          value="40"
          subtitle="remessas"
          trend={{ value: 12.5, label: "em relação ao último período." }}
          variant="info"
        />
        <KPICard
          icon={<BarChart3 size={20} />}
          title="Desempenho de entregas"
          value="87,3%"
          trend={{ value: -5.7, label: "em relação ao último período." }}
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-soft border border-border/50">
          <h3 className="font-semibold text-card-foreground mb-4">
            Rede da Cadeia de Abastecimento
          </h3>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Ideal
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              Estoque alto
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              Estoque baixo
            </div>
          </div>
          <div className="h-64 bg-muted/50 rounded-xl flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Mapa Interativo</p>
              <p className="text-sm">Região Nordeste - Pernambuco</p>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <AlertsPanel />
      </div>

      {/* Transactions Table */}
      <TransactionsTable />

      {/* Footer Status */}
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Status do sistema: Operacional
        </div>
        <div>
          Última sincronização de dados: 23:19:34
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
