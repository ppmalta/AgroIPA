import { AlertTriangle, CheckCircle, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  location?: string;
  time: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Alerta de estoque baixo",
    description: "Inventário de milho no Centro de Processamento do Norte abaixo do limite de 50%",
    location: "Alto Bom Jesus, Serra Talhada",
    time: "há 15 min atrás",
  },
  {
    id: "2",
    type: "critical",
    title: "Envio atrasado",
    description: "Remessa #SH-2025-1205 atrasada em 2 horas devido às condições climáticas",
    location: "Rua Vlg. Tejo, Taquaritinga do Norte",
    time: "há 45 min atrás",
  },
  {
    id: "3",
    type: "success",
    title: "Processamento em lote concluído",
    description: "Processamento do lote de feijão #BT-2025-0892 concluído com sucesso",
    location: "Lagoa Nov. Surubim",
    time: "1 semana atrás",
  },
];

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    bgColor: "bg-red-50",
    borderColor: "border-l-red-500",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50",
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-500",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-emerald-50",
    borderColor: "border-l-emerald-500",
    iconColor: "text-emerald-500",
  },
};

export const AlertsPanel = () => {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-card-foreground">Alertas ao vivo</h3>
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ao vivo
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["Todos os alertas", "Crítico", "Aviso", "Ação necessária"].map((tab, idx) => (
          <button
            key={tab}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              idx === 0 
                ? "bg-accent text-accent-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {tab}
            {idx === 0 && <span className="ml-1 bg-accent-foreground/20 px-1.5 py-0.5 rounded text-[10px]">4</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {mockAlerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                "p-3 rounded-lg border-l-4",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className={config.iconColor} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-card-foreground">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.description}
                  </p>
                  {alert.location && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                      {alert.location}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {alert.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-sm font-medium text-info hover:underline">
        Ver todos os alertas →
      </button>
    </div>
  );
};
