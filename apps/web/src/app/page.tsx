"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

const Index = () => {
  const router = useRouter();
  const { userProfile, user } = useAuth();

  useEffect(() => {
    if (userProfile && user) {
      // Redirecionar baseado no role do usuário
      if (user.role === "teacher") {
        router.push("/teacher-dashboard");
      } else {
        router.push("/student-dashboard");
      }
    } else {
      router.push("/login");
    }
  }, [userProfile, user, router]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-light-gray-text">Carregando Personal Pocket...</p>
      </div>
    </div>
  );
};

export default Index;
