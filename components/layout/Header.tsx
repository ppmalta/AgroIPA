import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User size={18} className="text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-secondary-foreground">Usuário</span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer">
            <User size={16} className="mr-2" />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings size={16} className="mr-2" />
            Ajustes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
