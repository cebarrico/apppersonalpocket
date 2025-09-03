import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "teacher" | "student";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  role,
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!loading && user && role && user.role !== role) {
      const correctDashboard =
        user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
      navigate(correctDashboard, { replace: true });
    }
  }, [user, loading, role, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-ice-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
