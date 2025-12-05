import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { AuthInput } from "@/components/AuthInput";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.senha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulated registration - replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!",
      });
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="auth-card animate-scale-in">
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-5">
          <Logo size="md" />
          
          <div className="w-full space-y-4 mt-2">
            <AuthInput
              label="Nome"
              type="text"
              placeholder="Seu nome completo"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              icon={<User size={20} />}
            />

            <AuthInput
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              icon={<Mail size={20} />}
            />

            <AuthInput
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={formData.senha}
              onChange={(e) => handleChange("senha", e.target.value)}
            />

            <AuthInput
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              value={formData.confirmarSenha}
              onChange={(e) => handleChange("confirmarSenha", e.target.value)}
            />
          </div>

          <button
            type="button"
            className="link-primary self-start"
            onClick={() => navigate("/login")}
          >
            Fazer Login
          </button>

          <Button
            type="submit"
            size="xl"
            className="w-full max-w-xs"
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Criar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
