import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Distribuicao from "./pages/Distribuicao";
import SolicitarSementes from "./pages/SolicitarSementes";
import CadastrarEstoque from "./pages/CadastrarEstoque";
import Transparencia from "./pages/Transparencia";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/distribuicao" element={<Distribuicao />} />
          <Route path="/solicitar-sementes" element={<SolicitarSementes />} />
          <Route path="/cadastrar-estoque" element={<CadastrarEstoque />} />
          <Route path="/transparencia" element={<Transparencia />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
