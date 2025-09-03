"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Calendar,
  Users,
  TrendingUp,
  LogOut,
  Dumbbell,
  User,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../../public/logo.png";
import { NotificationBell } from "./NotificationBell";
import { AppointmentModal } from "./AppointmentModal";
import { Badge } from "@/components/ui/badge";
import { useTodayAppointments } from "../hooks/use-appointments";
import { useSubscription } from "../hooks/use-subscription";

interface NavbarMobileProps {
  activeView: string;
  onViewChange: (
    view:
      | "dashboard"
      | "calendar"
      | "students"
      | "evolution"
      | "workouts"
      | "appointments"
      | "profile"
  ) => void;
}

export const NavbarMobile: React.FC<NavbarMobileProps> = ({
  activeView,
  onViewChange,
}) => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Hook para refresh dos appointments após criar novo
  const { refreshAppointments } = useTodayAppointments(user?.id || "");

  // Hook para buscar plano do usuário (apenas professores)
  const { currentPlan, loading: planLoading } = useSubscription(user?.id || "");

  // Redirecionar para login quando usuário fizer logout
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const menuItems =
    user?.role === "teacher"
      ? [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "calendar", label: "Calendário", icon: Calendar },
          { id: "addAppointment", label: "Agendar", icon: Plus },
          { id: "students", label: "Alunos", icon: Users },
          { id: "evolution", label: "Evolução", icon: TrendingUp },
        ]
      : [
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "workouts", label: "Treinos", icon: Dumbbell },
          { id: "appointments", label: "Agendamentos", icon: Calendar },
          { id: "profile", label: "Perfil", icon: User },
        ];

  const handleMenuItemClick = (
    view:
      | "dashboard"
      | "calendar"
      | "students"
      | "evolution"
      | "workouts"
      | "appointments"
      | "profile"
      | "addAppointment"
  ) => {
    if (view === "addAppointment") {
      setIsAppointmentModalOpen(true);
    } else {
      onViewChange(
        view as
          | "dashboard"
          | "calendar"
          | "students"
          | "evolution"
          | "workouts"
          | "appointments"
          | "profile"
      );
    }
  };

  const handleLogout = async () => {
    router.push("/login");
    await signOut();
  };

  return (
    <div className="xl:hidden mb-4">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-medium-blue-gray/95 backdrop-blur-sm border-b border-light-gray">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleMenuItemClick("dashboard")}
          >
            <div className="bg-aqua/10 p-2 rounded-xl">
              <Image src={logo} alt="logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-ice-white">
                Personal Pocket
              </h1>
            </div>
          </div>

          {/* User Avatar and Notifications */}
          <div className="flex items-center space-x-3">
            <NotificationBell
              userRole={user?.role === "teacher" ? "teacher" : "student"}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-aqua/20 hover:ring-aqua/40 transition-all duration-300">
                  <AvatarFallback className="bg-aqua/20 text-aqua">
                    {user?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-medium-blue-gray border-light-gray"
              >
                {/* Info do usuário no dropdown */}
                <div className="px-3 py-2 border-b border-light-gray">
                  <p className="text-sm font-medium text-ice-white">
                    {user?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-light-gray-text">
                    {user?.email || "email@exemplo.com"}
                  </p>
                  {/* Badge do plano - apenas para professores */}
                  {user?.role === "teacher" && !planLoading && (
                    <div className="mt-2">
                      <Badge
                        className={`text-xs px-2 py-0.5 ${currentPlan.color} `}
                        variant="secondary"
                      >
                        {currentPlan.displayName}
                      </Badge>
                    </div>
                  )}
                </div>

                <DropdownMenuItem
                  onClick={() => handleMenuItemClick("profile")}
                  className="text-ice-white hover:bg-light-gray/50 cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-coral-red hover:bg-coral-red/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-medium-blue-gray/95 backdrop-blur-sm border-t border-light-gray">
        <div className="flex items-center justify-around px-2 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isAddAppointment = item.id === "addAppointment";

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center justify-center transition-all duration-300 ${
                  isAddAppointment
                    ? "h-14 w-14 -mt-8 bg-aqua/85 hover:bg-aqua/90 text-ice-white  rounded-full shadow-lg relative z-50"
                    : isActive
                    ? "h-12 w-12 p-2 rounded-xl bg-aqua/20 text-aqua"
                    : "h-12 w-12 p-2 rounded-xl text-light-gray-text hover:text-ice-white hover:bg-light-gray/50"
                }`}
                onClick={() =>
                  handleMenuItemClick(
                    item.id as
                      | "dashboard"
                      | "calendar"
                      | "students"
                      | "evolution"
                      | "workouts"
                      | "appointments"
                      | "profile"
                      | "addAppointment"
                  )
                }
              >
                <Icon
                  className={
                    isAddAppointment
                      ? "!h-5 !w-5 !min-h-[1.5rem] !min-w-[1.5rem]"
                      : "h-5 w-5"
                  }
                />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Modal de Appointment - apenas para teachers */}
      {user?.role === "teacher" && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          onSuccess={() => {
            refreshAppointments();
            setIsAppointmentModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
