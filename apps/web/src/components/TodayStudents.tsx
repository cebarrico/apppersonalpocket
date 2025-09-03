import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Clock, Calendar, User, AlertCircle, Plus } from "lucide-react";
import { DashboardStats } from "@/components/DashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { useTodayAppointments } from "@/hooks/use-appointments";
import { AppointmentModal } from "@/components/AppointmentModal";
import { StudentWorkoutViewModal } from "@/components/StudentWorkoutViewModal";
import { Button } from "@/components/ui/button";

export const TodayStudents = () => {
  const { user } = useAuth();
  const { appointments, loading, error, refreshAppointments } =
    useTodayAppointments(user?.id || "");
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Estados para o modal de visualização de treinos
  const [isWorkoutViewModalOpen, setIsWorkoutViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
    date: string;
    appointmentId: string;
  } | null>(null);

  const formatTime = (time: string | null) => {
    if (!time) return "Horário não definido";

    // Se o time já está no formato HH:MM
    if (time.includes(":")) {
      return time.slice(0, 5); // Pega apenas HH:MM
    }

    // Se for um timestamp completo
    return new Date(time).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "scheduled":
        return "bg-aqua/20 text-aqua border-aqua/50";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "missed":
        return "bg-coral-red/20 text-coral-red border-coral-red/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "scheduled":
        return "Agendado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      case "missed":
        return "Falta";
      default:
        return "Desconhecido";
    }
  };

  // Função para abrir modal de visualização de treinos
  const handleCardClick = (appointment: {
    id: string;
    student?: { id?: string; full_name?: string } | null;
    date: string;
  }) => {
    setSelectedStudent({
      id: appointment.student?.id || "",
      name: appointment.student?.full_name || "Usuário",
      date: appointment.date,
      appointmentId: appointment.id,
    });
    setIsWorkoutViewModalOpen(true);
  };

  // Função para fechar modal de treinos
  const closeWorkoutViewModal = () => {
    setIsWorkoutViewModalOpen(false);
    setSelectedStudent(null);
  };

  // Calcular estatísticas
  const agendados = appointments.filter(
    (app) => app.status === "scheduled"
  ).length;
  const concluidos = appointments.filter(
    (app) => app.status === "completed"
  ).length;
  const faltas = appointments.filter(
    (app) => app.status === "missed" || app.status === "cancelled"
  ).length;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ice-white mb-2">
              Treinos de Hojes
            </h1>
            <p className="text-light-gray-text">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="bg-dark-teal/80 border border-light-gray/30 rounded-lg p-12 text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ice-white mb-2">
            Carregando agendamentos
          </h3>
          <p className="text-light-gray-text">
            Buscando treinos agendados para hoje...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ice-white mb-2">
              Treinos de Hoje
            </h1>
            <p className="text-light-gray-text">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="bg-dark-teal/80 border border-red-500/30 rounded-lg p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ice-white mb-2">
            Erro ao carregar agendamentos
          </h3>
          <p className="text-light-gray-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ice-white mb-2 ">
            Treinos de Hoje
          </h1>
          <p className="text-light-gray-text">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <DashboardStats
        agendados={agendados}
        concluidos={concluidos}
        faltas={faltas}
      />

      {/* Appointments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ice-white">
            <Clock className="h-5 w-5 text-aqua" />
            Cronograma do Dia
          </h2>
          <Button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="bg-aqua hover:bg-aqua/80 text-dark-teal"
          >
            <Plus className="h-4 w-4 " />
            <span className="hidden sm:inline">Novo Agendamento</span>
          </Button>
        </div>
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="bg-gradient-to-r from-light-gray to-light-gray/80 border-aqua hover:border-aqua/50 transition-all duration-300 hover:scale-101 cursor-pointer aqua-glow group"
              onClick={() => handleCardClick(appointment)}
            >
              <CardContent className="p-4">
                {/* Layout responsivo */}
                <div className="sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    {/* Time indicator */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="bg-aqua/20 text-aqua px-2 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                        {formatTime(appointment.time)}
                      </div>
                      <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-aqua/40 to-transparent mt-2" />
                    </div>

                    {/* Student info */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-aqua/20 group-hover:ring-aqua/40 transition-all duration-300 flex-shrink-0">
                        <AvatarImage
                          src={appointment.student?.avatar_url || ""}
                          alt={appointment.student?.full_name || "Usuário"}
                        />
                        <AvatarFallback className="bg-aqua/20 text-aqua font-semibold">
                          <User className="h-5 w-5 sm:h-6 sm:w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-ice-white text-base sm:text-lg group-hover:text-aqua transition-colors duration-300 truncate">
                          {appointment.student?.full_name ||
                            "Nome não disponível"}
                        </CardTitle>
                        <div className="text-light-gray-text text-xs sm:text-sm mt-1">
                          <div className="sm:flex sm:items-center">
                            <span className="block sm:inline">
                              Treino personalizado
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge e arrow - layout responsivo */}
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-3 pl-16 sm:pl-0">
                    <Badge
                      className={`${getStatusColor(
                        appointment.status
                      )} flex items-center gap-1 text-xs whitespace-nowrap flex-shrink-0`}
                    >
                      {getStatusText(appointment.status)}
                    </Badge>
                    <div className="text-light-gray-text group-hover:text-aqua transition-colors duration-300 flex-shrink-0">
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {appointments.length === 0 && (
        <div className="bg-dark-teal/80 border border-light-gray/30 rounded-lg p-12 text-center">
          <Calendar className="h-12 w-12 text-light-gray-text mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ice-white mb-2">
            Nenhum treino agendado
          </h3>
          <p className="text-light-gray-text">
            Não há treinos agendados para hoje.
          </p>
        </div>
      )}

      {/* Modal de Criação de Agendamento */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSuccess={() => {
          refreshAppointments();
          setIsAppointmentModalOpen(false);
        }}
      />

      {/* Modal de Visualização de Treinos */}
      {selectedStudent && (
        <StudentWorkoutViewModal
          isOpen={isWorkoutViewModalOpen}
          onClose={closeWorkoutViewModal}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          appointmentDate={selectedStudent.date}
          appointmentId={selectedStudent.appointmentId}
          onStatusUpdate={refreshAppointments}
        />
      )}
    </div>
  );
};
