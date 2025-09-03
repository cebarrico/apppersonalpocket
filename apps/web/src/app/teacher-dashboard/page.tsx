"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NavbarMobile } from "@/components/NavbarMobile";
import { Calendar } from "@/components/Calendar";
import { StudentsList } from "@/components/StudentsList";
import { TodayStudents } from "@/components/TodayStudents";
import { StudentProfile } from "@/components/StudentProfile";
import { EvolutionCharts } from "@/components/EvolutionCharts";
import { UserProfile } from "@/components/UserProfile";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type ActiveView =
  | "dashboard"
  | "calendar"
  | "students"
  | "evolution"
  | "profile";

const TeacherDashboard = () => {
  const { loading } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveView("students");
  };

  const handleBackToStudents = () => {
    setSelectedStudentId(null);
  };

  // Renderizar conteúdo baseado na view ativa
  const renderContent = () => {
    if (selectedStudentId) {
      return (
        <StudentProfile
          studentId={selectedStudentId}
          onBack={handleBackToStudents}
        />
      );
    }

    switch (activeView) {
      case "dashboard":
        return <TodayStudents />;
      case "calendar":
        return <Calendar />;
      case "students":
        return <StudentsList onSelectStudent={handleStudentSelect} />;
      case "evolution":
        return <EvolutionCharts />;
      case "profile":
        return <UserProfile />;
      default:
        return <TodayStudents />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-light-gray-text">Carregando Personal Pocket...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen gradient-bg">
      {/* NavbarMobile para telas até 1279px */}
      <NavbarMobile
        activeView={activeView}
        onViewChange={(view) => {
          // Filtrar apenas views válidas para o professor
          if (
            [
              "dashboard",
              "calendar",
              "students",
              "evolution",
              "profile",
            ].includes(view)
          ) {
            setActiveView(view as ActiveView);
          }
        }}
      />

      {/* Mobile Header - apenas para telas xl que usam sidebar */}
      <div className="xl:hidden hidden bg-medium-blue-gray border-b border-light-gray p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ice-white">
            Personal Pocket
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-light-gray-text hover:text-ice-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - apenas para telas xl+ */}
        <Sidebar
          activeView={activeView}
          onViewChange={(view) => {
            // Filtrar apenas views válidas para o professor
            if (
              [
                "dashboard",
                "calendar",
                "students",
                "evolution",
                "profile",
              ].includes(view)
            ) {
              setActiveView(view as ActiveView);
            }
          }}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 xl:ml-64 xl:p-6 pt-20 pb-24 xl:pt-6 xl:pb-6 p-4 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
