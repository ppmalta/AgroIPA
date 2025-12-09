import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="auth-card animate-scale-in">
        <div className="flex flex-col items-center space-y-8">
          <Logo size="lg" />
          
          <div className="w-full space-y-4 mt-6">
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-center gap-3"
              onClick={() => navigate("/login")}
            >
              <User size={20} />
              Acesso Interno
            </Button>

            <Button
              variant="link"
              size="lg"
              className="w-full justify-center text-info"
              onClick={() => navigate("/transparencia")}
            >
              Portal de Transparência
            </Button>

            <Button
              variant="default"
              size="lg"
              className="w-full justify-center gap-3"
              onClick={() => navigate("/login")}
            >
              <Users size={20} />
              Acesso Externo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
