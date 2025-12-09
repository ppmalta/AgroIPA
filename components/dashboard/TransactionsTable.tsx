import { Eye, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  lote: string;
  tipo: "remessa" | "recibo" | "transferência" | "processamento";
  quantidade: string;
  cultura: string;
  rota: string;
  estado: "EM TRÂNSITO" | "CONCLUÍDO" | "PROCESSAMENTO" | "ENTREGUE";
  hora: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "TXN-2025-1205",
    lote: "BT-2025-0892",
    tipo: "remessa",
    quantidade: "2.500 unidades",
    cultura: "milho",
    rota: "Hub de Distribuição Central → Distribuidor Regional A",
    estado: "EM TRÂNSITO",
    hora: "30m atrás",
  },
  {
    id: "TXN-2025-1205",
    lote: "BT-2025-0892",
    tipo: "recibo",
    quantidade: "1.800 unidades",
    cultura: "feijão",
    rota: "Fornecedor Farm Co. → Instalação de Sementes Orientais",
    estado: "CONCLUÍDO",
    hora: "há 2h",
  },
  {
    id: "TXN-2025-1203",
    lote: "BT-2025-0890",
    tipo: "transferência",
    quantidade: "3.200 unidades",
    cultura: "milho",
    rota: "Centro de Processamento do Norte → Hub de Distribuição Central",
    estado: "CONCLUÍDO",
    hora: "há 3h",
  },
  {
    id: "TXN-2025-1202",
    lote: "BT-2025-0889",
    tipo: "processamento",
    quantidade: "1.500 unidades",
    cultura: "feijão",
    rota: "Armazenamento bruto → Linha de Processamento 2",
    estado: "PROCESSAMENTO",
    hora: "há 5h",
  },
  {
    id: "TXN-2025-1201",
    lote: "BT-2025-0888",
    tipo: "remessa",
    quantidade: "4.100 unidades",
    cultura: "milho",
    rota: "Ponto de Distribuição Sul → Cadeia de Varejo B",
    estado: "ENTREGUE",
    hora: "há 6h",
  },
];

const statusConfig = {
  "EM TRÂNSITO": "status-warning",
  "CONCLUÍDO": "status-success",
  "PROCESSAMENTO": "status-info",
  "ENTREGUE": "status-success",
};

const tipoIcons: Record<string, string> = {
  remessa: "📦",
  recibo: "📥",
  transferência: "🔄",
  processamento: "⚙️",
};

export const TransactionsTable = () => {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-card-foreground">Transações recentes</h3>
        <span className="text-xs text-muted-foreground">
          Última atualização: 00:43:47 🔄
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Transação ↕</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Tipo ↕</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Colheita & Quantidade</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Rota</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Estado ↕</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Hora ↕</th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Ações ↕</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-2">
                  <div className="text-sm font-medium text-card-foreground">{tx.id}</div>
                  <div className="text-xs text-muted-foreground">Lote: {tx.lote}</div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{tipoIcons[tx.tipo]}</span>
                    {tx.tipo}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">🌾</span> {tx.quantidade}
                  </div>
                  <div className="text-xs text-muted-foreground">{tx.cultura}</div>
                </td>
                <td className="py-3 px-2 max-w-xs">
                  <div className="text-sm text-card-foreground truncate">{tx.rota}</div>
                </td>
                <td className="py-3 px-2">
                  <span className={cn("status-badge", statusConfig[tx.estado])}>
                    {tx.estado}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-muted-foreground">{tx.hora}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                      <Eye size={16} className="text-muted-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                      <MoreHorizontal size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Mostrando 5 transações recentes
        </span>
        <button className="text-sm font-medium text-info hover:underline">
          Ver todas as transações →
        </button>
      </div>
    </div>
  );
};
