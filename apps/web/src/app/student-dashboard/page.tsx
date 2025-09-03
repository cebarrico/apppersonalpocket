"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { NavbarMobile } from "@/components/NavbarMobile";
import { UserProfile } from "@/components/UserProfile";
import { Spinner } from "@/components/ui/spinner";
import {
  Dumbbell,
  TrendingUp,
  Timer,
  Play,
  Activity,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const mockTodayWorkout = [
  {
    id: 1,
    exercise: "Supino Reto",
    sets: 4,
    reps: "10-12",
    weight: "80kg",
    completed: false,
    rest: "2 min",
  },
  {
    id: 2,
    exercise: "Agachamento",
    sets: 3,
    reps: "15",
    weight: "100kg",
    completed: false,
    rest: "90s",
  },
  {
    id: 3,
    exercise: "Remada Curvada",
    sets: 4,
    reps: "12",
    weight: "70kg",
    completed: false,
    rest: "2 min",
  },
];

const mockStats = {
  totalWorkouts: 24,
  completedThisWeek: 3,
  currentStreak: 5,
  nextGoal: "Perder 2kg",
};

type ActiveView = "dashboard" | "workouts" | "appointments" | "profile";

const StudentDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workoutItems, setWorkoutItems] = useState(mockTodayWorkout);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirecionar para login quando usuário fizer logout
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const toggleExerciseCompletion = (id: number) => {
    setWorkoutItems(
      workoutItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedExercises = workoutItems.filter(
    (item) => item.completed
  ).length;
  const totalExercises = workoutItems.length;

  // Renderizar conteúdo baseado na view ativa
  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-ice-white">Dashboard</h1>
                <p className="text-light-gray-text">
                  Bem-vindo de volta, {user?.full_name}!
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-light-gray border-light-gray">
                <CardHeader className="pb-3">
                  <CardTitle className="text-ice-white text-sm">
                    Total de Treinos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-aqua">
                    {mockStats.totalWorkouts}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-light-gray border-light-gray">
                <CardHeader className="pb-3">
                  <CardTitle className="text-ice-white text-sm">
                    Esta Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-aqua">
                    {mockStats.completedThisWeek}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-light-gray border-light-gray">
                <CardHeader className="pb-3">
                  <CardTitle className="text-ice-white text-sm">
                    Sequência Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-aqua">
                    {mockStats.currentStreak} dias
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-light-gray border-light-gray">
                <CardHeader className="pb-3">
                  <CardTitle className="text-ice-white text-sm">
                    Próxima Meta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-aqua font-semibold">
                    {mockStats.nextGoal}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Workout */}
            <Card className="bg-light-gray border-light-gray">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-ice-white flex items-center">
                    <Dumbbell className="h-5 w-5 mr-2 text-aqua" />
                    Treino de Hoje
                  </CardTitle>
                  <Badge className="bg-aqua/20 text-aqua border-aqua/50">
                    {completedExercises}/{totalExercises} completos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workoutItems.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={`p-4 rounded-lg border transition-all ${
                        exercise.completed
                          ? "bg-green-500/20 border-green-500/50"
                          : "bg-medium-blue-gray border-light-gray"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            variant={exercise.completed ? "default" : "outline"}
                            onClick={() =>
                              toggleExerciseCompletion(exercise.id)
                            }
                            className={
                              exercise.completed
                                ? "bg-green-500 hover:bg-green-600"
                                : "border-aqua text-aqua hover:bg-aqua/10"
                            }
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <div>
                            <h3 className="font-semibold text-ice-white">
                              {exercise.exercise}
                            </h3>
                            <p className="text-sm text-light-gray-text">
                              {exercise.sets} séries • {exercise.reps} reps •{" "}
                              {exercise.weight}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Timer className="h-4 w-4 text-light-gray-text" />
                          <span className="text-sm text-light-gray-text">
                            {exercise.rest}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-light-gray border-light-gray">
                <CardHeader>
                  <CardTitle className="text-ice-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-aqua" />
                    Histórico de Treinos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-light-gray-text mb-4">
                    Veja seus treinos anteriores e progresso
                  </p>
                  <Button
                    className="bg-aqua hover:bg-aqua-dark text-dark-teal"
                    onClick={() => setActiveView("workouts")}
                  >
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-light-gray border-light-gray">
                <CardHeader>
                  <CardTitle className="text-ice-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-aqua" />
                    Evolução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-light-gray-text mb-4">
                    Acompanhe seu progresso e evolução
                  </p>
                  <Button
                    className="bg-aqua hover:bg-aqua-dark text-dark-teal"
                    onClick={() => setActiveView("profile")}
                  >
                    Ver Evolução
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "workouts":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-ice-white">Meus Treinos</h1>
            <Card className="bg-light-gray border-light-gray">
              <CardContent className="p-6">
                <p className="text-light-gray-text">
                  Funcionalidade de treinos em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case "appointments":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-ice-white">Agendamentos</h1>
            <Card className="bg-light-gray border-light-gray">
              <CardContent className="p-6">
                <p className="text-light-gray-text">
                  Funcionalidade de agendamentos em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case "profile":
        return <UserProfile />;
      default:
        return null;
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
          // Filtrar apenas views válidas para o estudante
          if (
            ["dashboard", "workouts", "appointments", "profile"].includes(view)
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
            // Filtrar apenas views válidas para o estudante
            if (
              ["dashboard", "workouts", "appointments", "profile"].includes(
                view
              )
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

export default StudentDashboard;
