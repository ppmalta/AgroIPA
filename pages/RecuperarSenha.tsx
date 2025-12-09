import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthInput } from "@/components/AuthInput";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const RecuperarSenha = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Informe seu email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulated password recovery - replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="auth-card animate-scale-in max-w-lg">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              Recuperação de senha
            </h1>
            <div className="h-px bg-border mt-4" />
          </div>

          {emailSent && (
            <div className="bg-success/20 text-success-foreground rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <CheckCircle className="text-success" size={20} />
              <span className="text-card-foreground">Email de recuperação enviado com sucesso</span>
            </div>
          )}

          <p className="text-muted-foreground text-sm leading-relaxed">
            Para recuperar a sua senha, informe seu endereço email de cadastro da
            sua conta que nós enviaremos um link para alteração da senha.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
            />

            <div className="flex flex-col items-center gap-3">
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="px-12"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar"}
              </Button>

              <button
                type="button"
                className="link-primary"
                onClick={() => navigate("/login")}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
