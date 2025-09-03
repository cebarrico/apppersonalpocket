"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { Mail, Lock, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RegisterModal } from "@/components/RegisterModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { signIn, user, loading } = useAuth();
  const router = useRouter();

  // Redirecionar usuário autenticado
  useEffect(() => {
    if (!loading && user) {
      const dashboard =
        user.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard";
      router.push(dashboard);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Usar signIn do AuthContext para manter compatibilidade
      const result = await signIn(email, password);

      if (result.error) {
        toast({
          title: "Erro no login",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo!",
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar loading enquanto verifica sessão
  if (loading) {
    console.log(loading);
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-ice-white">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-aqua/10 p-2 rounded-xl">
              <Image src={logo} alt="logo" className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-ice-white mb-2">
            Personal Pocket
          </h1>
          <p className="text-light-gray-text">Seu treino, nossa dedicação</p>
        </div>

        <Card className="bg-light-gray/50 backdrop-blur-sm border-light-gray aqua-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-ice-white">Entrar</CardTitle>
            <CardDescription className="text-light-gray-text">
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-ice-white">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-ice-white">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-aqua hover:bg-aqua-dark text-dark-teal font-semibold py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Carregando..." : "Entrar"}
              </Button>
            </form>

            {/* Alternativa com Server Action */}

            {/* Botão de Cadastro */}
            <div className="text-center mt-6">
              <p className="text-light-gray-text text-sm mb-3">
                Não possui uma conta?
              </p>
              <Button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="w-full bg-transparent border-2 border-aqua text-aqua hover:bg-aqua hover:text-dark-teal transition-all duration-200 font-semibold py-2.5"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Registro */}
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Login;
