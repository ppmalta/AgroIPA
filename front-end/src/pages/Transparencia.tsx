import { 
  Leaf, 
  Package, 
  CheckCircle, 
  Shield,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  FileText,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const metricsData = [
  {
    label: "Sementes Distribuídas",
    value: "2,8 milhões",
    subtitle: "sementes",
    description: "Total de sementes distribuídas aos agricultores e organizações agrícolas em todas as regiões",
    trend: "+12,3%",
    icon: Leaf,
  },
  {
    label: "Taxa de sucesso de entrega",
    value: "97,8%",
    description: "Porcentagem de entregas bem-sucedidas concluídas no prazo e em boas condições",
    trend: "+2,1%",
    icon: Package,
  },
  {
    label: "Conformidade de Qualidade",
    value: "99,2%",
    description: "Sementes que atendem ou excedem os padrões de qualidade e requisitos de certificação",
    trend: "+0,8%",
    icon: CheckCircle,
  },
];

const activityData = [
  {
    type: "success",
    title: "Entrega concluída com sucesso",
    description: "Sementes de milho entregues à cooperativa agrícola da região Centro-Oeste",
    location: "Região Centro-Oeste",
    quantity: "2.560 sementes",
    time: "Concluído há 45 minutos atrás",
  },
  {
    type: "info",
    title: "Certificação de Qualidade Renovada",
    description: "Lote de sementes de feijão passou em todos os padrões de conformidade de qualidade",
    location: "Região Sudeste",
    time: "Certificado há 2h atrás",
  },
  {
    type: "success",
    title: "Novo Centro de Distribuição Ativo",
    description: "Cobertura expandida para atender comunidades agrícolas rurais",
    location: "Região Sudoeste",
    quantity: "Aumento de cobertura de 15%",
    time: "Ativo há 4h atrás",
  },
];

const tableData = [
  { data: "07/01/2025", regiao: "Centro-Oeste", tipo: "Milho", sementes: "125.000", sucesso: "98,5%", qualidade: "99,2%", agricultores: 45, tempo: "2,3 dias", status: "Compatível" },
  { data: "06/01/2025", regiao: "Sudoeste", tipo: "Milho", sementes: "67.000", sucesso: "94,2%", qualidade: "97,9%", agricultores: 28, tempo: "3,1 dias", status: "Em revisão" },
  { data: "06/01/2025", regiao: "Sudeste", tipo: "Feijão", sementes: "89.000", sucesso: "96,8%", qualidade: "98,7%", agricultores: 32, tempo: "2,8 dias", status: "Compatível" },
  { data: "05/01/2025", regiao: "Noroeste", tipo: "Milho", sementes: "34.000", sucesso: "95,1%", qualidade: "98,3%", agricultores: 15, tempo: "2,9 dias", status: "Compatível" },
  { data: "05/01/2025", regiao: "Nordeste", tipo: "Feijão", sementes: "45.000", sucesso: "97,9%", qualidade: "99,5%", agricultores: 18, tempo: "2,1 dias", status: "Compatível" },
];

const Transparencia = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-card">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Transparência Pública</h1>
            <p className="text-sm text-muted-foreground">Responsabilidade pública e painel das partes interessadas</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/login")}>
            Fazer Login
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Panel Header */}
        <div className="bg-muted/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="text-primary mt-1" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">Painel de Transparência Pública</h2>
              <p className="text-sm text-muted-foreground">Acesso aberto a operações de distribuição de sementes e métricas de responsabilização</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} />
              USDA Orgânico Certificado
            </div>
            <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
              <Shield size={14} />
              ISO 9001 Compatível
            </div>
            <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} />
              Segurança de dados Verificada
            </div>
            <div className="ml-auto text-muted-foreground">
              Atualizado diariamente às 6h EST ●
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Tipo de corte</label>
            <Select defaultValue="todas">
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as culturas</SelectItem>
                <SelectItem value="milho">Milho</SelectItem>
                <SelectItem value="feijao">Feijão</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Região</label>
            <Select defaultValue="todas">
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as regiões</SelectItem>
                <SelectItem value="nordeste">Nordeste</SelectItem>
                <SelectItem value="sudeste">Sudeste</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end text-xs text-muted-foreground">
            <Shield size={14} className="mr-1" />
            Todos os dados são agregados e anonimizados para proteger a privacidade individual
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Principais métricas de transparência</h3>
          <p className="text-sm text-muted-foreground mb-4">Indicadores de desempenho essenciais para a responsabilização e confiança públicas</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metricsData.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="bg-card rounded-2xl p-5 border border-border shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <Icon className="text-emerald-600" size={20} />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <TrendingUp size={12} />
                      {metric.trend}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-card-foreground">
                    {metric.value}
                    {metric.subtitle && <span className="text-lg font-normal text-muted-foreground ml-1">{metric.subtitle}</span>}
                  </p>
                  <p className="text-sm font-medium text-card-foreground mt-1">{metric.label}</p>
                  <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                  <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
            <h3 className="font-semibold text-card-foreground mb-2">Cobertura de distribuição regional</h3>
            <p className="text-xs text-muted-foreground mb-4">Mapa interativo mostrando o desempenho da distribuição de sementes entre regiões</p>
            
            <div className="h-64 bg-muted/30 rounded-xl flex items-center justify-center mb-4">
              <div className="text-center text-muted-foreground">
                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Mapa do Brasil</p>
                <p className="text-xs">Cobertura de distribuição de sementes</p>
              </div>
            </div>

            <div className="flex gap-4 text-xs mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Excelente (≥97%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                Bom (94-96%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                Precisa de atenção (&lt;94%)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="font-medium">Centro-Oeste</p>
                <p className="text-muted-foreground">Desempenho: 98,5% | Sementes: 1,2 milhão</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="font-medium">Sudeste</p>
                <p className="text-muted-foreground">Desempenho: 95,8% | Sementes: 892 mil</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Atividade recente</h3>
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Atualizações ao vivo
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Feed em tempo real de atividades de distribuição e impacto na comunidade</p>

            <div className="space-y-4">
              {activityData.map((activity, idx) => (
                <div key={idx} className={cn(
                  "p-3 rounded-lg border-l-4",
                  activity.type === "success" ? "bg-emerald-50 border-l-emerald-500" : "bg-blue-50 border-l-blue-500"
                )}>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={16} className={activity.type === "success" ? "text-emerald-500" : "text-blue-500"} />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-card-foreground">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {activity.location}
                        {activity.quantity && (
                          <>
                            <span>|</span>
                            <Package size={12} />
                            {activity.quantity}
                          </>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] whitespace-nowrap px-2 py-1 rounded-full",
                      activity.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {activity.time.split(" ")[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-sm font-medium text-info hover:underline">
              Ver todos os alertas →
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-card-foreground">Arquivo de dados de transparência</h3>
              <p className="text-xs text-muted-foreground">Dados históricos abrangentes para pesquisa e prestação de contas</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">10 por página ▼</span>
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={14} />
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Data ▼</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Região</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Tipo de corte</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Sementes Distribuídas</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Sucesso na entrega</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Índice de qualidade</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Agricultores atendidos</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Tempo médio de entrega</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Conformidade</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 text-sm">{row.data}</td>
                    <td className="py-3 px-2 text-sm">{row.regiao}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className={cn(
                        "inline-flex items-center gap-1",
                        row.tipo === "Milho" ? "text-amber-600" : "text-emerald-600"
                      )}>
                        ● {row.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm">{row.sementes}</td>
                    <td className="py-3 px-2 text-sm">{row.sucesso}</td>
                    <td className="py-3 px-2 text-sm">
                      <div className="flex items-center gap-2">
                        {row.qualidade}
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: row.qualidade }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm">{row.agricultores}</td>
                    <td className="py-3 px-2 text-sm">{row.tempo}</td>
                    <td className="py-3 px-2 text-sm">
                      <span className={cn(
                        "status-badge",
                        row.status === "Compatível" ? "status-success" : "status-warning"
                      )}>
                        {row.status === "Compatível" ? "✓" : "⚠"} {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">Mostrando 1 a 10 de 12 entradas</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>← Anterior</Button>
              <Button variant="default" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Próximo →</Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-semibold text-card-foreground mb-3">Privacidade e segurança de dados</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Todas as informações pessoais são anonimizadas</li>
                <li>• Os dados individuais dos agricultores são agregados</li>
                <li>• Conformidade com regulamentos de proteção de dados</li>
                <li>• Auditorias e certificações de segurança regulares</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-card-foreground mb-3">Fontes de dados e verificação</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Sistema de gerenciamento de distribuição</li>
                <li>• Auditorias de qualidade de terceiros</li>
                <li>• Monitoramento independente de conformidade</li>
                <li>• Sistemas de feedback comunitário</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-card-foreground mb-3">Suporte e comentários</h4>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Perguntas sobre precisão dos dados</li>
                <li>• Melhorias de acessibilidade</li>
                <li>• Solicitações de dados adicionais</li>
                <li>• Oportunidades de envolvimento comunitário</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8 text-xs text-muted-foreground">
            © 2025 AgroIPA Analytics. Todos os direitos reservados. Dados fornecidos para fins de transparência e responsabilização pública.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Transparencia;
