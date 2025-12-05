import { NavLink, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Leaf, 
  ClipboardList,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { path: "/inventario", label: "Inventário", icon: Package },
  { path: "/distribuicao", label: "Distribuição", icon: Truck },
  { path: "/solicitar-sementes", label: "Solicitar sementes", icon: Leaf },
  { path: "/cadastrar-estoque", label: "Cadastrar Estoque", icon: ClipboardList },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-6">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-link group",
                isActive && "sidebar-link-active"
              )}
            >
              <Icon size={20} className={cn(
                "transition-colors",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
              )} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight size={16} className="text-sidebar-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          © 2025 AgroIPA Analytics
        </p>
      </div>
    </aside>
  );
};
