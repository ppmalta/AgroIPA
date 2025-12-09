import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock,
  Truck,
  MapPin,
  Star,
  User,
  Plus,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Eye,
  Flame,
  Layers,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryMap } from "@/components/maps/DeliveryMap";

const agentData = [
  {
    name: "Mike Johnson",
    route: "Rota do Brooklyn",
    status: "Ativa",
    badge: "melhor desempenho",
    badgeColor: "bg-emerald-100 text-emerald-700",
    punctuality: "100%",
    rating: "4.9",
    deliveries: 24,
    efficiency: "98,5%",
  },
  {
    name: "Sarah Chen",
    route: "Rota de Manhattan",
    status: "Ativa",
    badge: "confiável",
    badgeColor: "bg-blue-100 text-blue-700",
    punctuality: "94%",
    rating: "4.7",
    deliveries: 18,
    efficiency: "94,2%",
  },
  {
    name: "Carlos Rodriguez",
    route: "Rota da Rainha",
    status: "Ativa",
    badge: "consistente",
    badgeColor: "bg-amber-100 text-amber-700",
    punctuality: "91%",
    rating: "4.6",
    deliveries: 22,
    efficiency: "91,8%",
  },
];

const deliveryQueue = [
  {
    company: "Brooklyn Seed Co.",
    address: "123 Rua Surubim, Capibaribe, São Lourenço da Mata - PE",
    product: "Sementes de milho - Qualidade Premium • 50 sacos",
    price: "R$ 2.450",
    priority: "Alta",
    priorityColor: "bg-red-100 text-red-700",
    status: "Pendente",
    statusColor: "text-amber-600",
    agent: null,
    eta: "45 minutos",
  },
  {
    company: "Manhattan Farm Supply",
    address: "456 Rua do Sossego, Gravatá Centro, Gravatá - PE",
    product: "Sementes de Feijão - Mix Orgânico • 30 sacos",
    price: "R$ 1.890",
    priority: "Médio",
    priorityColor: "bg-amber-100 text-amber-700",
    status: "Atribuído",
    statusColor: "text-amber-600",
    agent: "Sarah Chen",
    eta: "35 minutos",
  },
  {
    company: "Centro Agrícola de Queens",
    address: "789 Rua Pantera Emília, Matriz, Vitória de Santo Antão - PE",
    product: "Pacote de Sementes Mistas • 25 sacos",
    price: "R$ 1.275",
    priority: "Baixo",
    priorityColor: "bg-emerald-100 text-emerald-700",
    status: "Em Trânsito",
    statusColor: "text-blue-600",
    agent: "Mike Johnson",
    eta: "55 minutos",
  },
];

