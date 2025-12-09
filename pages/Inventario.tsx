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
  Download, 
  FileSpreadsheet, 
  Save, 
  Plus, 
  RefreshCw,
  ChevronDown,
  TrendingUp,
  Clock,
  Target,
  DollarSign
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const inventoryData = [
  { month: "Jan", milho: 14000, feijao: 8000 },
  { month: "Fev", milho: 12000, feijao: 7500 },
  { month: "Mar", milho: 15000, feijao: 9000 },
  { month: "Abr", milho: 11000, feijao: 8500 },
  { month: "Mai", milho: 13000, feijao: 7000 },
  { month: "Jun", milho: 10000, feijao: 6500 },
  { month: "Jul", milho: 9000, feijao: 5500 },
  { month: "Ago", milho: 11000, feijao: 6000 },
  { month: "Set", milho: 12000, feijao: 7000 },
  { month: "Out", milho: 16000, feijao: 8500 },
];

const trendData = [
  { month: "Jan", "2024": 14000, "2023": 12000, "2022": 11000 },
  { month: "Fev", "2024": 13500, "2023": 11500, "2022": 10500 },
  { month: "Mar", "2024": 14500, "2023": 13000, "2022": 12000 },
  { month: "Abr", "2024": 13000, "2023": 12500, "2022": 11500 },
  { month: "Mai", "2024": 14000, "2023": 13500, "2022": 12500 },
  { month: "Jun", "2024": 12000, "2023": 11000, "2022": 10000 },
  { month: "Jul", "2024": 11000, "2023": 10500, "2022": 9500 },
  { month: "Ago", "2024": 12500, "2023": 11500, "2022": 10500 },
  { month: "Sep", "2024": 13500, "2023": 12500, "2022": 11500 },
  { month: "Oct", "2024": 15000, "2023": 14000, "2022": 13000 },
  { month: "Nov", "2024": 14500, "2023": 13500, "2022": 12500 },
  { month: "Dec", "2024": 15500, "2023": 14500, "2022": 13500 },
];

const Inventario = () => {
  return (
    <DashboardLayout 
      title="Inventário" 
      subtitle="Painel de análise de inventário"
    >
      {/* Header Actions */}
      <div className="bg-accent text-accent-foreground rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <div>
            <h3 className="font-semibold">Painel de análise de inventário</h3>
            <p className="text-xs opacity-80">Insights profundos sobre padrões de estoque de sementes, taxas de rotatividade e previsão preditiva</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <Download size={16} />
            Exportar PDF
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <FileSpreadsheet size={16} />
            Exportar Excel
          </Button>
          <Button variant="success" size="sm" className="gap-2">
            <Save size={16} />
            Salvar configuração
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 mb-6 shadow-soft border border-border/50">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            ⚙️ Filtros Avançados
          </span>
          
          <div className="flex flex-wrap gap-4 flex-1">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Intervalo de datas</label>
              <Select defaultValue="30dias">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Variedade de culturas</label>
              <Select defaultValue="todas">
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Selecione variedades...</SelectItem>
                  <SelectItem value="milho">Milho</SelectItem>
                  <SelectItem value="feijao">Feijão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Armazém</label>
              <Select defaultValue="todos">
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os armazéns</SelectItem>
                  <SelectItem value="norte">Centro Norte</SelectItem>
                  <SelectItem value="sul">Centro Sul</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus size={16} />
              Cadastrar
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <RefreshCw size={16} />
              Redefinir
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              Expandir
              <ChevronDown size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Volume de negócios de inventário</span>
            </div>
            <span className="text-xs text-red-500">↗ -5,2%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Confiança: 95%</p>
          <p className="text-3xl font-bold text-card-foreground">4,2x</p>
          <p className="text-xs text-red-600 mt-1">Rácio de volume de negócios anual</p>
        </div>

        <div className="kpi-card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Dias de Fornecimento</span>
            </div>
            <span className="text-xs text-emerald-500">↗ -5,2%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Confiança: 95%</p>
          <p className="text-3xl font-bold text-card-foreground">87 dias</p>
          <p className="text-xs text-emerald-600 mt-1">Duração atual do estoque</p>
        </div>

        <div className="kpi-card border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Precisão da previsão</span>
            </div>
            <span className="text-xs text-amber-500">↗ -5,2%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Confiança: 95%</p>
          <p className="text-3xl font-bold text-card-foreground">94,3%</p>
          <p className="text-xs text-amber-600 mt-1">Precisão de previsão</p>
        </div>

        <div className="kpi-card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Custo por unidade</span>
            </div>
            <span className="text-xs text-emerald-500">↗ -5,2%</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Confiança: 89%</p>
          <p className="text-3xl font-bold text-card-foreground">R$ 2,45</p>
          <p className="text-xs text-emerald-600 mt-1">Custo unitário médio</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Inventory Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-soft border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-card-foreground">Níveis de estoque e análise de faturamento</h3>
              <p className="text-xs text-muted-foreground">Visão combinada das quantidades de estoque com sobreposição da taxa de rotatividade</p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm">Visão combinada</Button>
              <Button variant="ghost" size="sm">Somente milho</Button>
              <Button variant="ghost" size="sm">Somente feijão</Button>
            </div>
          </div>
          
          <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              Inventário de milho
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500" />
              Inventário de feijão
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-orange-500" />
              Taxa de rotatividade
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={inventoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Bar dataKey="milho" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="feijao" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Predictive Analysis */}
        <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
          <h3 className="font-semibold text-card-foreground mb-4">Análise Preditiva</h3>
          <div className="flex gap-2 mb-4">
            <Button variant="default" size="sm">Milho</Button>
            <Button variant="ghost" size="sm">Feijão</Button>
          </div>
          
          <div className="h-32 bg-muted/30 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Gráfico de previsão</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                <span>⚠️</span> Recomendações
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Reordenar recomendado até 1º de dezembro
              </p>
              <span className="text-xs font-medium text-amber-500">MÉDIO</span>
            </div>
            
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-600">
                Monitorar padrões de demanda sazonal
              </p>
              <span className="text-xs font-medium text-emerald-500">BAIXO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Trends */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-card-foreground">Análise de tendências sazonais</h3>
            <p className="text-xs text-muted-foreground">Padrões históricos e variações sazonais com seleção interativa de pincéis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm">Níveis de inventário</Button>
            <Button variant="ghost" size="sm">Taxa de rotatividade</Button>
            <Button variant="ghost" size="sm">Volume de demanda</Button>
          </div>
        </div>

        <div className="flex gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            2024
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500" />
            2023
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500" />
            2022
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }} 
            />
            <Line type="monotone" dataKey="2024" stroke="hsl(142, 70%, 45%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="2023" stroke="hsl(45, 93%, 47%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="2022" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">●</span>
            Feed de dados ao vivo ativo
            <span>⏱️ Última atualização: 09:28:30</span>
          </div>
          <div className="flex items-center gap-4">
            <span>📦 Processamento em lote: concluído</span>
            <span>✓ Integridade dos dados: verificada</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventario;
