import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { AuthInput } from "@/components/AuthInput";
import { Button } from "@/components/ui/button";
import { User, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulated login - replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="auth-card animate-scale-in">
        <form onSubmit={handleLogin} className="flex flex-col items-center space-y-6">
          <Logo size="md" />
          
          <div className="w-full space-y-4 mt-4">
            <AuthInput
              label="Usuário"
              type="email"
              placeholder="Usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<User size={20} />}
            />

            <AuthInput
              label="Senha"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="w-full flex justify-between items-center text-sm">
            <button
              type="button"
              className="link-primary"
              onClick={() => navigate("/recuperar-senha")}
            >
              Esqueceu a senha?
            </button>
            <button
              type="button"
              className="link-primary"
              onClick={() => navigate("/cadastro")}
            >
              Cadastrar
            </button>
          </div>

          <Button
            type="submit"
            size="xl"
            className="w-full max-w-xs"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="mt-6"
        onClick={() => navigate("/transparencia")}
      >
        Acessar Painel Público
      </Button>
    </div>
  );
};

export default Login;