const Distribuicao = () => {
  const [showRoutes, setShowRoutes] = useState(true);
  const [viewMode, setViewMode] = useState<"routes" | "heatmap" | "clusters">("routes");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  return (
    <DashboardLayout 
      title="Desempenho de distribuição" 
      subtitle="Monitoramento logístico e rastreamento de entregas"
    >
      {/* Top Filters */}
      <div className="bg-card rounded-2xl p-4 mb-6 shadow-soft border border-border/50 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span>🔧 Filtros:</span>
          <Select defaultValue="todas">
            <SelectTrigger className="w-40 bg-secondary border-0 rounded-full">
              <SelectValue placeholder="Todas as entregas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as entregas</SelectItem>
              <SelectItem value="pendentes">Pendentes</SelectItem>
              <SelectItem value="transito">Em trânsito</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="todos">
            <SelectTrigger className="w-40 bg-secondary border-0 rounded-full">
              <SelectValue placeholder="Todos os agentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os agentes</SelectItem>
              <SelectItem value="mike">Mike Johnson</SelectItem>
              <SelectItem value="sarah">Sarah Chen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="default" size="sm" className="gap-2">
          Otimização de Rotas
        </Button>
        <span className="status-badge status-success">Ativo</span>

        <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
          <span>Em tempo real</span>
          <span>✓ Atualizar</span>
          <Download size={16} />
          <Button variant="destructive" size="sm">Emergência</Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2 text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Sistema Online
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          12 Rotas Ativas
        </div>
        <div className="flex items-center gap-2">
          <User size={14} />
          5 Agentes Online
        </div>
        <div className="flex items-center gap-2 text-amber-600">
          <Clock size={14} />
          3 Atrasado
        </div>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={14} />
          1 Alertas
        </div>
        <div className="flex items-center gap-2 text-emerald-600 ml-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          GPS conectado
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800">Alerta de desvio de rota</h4>
          <p className="text-sm text-amber-700">O agente Mike Johnson está com 15 minutos de atraso na DEL-003. Há relatos de congestionamento no trânsito da Ponte do Brooklyn.</p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" size="sm">👤 Agente de atendimento</Button>
            <Button variant="outline" size="sm">📍 Sugestão de rota</Button>
            <Button variant="ghost" size="sm">✕ Liberar</Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          icon={<Clock size={20} />}
          title="Taxa de entrega no prazo"
          value="94,2%"
          subtitle="/ 95%"
          trend={{ value: 2.1, label: "Entregas concluídas dentro do prazo prometido" }}
          variant="success"
        />
        <KPICard
          icon={<Truck size={20} />}
          title="Tempo médio de entrega"
          value="2,4"
          subtitle="horas / 2,0 horas"
          trend={{ value: -0.3, label: "Tempo médio entre o despacho e a entrega" }}
          variant="warning"
        />
        <KPICard
          icon={<User size={20} />}
          title="Pontuação de produtividade do agente"
          value="87"
          subtitle="/ 5 / 90"
          trend={{ value: 0.2, label: "Pontuação composta de eficiência de entrega" }}
          variant="info"
        />
        <KPICard
          icon={<CheckCircle size={20} />}
          title="Eficiência da rota"
          value="91,8%"
          subtitle="/ 92%"
          trend={{ value: 1.5, label: "Porcentagem ideal de adesão à rota" }}
          variant="success"
        />
      </div>

      {/* Map Section */}
      <div className={cn(
        "bg-card rounded-2xl p-5 mb-6 shadow-soft border border-border/50",
        isFullscreen && "fixed inset-4 z-50"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground">Mapa de entregas ao vivo</h3>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "routes" ? "default" : "ghost"} 
              size="sm"
              onClick={() => { setViewMode("routes"); setShowRoutes(true); }}
            >
              <MapPin size={14} className="mr-1" />
              Rotas
            </Button>
            <Button 
              variant={viewMode === "heatmap" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("heatmap")}
            >
              <Flame size={14} className="mr-1" />
              Mapa de calor
            </Button>
            <Button 
              variant={viewMode === "clusters" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("clusters")}
            >
              <Layers size={14} className="mr-1" />
              Aglomerados
            </Button>
            <div className="border-l border-border mx-2" />
            <Button variant="outline" size="sm">🚦 Tráfego</Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 size={14} className="mr-1" />
              {isFullscreen ? "Sair" : "Tela cheia"}
            </Button>
          </div>
        </div>

        <DeliveryMap 
          showRoutes={showRoutes} 
          className={isFullscreen ? "h-[calc(100vh-200px)]" : "h-80"}
        />

        <div className="grid grid-cols-4 gap-4 text-center mt-4">
          <div>
            <p className="text-2xl font-bold text-card-foreground">3</p>
            <p className="text-xs text-muted-foreground">Rotas ativas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">127,4 km</p>
            <p className="text-xs text-muted-foreground">Distância total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">4,2 horas</p>
            <p className="text-xs text-muted-foreground">Previsão de conclusão</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">R$ 2.340</p>
            <p className="text-xs text-muted-foreground">Custo combustível hoje</p>
          </div>
        </div>
      </div>

      {/* Agents Classification */}
      <div className="bg-card rounded-2xl p-5 mb-6 shadow-soft border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground">Classificação dos Agentes</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ordenar por:</span>
            <Button variant="default" size="sm">Pontuação de desempenho</Button>
            <Button variant="ghost" size="sm">Contagem de entregas</Button>
            <Button variant="ghost" size="sm">Avaliação do cliente</Button>
            <Button variant="ghost" size="sm">Taxa de pontualidade</Button>
            <div className="border-l border-border mx-2" />
            <span className="text-sm text-muted-foreground">Hoje</span>
            <Button variant="outline" size="sm" className="gap-1">
              <RefreshCw size={14} />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {agentData.map((agent, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-1 text-amber-500">
                {idx === 0 && "🥇"}
                {idx === 1 && "🥈"}
                {idx === 2 && "🥉"}
              </div>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-card-foreground">{agent.name}</span>
                  <span className={cn("status-badge text-xs", agent.badgeColor)}>
                    ✓ {agent.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{agent.route} • {agent.status}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-card-foreground">{agent.punctuality}</p>
                <p className="text-xs text-muted-foreground">Taxa de pontualidade</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-card-foreground flex items-center justify-center gap-1">
                  {agent.rating} <Star size={14} className="text-amber-500 fill-amber-500" />
                </p>
                <p className="text-xs text-muted-foreground">Avaliação do cliente</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-card-foreground">{agent.deliveries}</p>
                <p className="text-xs text-muted-foreground">Entregas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-600">{agent.efficiency}</p>
                <p className="text-xs text-muted-foreground">{agent.deliveries} entregas</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <MapPin size={16} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Eye size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">5 agentes ativos • Atualizado há 2 minutos</span>
          <Button variant="outline" size="sm" className="gap-2">
            <User size={14} />
            Gerenciar equipe
          </Button>
        </div>
      </div>

      {/* Delivery Queue */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground">Fila de entrega</h3>
          <div className="flex items-center gap-4">
            <Select defaultValue="todas">
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="default" size="sm" className="gap-2">
              <Plus size={14} />
              Nova entrega
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4 text-center">
          <div className="p-3 bg-muted/30 rounded-xl">
            <p className="text-2xl font-bold text-card-foreground">2</p>
            <p className="text-xs text-muted-foreground">Pendente</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl">
            <p className="text-2xl font-bold text-card-foreground">2</p>
            <p className="text-xs text-muted-foreground">Atribuído</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl">
            <p className="text-2xl font-bold text-card-foreground">1</p>
            <p className="text-xs text-muted-foreground">Em trânsito</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-xl">
            <p className="text-2xl font-bold text-card-foreground">2</p>
            <p className="text-xs text-muted-foreground">Alta prioridade</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Detalhes da entrega</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Prioridade</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Agente</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">ETA</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {deliveryQueue.map((delivery, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2">
                    <div className="font-medium text-sm text-card-foreground">{delivery.company}</div>
                    <div className="text-xs text-muted-foreground">{delivery.address}</div>
                    <div className="text-xs text-muted-foreground mt-1">{delivery.product}</div>
                    <div className="text-xs font-medium text-card-foreground">{delivery.price}</div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={cn("status-badge", delivery.priorityColor)}>
                      ⚠ {delivery.priority}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={cn("text-sm font-medium", delivery.statusColor)}>
                      ● {delivery.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {delivery.agent ? (
                      <span className="text-sm">{delivery.agent}</span>
                    ) : (
                      <Button variant="link" size="sm" className="p-0 h-auto text-info">
                        Selecione o agente ✏️ Atribuir
                      </Button>
                    )}
                  </td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">{delivery.eta}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MapPin size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Exibindo 5 de 5 entregas</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={14} />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw size={14} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Distribuicao;
